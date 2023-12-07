import { OpenAI } from 'openai';
import { queryPinecone } from './pinecone';
import { Pinecone } from '@pinecone-database/pinecone';
import * as dotenvPackage from 'dotenv';
dotenvPackage.config();

const openAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const createEmbedding = async (input: string) => {
  const embeddingRes = await openAi.embeddings.create({
    model: 'text-embedding-ada-002',
    input,
  });

  const [{ embedding }] = embeddingRes.data;
  return embedding;
};

const queryLLM = async (
  messages: any[],
  model: string,
  temperature: number,
  jsonMode?: boolean
) => {
  let response;
  try {
    response = await openAi.chat.completions.create({
      model: model,
      messages: messages,
      max_tokens: 4096,
      temperature: temperature,
      seed: 1337,
      response_format: {
        type: jsonMode ? 'json_object' : 'text',
      },
    });
  } catch (e) {
    throw e;
  }

  return response;
};

const augmentAndQueryLLM = async (
  userQuestion: string,
  chunks: string[],
  model: string,
  systemMsg: string
) => {
  const messages: any[] = chunks.map((chunk) => ({
    role: 'user',
    content: chunk,
  }));

  messages.push({
    role: 'user',
    content: userQuestion,
  });

  messages.push({
    role: 'system',
    content: systemMsg,
  });
  console.log('systemMSG', systemMsg);
  console.log('userwst', userQuestion);
  console.log('embed', chunks);

  // 0.45 temperature makes the output creative
  return queryLLM(messages, model, 0.45);
};

const retrieveDocsAndQueryLLM = async (
  prompt: string,
  queryStr: string,
  model: string,
  systemMsg: string,
  pineconeClient: Pinecone
) => {
  const queryEmbedding = await createEmbedding(queryStr);
  try {
    const chunksResponse = await queryPinecone(queryEmbedding, pineconeClient);
    let chunks: string[] = [];
    if (chunksResponse.data) {
      chunks =
        chunksResponse.data.matches?.map(
          (chunk: any) => chunk.metadata.content
        ) || [];
    }
    return augmentAndQueryLLM(prompt, chunks, model, systemMsg).then(
      (response) => {
        return response.choices[0].message.content || '';
      }
    );
  } catch (error) {
    throw `Error in retrieveDocsAndQueryLLM: ${error}`;
  }
};

export { createEmbedding, queryLLM, retrieveDocsAndQueryLLM };
