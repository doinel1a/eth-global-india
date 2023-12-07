import { Pinecone } from '@pinecone-database/pinecone';
import { v4 as uuid } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

export const upsert = async (
  data: {
    content: string;
    content_tokens: any;
    embedding: number[];
  },
  chainData: any,
  extraFlag?: string
): Promise<any> => {
  const pinecone = await initPineconeClient(chainData, extraFlag);

  const index = pinecone.Index('article');
  const { content, content_tokens, embedding } = data;

  try {
    const upsertResponse = await index.upsert([
      {
        id: uuid(),
        values: embedding,
        metadata: {
          content,
          content_tokens,
        },
      },
    ]);
    return upsertResponse;
  } catch (err) {
    return err;
  }
};

export const initPineconeClient = async (
  chainData: any,
  extraFlag?: string
) => {
  const pinecone = new Pinecone({
    environment:
      chainData.id === '3' && extraFlag == 'near_js'
        ? chainData.PINECONE_JS_ENV || ''
        : chainData.PINECONE_ENV,
    apiKey:
      chainData.id === '3' && extraFlag == 'near_js'
        ? chainData.PINECONE_API_JS_KEY || ''
        : chainData.PINECONE_API_KEY,
  });

  return pinecone;
};

export const queryPinecone = async (embed: number[], pinecone: Pinecone) => {
  const index = pinecone.Index('article');

  try {
    const response = await index.query({
      vector: embed,
      topK: 10,
      includeValues: false,
      includeMetadata: true,
    });

    return { data: response };
  } catch (err) {
    return { error: err };
  }
};
