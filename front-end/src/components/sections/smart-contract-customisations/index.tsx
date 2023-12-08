import React, { Reducer, useEffect, useReducer } from 'react';

import type {
  IAction as IAduitSCAction,
  TState as IAuditSCState
} from '@/reducers/audit-smart-contract';
import type {
  IAction as ICompileSCAction,
  TState as TCompileSCState
} from '@/reducers/compile-smart-contract';
import type {
  IAction as IGenerateSCAction,
  TState as TGenerateSCState
} from '@/reducers/generate-smart-contract';

import { Button } from '@/components/ui/button';
import EReducerState from '@/constants/reducer-state';
import IChainData from '@/interfaces/chain-data';
import { auditSCInitialState, auditSCReducer } from '@/reducers/audit-smart-contract';
import { compileSCInitialState, compileSCReducer } from '@/reducers/compile-smart-contract';
import { generateSCInitialState, generateSCReducer } from '@/reducers/generate-smart-contract';
import { LlmService } from '@/sdk/llmService.sdk';
import useSelectedChainStore from '@/store/selected-chain';
import useSCCustomisationsStore from '@/store/smart-contract-customisations';

import SectionContainer from '../container';
import GenerationStepsState from './generation-steps-status';
import SmartContractDescription from './smart-contract-description';
import SmartContractFeatures from './smart-contract-features';
import SmartContractTemplates from './smart-contract-templates';

interface ISmartContractCustomisationSection {
  chainsData: IChainData[] | undefined;
}

const scTemplates = ['Token', 'NFT', 'Staking', 'Farm', 'Marketplace', 'Launchpad'];
const scFeatures = {
  Token: [
    'Token minting',
    'Token burning',
    'Token transfers',
    'Limited Supply',
    'Buy Sell Fees',
    'Anti-Whale',
    'Auto Liquidity'
  ],
  NFT: ['Minting Price', 'Royalty Fees', 'Custom Rarity'],
  Staking: ['Minting Token', 'Farms', 'Pools', 'RevenueShare'],
  Farm: ['Locked Farms', 'Deposit Fees', 'Withdraw Fees', 'Locking Time'],
  Marketplace: ['Dutch Auction', 'Standard Auction', 'Listing Fees'],
  Launchpad: ['Softcap Limit', 'Hardcap Limit', 'Overflow Method']
};

export default function SmartContractCustomisationSection({
  chainsData
}: ISmartContractCustomisationSection) {
  const selectedChain = useSelectedChainStore((store) => store.selectedChain);

  const scCustomisations = useSCCustomisationsStore((store) => store.scCustomisations);

  const scDescription = useSCCustomisationsStore((store) => store.scCustomisations.description);
  const selectedSCTemplate = useSCCustomisationsStore((store) => store.scCustomisations.template);
  const selectedSCFeatures = useSCCustomisationsStore((store) => store.scCustomisations.features);

  const [generateSCState, dispatchGenerateSCState] = useReducer<
    Reducer<TGenerateSCState, IGenerateSCAction>
  >(generateSCReducer, generateSCInitialState);

  const [compileSCState, dispatchCompileSCState] = useReducer<
    Reducer<TCompileSCState, ICompileSCAction>
  >(compileSCReducer, compileSCInitialState);

  const [auditSCState, dispatchAuditSCState] = useReducer<Reducer<IAuditSCState, IAduitSCAction>>(
    auditSCReducer,
    auditSCInitialState
  );

  useEffect(() => {
    console.log('selectedChain', selectedChain);
  }, [selectedChain]);

  useEffect(() => {
    console.log('scCustomisations', scCustomisations);
  }, [scCustomisations]);

  async function initSmartContractIter() {
    dispatchGenerateSCState({ state: EReducerState.reset, payload: '' });
    dispatchCompileSCState({ state: EReducerState.reset, payload: '' });
    dispatchAuditSCState({ state: EReducerState.reset, payload: '' });

    const generateSCResponse = await generateSmartContract();
    // console.log('GENERATION RESPONSE', generateSCResponse);

    const compileSCResponse = await compileSmartContract();
    // console.log('COMPILATION RESPONSE', compileSCResponse);

    const auditSCResponse = await auditSmartContract();
    // console.log('AUDIT RESPONSE', auditSCResponse);
  }

  async function generateSmartContract() {
    console.log('GENERATING SC');

    try {
      dispatchGenerateSCState({ state: EReducerState.start, payload: '' });

      const selectedChainData = chainsData?.find((data) => data.chainName === selectedChain);

      if (selectedChainData) {
        const prompt = JSON.stringify({
          description: scDescription,
          contractType: selectedSCTemplate,
          functionalRequirements: selectedSCFeatures
        });

        const response = await LlmService.callGeneratorLLM(prompt, selectedChainData.id, '');

        console.log('GENERATION RESPONSE', response);

        if (response && typeof response === 'string') {
          dispatchGenerateSCState({ state: EReducerState.success, payload: response });
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        dispatchGenerateSCState({ state: EReducerState.error, payload: '' });
      }
    }
  }

  async function compileSmartContract() {
    console.log('COMPILING SC');

    try {
      dispatchCompileSCState({ state: EReducerState.start, payload: '' });

      const response = await LlmService.buildCode(
        mapChainToCompileEndpoint(selectedChain),
        generateSCState.smartContract
      );

      if (
        response &&
        typeof response === 'object' &&
        'success' in response &&
        typeof response.success === 'boolean' &&
        'message' in response &&
        typeof response.message === 'string'
      ) {
        console.log('COMPILATION RESPONSE', response);

        if (response.success && response.message === 'OK') {
          dispatchCompileSCState({ state: EReducerState.success, payload: response.message });
        } else {
          dispatchCompileSCState({ state: EReducerState.error, payload: response.message });
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        dispatchCompileSCState({ state: EReducerState.error, payload: '' });
      }
    }
  }

  async function auditSmartContract() {
    console.log('AUDITING SC');

    try {
      dispatchAuditSCState({ state: EReducerState.start, payload: '' });

      const response = await LlmService.callAuditorLLM(generateSCState.smartContract);

      if (response) {
        console.log('AUDIT RESPONSE', response);

        dispatchAuditSCState({ state: EReducerState.success, payload: response });
      }
    } catch (error) {
      if (error instanceof Error) {
        dispatchAuditSCState({ state: EReducerState.error, payload: '' });
      }
    }
  }

  return (
    <SectionContainer className='flex flex-col items-start justify-between gap-y-10 px-10 py-12 backdrop-blur-md'>
      <SmartContractTemplates scTemplates={scTemplates} />
      <SmartContractFeatures scFeatures={scFeatures} />
      <SmartContractDescription />

      <div className='flex w-full items-center justify-between'>
        <Button
          disabled={generateSCState.isLoading || compileSCState.isLoading || auditSCState.isLoading}
          onClick={initSmartContractIter}
        >
          {generateSCState.isLoading || compileSCState.isLoading || auditSCState.isLoading
            ? 'Generating Smart Contract'
            : 'Generate Smart Contract'}
        </Button>

        <GenerationStepsState
          generateSCState={{
            isLoading: generateSCState.isLoading,
            isError: generateSCState.isError,
            isSuccess:
              !generateSCState.isLoading &&
              !generateSCState.isError &&
              generateSCState.smartContract !== ''
          }}
          compileSCState={{
            isLoading: compileSCState.isLoading,
            isError: compileSCState.isError,
            isSuccess:
              !compileSCState.isLoading &&
              !compileSCState.isError &&
              compileSCState.compilationOutput === 'OK'
          }}
          auditSCState={{
            isLoading: auditSCState.isLoading,
            isError: auditSCState.isError,
            isSuccess:
              !auditSCState.isLoading && !auditSCState.isError && auditSCState.auditingOutput !== ''
          }}
        />
      </div>
    </SectionContainer>
  );
}

function mapChainToCompileEndpoint(selectedChain: string) {
  switch (selectedChain) {
    case 'Aurora':
    case 'Base':
    case 'Ethereum':
    case 'Zeta': {
      return 'solidity';
    }
    case 'Sway': {
      return 'fuel';
    }
    case 'Multiversx': {
      return 'multiversx';
    }
    default: {
      return '';
    }
  }
}
