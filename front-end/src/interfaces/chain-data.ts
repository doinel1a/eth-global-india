/* eslint-disable semi */

export default interface IChainData {
  _id: string;
  id: string;
  chainName: string;
  chainLogoURL: string;
  ai: IAI;
  env: IEnvironment;
  ethereumTemplates?: IEthereumTemplate;
}

interface IAI {
  model: string;
  query: string;
  queryJS?: string;
  queryCode: string;
  queryCodeJS?: string;
}

interface IEnvironment {
  pineconeEnv: string;
  pineconeJSEnv?: string;
  pineconeApiKey: string;
  pineconeApiJSKey?: string;
}

interface IEthereumTemplate {
  base: string;
  token: string;
  staking: string;
  nft: string;
  marketplace: string;
  launchpad: string;
}
