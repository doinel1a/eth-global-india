import { Schema, model } from 'mongoose';

interface IChain {
  id: string;
  chain_name: string;
  chain_logo: string;
  PINECONE_ENV: string;
  PINECONE_API_KEY: string;
  query: string;
  queryCode: string;
  model: string;
  query_js?: string;
  queryCode_js?: string;
  PINECONE_JS_ENV?: string;
  PINECONE_API_JS_KEY?: string;
  base_template?: string;
  token_template?: string;
  nft_template?: string;
  staking_template?: string;
  farm_template?: string;
  marketplace_template?: string;
  launchpad_template?: string;

}

const ChainSchema = new Schema<IChain>({
  id: { type: String, required: true },
  chain_name: { type: String, required: true },
  chain_logo: { type: String, required: true },
  PINECONE_ENV: { type: String, required: true },
  PINECONE_API_KEY: { type: String, required: true },
  model: { type: String, required: true },
  query: { type: String, required: true },
  queryCode: { type: String, required: true },
  query_js: { type: String, required: false },
  queryCode_js: { type: String, required: false },
  PINECONE_JS_ENV: { type: String, required: false },
  PINECONE_API_JS_KEY: { type: String, required: false },
  base_template: {type: String, required: false},
  token_template: {type: String, required: false},
  nft_template: {type: String, required: false},
  staking_template: {type: String, required: false},
  farm_template: {type: String, required: false},
  marketplace_template: {type: String, required: false},
  launchpad_template: {type: String, required: false},


});

export default model<IChain>('Chain', ChainSchema);
