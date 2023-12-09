import React, { useEffect, useReducer } from 'react';

import type {
  IAction as IChainsDataAction,
  TState as TChainsDataState
} from '@/reducers/chains-data';
import type { Reducer } from 'react';

import AuditSection from '@/components/sections/audit';
import ChainSelectorSection from '@/components/sections/chain-selector';
import SmartContractCodeViewer from '@/components/sections/smart-contract-code-viewer';
import SmartContractCustomisationsSection from '@/components/sections/smart-contract-customisations';
import EReducerState from '@/constants/reducer-state';
import IChainData from '@/interfaces/chain-data';
import { mapDataResponseToChain } from '@/lib/mappers';
import { chainsDataInitialState, chainsDataReducer } from '@/reducers/chains-data';
import { LlmService } from '@/sdk/llmService.sdk';
import useSCIterStore from '@/store/smart-contract-iter';

export default function HomePage() {
  const [chainsDataState, dispatchChainsDataState] = useReducer<
    Reducer<TChainsDataState, IChainsDataAction>
  >(chainsDataReducer, chainsDataInitialState);

  const generateSC = useSCIterStore((store) => store.generateSC);
  const compileSC = useSCIterStore((store) => store.compileSC);
  const fixAndCompileSC = useSCIterStore((store) => store.fixAndCompileSC);
  const auditSC = useSCIterStore((store) => store.auditSC);

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

      {(compileSC.isSuccess || fixAndCompileSC.isSuccess) && auditSC.isSuccess ? (
        <>
          <AuditSection />
          <SmartContractCodeViewer smartContractCode={generateSC.smartContract} />
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
