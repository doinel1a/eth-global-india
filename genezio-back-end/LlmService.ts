import dotenv from 'dotenv';
import axios from 'axios';
import mongoose from 'mongoose';
import Chain from './models/ChainModel';
import ChainAudit from './models/ChainAuditsModel';
import { queryLLM, retrieveDocsAndQueryLLM } from './openaihelper';
import { initPineconeClient } from './pinecone';
import Ajv from 'ajv';

dotenv.config();

export type BuildResponseWithCode = {
	success: boolean;
	message: string;
	artifact: any; // Hardhat Artifact
	code: string;
};

export class LlmService {
	constructor() {
		this.#connect();
	}

	#connect() {
		mongoose.connect(process.env.MONGO_DB_URI || '').catch((error) => {
			console.log('Error connecting to the DB', error);
		});
	}

	private trimCode(code: string, language: string) {
		const dynamicCodeMatch = new RegExp(
			`\`\`\`${language}([\\s\\S]*?)\`\`\``,
			'g'
		);

		const codeMatch = dynamicCodeMatch.exec(code);

		return codeMatch ? codeMatch[1].trim() : code;
	}

	async getAllChains() {
		return await Chain.find({});
	}

	async callGeneratorLLM(
		prompt: string,
		activeChainId: string,
		extraFlag?: string
	) {
		const reqData = JSON.parse(prompt); // TODO: use types
		const chainData = await Chain.findOne({ id: activeChainId });

		if (!chainData) throw new Error('Chain not found');

		let { queryCode, query: queryStr, model } = chainData;

		if (extraFlag === 'near_js') {
			const { queryCode_js, query_js }: any = chainData;
			queryCode = queryCode_js;
			queryStr = query_js;
		}

		const pinecone = await initPineconeClient(chainData, extraFlag);

		const requirementsStr = reqData.functionalRequirements.join(', ');

		// Fetch the template based on the contract type and chain data
		const contractType = reqData.contractType;
		const contractTemplateField = `${contractType}_template`; // Construct the field name
		const contract_example =
			chainData[contractTemplateField as keyof typeof chainData] ||
			chainData.base_template;

		const updatedStr = queryStr
			.replace('requirementsStr_defibuilder', requirementsStr)
			.replace('description_defibuilder', reqData.description)
			.replace('contract_type_defibuilder', reqData.contractType)
			.replace('contract_example_defibuilder', contract_example);

		const systemMsg =
			'Your function is to parse and interpret user requests specifically for smart contract development. You must generate complete smart contract code exclusively, without any explanatory or conversational text and placeholder comments. Focus on the user-provided examples to tailor the smart contract code precisely to their requirements. Be sure every smartcontract generated contains the correct events, modifiers, struct, functions, libraries and all the necessary logic parts. Use openzeppelin libraries when possible. Be sure onlyOwner functions have the correct modifier. Use pragma 0.8.19 everytime. Do not use SafeMath functions or library. Always generate only one smart contract of provided type per request. ';

		const returnedCode = await retrieveDocsAndQueryLLM(
			updatedStr,
			reqData.description,
			model,
			systemMsg,
			pinecone
		);

		return this.trimCode(returnedCode, 'solidity');
	}

	// TODO: Fix return type - Compiler service does not return a field named 'code';
	async buildCode(
		chain: 'fuel' | 'multiversx' | 'solidity',
		smartContractCode: string
	): Promise<BuildResponseWithCode> {
		const buildResponse = await axios.post(
			`https://compiler-service.defibuilder.com/api/v1/${chain}`,
			{ code: smartContractCode },
			{
				headers: {
					'X-API-KEY': process.env.X_API_KEY,
				},
			}
		);

		return buildResponse.data;
	}

	async buildCodeAndResolve(
		chain: 'fuel' | 'multiversx' | 'solidity',
		smartContractCode: string,
		maxTries = 3
	): Promise<BuildResponseWithCode> {
		console.log('FEEDBACK - ATTEMPT', maxTries);

		const buildResponse = await this.buildCode(chain, smartContractCode);

		if (maxTries === 0 || buildResponse.success) {
			return { ...buildResponse, code: smartContractCode };
		} else {
			const newSmartContractCode = await this.callBuildResolverLLM(
				smartContractCode,
				buildResponse.message
			);

			return await this.buildCodeAndResolve(
				chain,
				newSmartContractCode,
				maxTries - 1
			);
		}
	}

	async callBuildResolverLLM(code: string, compilerError: string) {
		const systemMsg =
			'Your task is to resolve compiler errors from the provided Solidity code. You must generate complete smart contract code exclusively without any explanatory or conversational text. You must not change any other parts of the code that are not related to solving the compiler error. You must provide back full code that compiles, not only the parts that need to be fixed.';
		const prompt = `Resolve the following compiler error "${compilerError}" from the following Solidity code: \n ${code}`;

		const builderResponse = await queryLLM(
			[
				{
					role: 'system',
					content: systemMsg,
				},
				{
					role: 'user',
					content: prompt,
				},
			],
			'gpt-4-1106-preview',
			0.2
		);

		const returnCode = builderResponse.choices[0].message.content || '';

		return this.trimCode(returnCode, 'solidity');
	}

	async callAuditorLLM(code: string) {
		const auditSchema = {
			type: 'object',
			properties: {
				audits: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							severity: {
								type: 'string',
								enum: ['High', 'Medium', 'Low'],
							},
							description: { type: 'string' },
						},
						required: ['severity', 'description'],
					},
				},
			},
			required: ['audits'],
		};

		const prompt = `Generate a smart contract auditing report in JSON format according to this schema ${JSON.stringify(
			auditSchema
		)} given the following code: \n ${code}`;
		const systemMsg = `Your task is to analyze and assess smart contracts for auditing purposes.`;
		const auditorModel = 'ft:gpt-3.5-turbo-1106:personal::8Pw67TV2';

		const auditResponse = await queryLLM(
			[
				{
					role: 'system',
					content: systemMsg,
				},
				{
					role: 'user',
					content: prompt,
				},
			],
			auditorModel,
			0, // low temperature makes output stable
			true
		);

		const parsedResponse = JSON.parse(
			auditResponse.choices[0].message.content || '{}'
		);

		const validateSchema = new Ajv().compile(auditSchema);

		if (!validateSchema(parsedResponse)) {
			return { audits: [] };
		}

		return parsedResponse;
	}
}
