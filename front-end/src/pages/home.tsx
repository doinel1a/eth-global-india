import React, { useEffect, useReducer } from 'react';

import type {
  IAction as IChainsDataAction,
  TState as TChainsDataState
} from '@/reducers/chains-data';
import type { Reducer } from 'react';

import ChainSelectorSection from '@/components/sections/chain-selector';
// import SmartContractCodeViewer from '@/components/sections/smart-contract-code-viewer';
import SmartContractCustomisationsSection from '@/components/sections/smart-contract-customisations';
import EReducerState from '@/constants/reducer-state';
import IChainData from '@/interfaces/chain-data';
import { mapDataResponseToChain } from '@/lib/mappers';
import { chainsDataInitialState, chainsDataReducer } from '@/reducers/chains-data';
import { LlmService } from '@/sdk/llmService.sdk';

export default function HomePage() {
  const [chainsDataState, dispatchChainsDataState] = useReducer<
    Reducer<TChainsDataState, IChainsDataAction>
  >(chainsDataReducer, chainsDataInitialState);

  useEffect(() => {
    async function getAllChainsData() {
      dispatchChainsDataState({ state: EReducerState.start, payload: [] });

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

          dispatchChainsDataState({ state: EReducerState.success, payload: mappedChainsData });
        }
      } catch (error) {
        if (error instanceof Error) {
          dispatchChainsDataState({ state: EReducerState.error, payload: [] });

          console.error('ERROR GETTING ALL CHAINS DATA', error);
        }
      }
    }

    getAllChainsData();
  }, []);

  return (
    <div className='flex w-full max-w-[1200px] flex-col gap-y-6'>
      <ChainSelectorSection
        isChainsDataLoading={chainsDataState.isLoading}
        chainsData={chainsDataState.chainsData}
      />
      <SmartContractCustomisationsSection chainsData={chainsDataState.chainsData} />
      {/* <SmartContractCodeViewer smartContractCode={smartContractCode} /> */}
    </div>
  );
}
