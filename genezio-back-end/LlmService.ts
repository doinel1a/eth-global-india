import dotenv from 'dotenv';
import axios from 'axios';
import mongoose from 'mongoose';
import Chain from './models/ChainModel';
import ChainAudit from './models/ChainAuditsModel';
import { queryLLM, retrieveDocsAndQueryLLM } from './openaihelper';
import { initPineconeClient } from './pinecone';
import Ajv from 'ajv';

dotenv.config();

export class LlmService {
	constructor() {
		this.#connect();
	}
	#connect() {
		mongoose.connect(process.env.MONGO_DB_URI || '').catch((error) => {
			console.log('Error connecting to the DB', error);
		});
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
			'Your function is to parse and interpret user requests specifically for smart contract development. You must generate code snippets or complete smart contract code exclusively, without any explanatory or conversational text. Focus on the user-provided elements and examples to tailor the smart contract code precisely to their requirements. Be sure every smartcontract generated contains the correct events, modifiers, struct, functions, libraries and all the necessary logic parts. Use openzeppelin libraries when possible. Be sure onlyOwner functions have the correct modifier.';

		const data = await retrieveDocsAndQueryLLM(
			updatedStr,
			reqData.description,
			model,
			systemMsg,
			pinecone
		);

		// Declare this in separate function @ravirasadiya @thedefibuilder
		const dynamicCodeMatch = new RegExp(
			`\`\`\`${queryCode}([\\s\\S]*?)\`\`\``,
			'g'
		);

		const solidityCodeMatch = dynamicCodeMatch.exec(data);
		const solidityCode = solidityCodeMatch ? solidityCodeMatch[1].trim() : null;
		if (solidityCode) {
			return solidityCode;
		} else {
			return data;
		}
	}

	// TODO: get language as parameter and match endpoint
	async buildCode(prompt: string) {
		const buildResponse = await axios.post(
			'https://ai-build-api.defibuilder.com/api/v1/fuel',
			{ code: prompt },
			{
				headers: {
					'X-API-KEY': process.env.X_API_KEY,
				},
			}
		);

		return buildResponse.data.status;
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
