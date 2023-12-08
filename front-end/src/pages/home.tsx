import type { Reducer } from 'react';

import React, { useEffect, useReducer } from 'react';

import ChainSelectorSection from '@/components/sections/chain-selector';
import SmartContractCustomisationsSection from '@/components/sections/smart-contract-customisations';
import EReducerState from '@/constants/reducer-state';
import IChainData from '@/interfaces/chain-data';
import { chainsDataInitialState, chainsDataReducer, IAction, TState } from '@/reducers/chains-data';
import { LlmService } from '@/sdk/llmService.sdk';

export default function HomePage() {
  const [state, dispatch] = useReducer<Reducer<TState, IAction>>(
    chainsDataReducer,
    chainsDataInitialState
  );

  useEffect(() => {
    async function getAllChainsData() {
      dispatch({ state: EReducerState.start, payload: [] });

      try {
        const chainsDataResponse = await LlmService.getAllChains();

        if (chainsDataResponse && Array.isArray(chainsDataResponse)) {
          const mappedChainsData: IChainData[] = [];

          for (const data of chainsDataResponse) {
            const mappedChainData = mapDataResponseToChain(data);

            if (mappedChainData) {
              mappedChainsData.push(mappedChainData);
            }
          }

          dispatch({ state: EReducerState.success, payload: mappedChainsData });
        }
      } catch (error) {
        if (error instanceof Error) {
          dispatch({ state: EReducerState.error, payload: [] });

          console.error('ERROR GETTING ALL CHAINS DATA', error);
        }
      }
    }

    getAllChainsData();
  }, []);

  return (
    <div className='flex w-full max-w-[1200px] flex-col gap-y-6'>
      <ChainSelectorSection isChainsDataLoading={state.isLoading} chainsData={state.chainsData} />
      <SmartContractCustomisationsSection chainsData={state.chainsData} />
    </div>
  );
}

function mapDataResponseToChain(data: unknown) {
  /* Near chain */
  if (
    data &&
    typeof data === 'object' &&
    '_id' in data &&
    typeof data._id === 'string' &&
    'id' in data &&
    typeof data.id === 'string' &&
    'chain_name' in data &&
    typeof data.chain_name === 'string' &&
    'chain_logo' in data &&
    typeof data.chain_logo === 'string' &&
    'model' in data &&
    typeof data.model === 'string' &&
    'query' in data &&
    typeof data.query === 'string' &&
    'query_js' in data &&
    typeof data.query_js === 'string' &&
    'queryCode' in data &&
    typeof data.queryCode === 'string' &&
    'queryCode_js' in data &&
    typeof data.queryCode_js === 'string' &&
    'PINECONE_ENV' in data &&
    typeof data.PINECONE_ENV === 'string' &&
    'PINECONE_JS_ENV' in data &&
    typeof data.PINECONE_JS_ENV === 'string' &&
    'PINECONE_API_KEY' in data &&
    typeof data.PINECONE_API_KEY === 'string' &&
    'PINECONE_API_JS_KEY' in data &&
    typeof data.PINECONE_API_JS_KEY === 'string'
  ) {
    return {
      _id: data._id,
      id: data.id,
      chainName: data.chain_name,
      chainLogoURL: data.chain_logo,
      ai: {
        model: data.model,
        query: data.query,
        queryJS: data.queryCode_js,
        queryCode: data.queryCode,
        queryCodeJS: data.queryCode_js
      },
      env: {
        pineconeEnv: data.PINECONE_ENV,
        pineconeJSEnv: data.PINECONE_JS_ENV,
        pineconeApiKey: data.PINECONE_API_KEY,
        pineconeApiJSKey: data.PINECONE_API_JS_KEY
      }
    } satisfies IChainData;
  }

  /* MultiversX chain || Sway chain || Aurora chain || Zeta chain */
  if (
    data &&
    typeof data === 'object' &&
    '_id' in data &&
    typeof data._id === 'string' &&
    'id' in data &&
    typeof data.id === 'string' &&
    'chain_name' in data &&
    typeof data.chain_name === 'string' &&
    'chain_logo' in data &&
    typeof data.chain_logo === 'string' &&
    'model' in data &&
    typeof data.model === 'string' &&
    'query' in data &&
    typeof data.query === 'string' &&
    'queryCode' in data &&
    typeof data.queryCode === 'string' &&
    'PINECONE_ENV' in data &&
    typeof data.PINECONE_ENV === 'string' &&
    'PINECONE_API_KEY' in data &&
    typeof data.PINECONE_API_KEY === 'string'
  ) {
    return {
      _id: data._id,
      id: data.id,
      chainName: data.chain_name,
      chainLogoURL: data.chain_logo,
      ai: {
        model: data.model,
        query: data.query,
        queryCode: data.queryCode
      },
      env: {
        pineconeEnv: data.PINECONE_ENV,
        pineconeApiKey: data.PINECONE_API_KEY
      }
    } satisfies IChainData;
  }

  /* Ethereum chain */
  if (
    data &&
    typeof data === 'object' &&
    '_id' in data &&
    typeof data._id === 'string' &&
    'id' in data &&
    typeof data.id === 'string' &&
    'chain_name' in data &&
    typeof data.chain_name === 'string' &&
    'chain_logo' in data &&
    typeof data.chain_logo === 'string' &&
    'model' in data &&
    typeof data.model === 'string' &&
    'query' in data &&
    typeof data.query === 'string' &&
    'queryCode' in data &&
    typeof data.queryCode === 'string' &&
    'PINECONE_ENV' in data &&
    typeof data.PINECONE_ENV === 'string' &&
    'PINECONE_API_KEY' in data &&
    typeof data.PINECONE_API_KEY === 'string' &&
    'base_templace' in data &&
    typeof data.base_templace === 'string' &&
    'token_template' in data &&
    typeof data.token_template === 'string' &&
    'staking_template' in data &&
    typeof data.staking_template === 'string' &&
    'nft_template' in data &&
    typeof data.nft_template === 'string' &&
    'marketplace_template' in data &&
    typeof data.marketplace_template === 'string' &&
    'launchpad_template' in data &&
    typeof data.launchpad_template === 'string'
  ) {
    return {
      _id: data._id,
      id: data.id,
      chainName: data.chain_name,
      chainLogoURL: data.chain_logo,
      ai: {
        model: data.model,
        query: data.query,
        queryCode: data.queryCode
      },
      env: {
        pineconeEnv: data.PINECONE_ENV,
        pineconeApiKey: data.PINECONE_API_KEY
      },
      ethereumTemplates: {
        base: data.base_templace,
        token: data.token_template,
        staking: data.staking_template,
        nft: data.nft_template,
        marketplace: data.marketplace_template,
        launchpad: data.launchpad_template
      }
    } satisfies IChainData;
  }
}
