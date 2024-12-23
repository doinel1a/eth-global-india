import React from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import IAuditResponse from '@/interfaces/audit-response';
import IChainData from '@/interfaces/chain-data';
import { mapChainToCompileEndpoint } from '@/lib/mappers';
import { LlmService } from '@/sdk/llmService.sdk';
import useSelectedChainStore from '@/store/selected-chain';
import useSCCustomisationsStore from '@/store/smart-contract-customisations';
import useSCIterStore from '@/store/smart-contract-iter';

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

  const scDescription = useSCCustomisationsStore((store) => store.scCustomisations.description);
  const selectedSCTemplate = useSCCustomisationsStore((store) => store.scCustomisations.template);
  const selectedSCFeatures = useSCCustomisationsStore((store) => store.scCustomisations.features);

  const { generateSC } = useSCIterStore.getState();
  const { compileSC } = useSCIterStore.getState();
  const { auditSC } = useSCIterStore.getState();

  const setGenerateSC = useSCIterStore((store) => store.setGenerateSC);
  const setCompileSC = useSCIterStore((store) => store.setCompileSC);
  const setFixAndCompileSC = useSCIterStore((store) => store.setFixAndCompileSC);
  const setAuditSC = useSCIterStore((store) => store.setAuditSC);
  const resetSCIterState = useSCIterStore((store) => store.reset);

  const { toast } = useToast();

  async function initSmartContractIter() {
    resetSCIterState();

    await generateSmartContract();

    await compileSmartContract();

    const { compileSC, generateSC } = useSCIterStore.getState();

    if (compileSC.isError) {
      await fixAndCompileSmartContract(generateSC.smartContract, compileSC.compilationOutput);
    }

    await auditSmartContract();
  }

  async function generateSmartContract() {
    console.log('GENERATING SC');

    try {
      setGenerateSC({ isLoading: true, isSuccess: false, isError: false, smartContract: '' });

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
          setGenerateSC({
            isLoading: false,
            isSuccess: true,
            isError: false,
            smartContract: response
          });
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        setGenerateSC({ isLoading: false, isSuccess: false, isError: true, smartContract: '' });
      }
    }
  }

  async function compileSmartContract() {
    try {
      setCompileSC({
        isLoading: true,
        isSuccess: false,
        isError: false,
        compilationOutput: '',
        artifact: {}
      });

      const { generateSC } = useSCIterStore.getState();

      const response = await LlmService.buildCode(
        mapChainToCompileEndpoint(selectedChain),
        generateSC.smartContract
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
          setCompileSC({
            isLoading: false,
            isSuccess: true,
            isError: false,
            compilationOutput: '',
            artifact: response.artifact
          });
        } else {
          setCompileSC({
            isLoading: false,
            isSuccess: false,
            isError: true,
            compilationOutput: response.message,
            artifact: response.artifact
          });
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        setCompileSC({
          isLoading: false,
          isSuccess: false,
          isError: true,
          compilationOutput: error.message,
          artifact: {}
        });
      }
    }
  }

  // Feedback method - MAX ATTEMPTS 3
  async function fixAndCompileSmartContract(code: string, errorMessage: string, maxTries = 3) {
    console.log('FIXING AND COMPILING SC', maxTries);

    try {
      toast({
        variant: 'destructive',
        title: 'Oops, compilation did not succeed.',
        description: `Relax, our AI friend is taking care of it! Remaining Attempts: ${maxTries}`
      });

      setCompileSC({
        isLoading: true,
        isSuccess: false,
        isError: false,
        compilationOutput: '',
        artifact: {}
      });
      const newCode = await LlmService.callBuildResolverLLM(code, errorMessage);
      const buildResponse = await LlmService.buildCode(
        mapChainToCompileEndpoint(selectedChain),
        newCode
      );

      if (buildResponse.success && buildResponse.message === 'OK') {
        console.log('COMPILED AFTER FIXING', buildResponse);
        setFixAndCompileSC({
          isLoading: false,
          isSuccess: true,
          isError: false,
          fixedSmartContract: newCode,
          artifact: buildResponse.artifact,
          compilationOutput: buildResponse.message
        });
        setCompileSC({
          isLoading: false,
          isSuccess: true,
          isError: false,
          artifact: buildResponse.artifact,
          compilationOutput: buildResponse.message
        });
      } else if (!buildResponse.success && maxTries == 0) {
        toast({
          variant: 'destructive',
          title: 'Oops, my processor overheated',
          description:
            'Our AI friend could not figure out your requirements. Plase be more precise with your smart contract description and try again!'
        });
        setFixAndCompileSC({
          isLoading: false,
          isSuccess: false,
          isError: true,
          fixedSmartContract: newCode,
          artifact: {},
          compilationOutput: buildResponse.message
        });
        setCompileSC({
          isLoading: false,
          isSuccess: false,
          isError: true,
          artifact: {},
          compilationOutput: buildResponse.message
        });
      } else {
        fixAndCompileSmartContract(newCode, buildResponse.message, maxTries - 1);
      }
    } catch (error) {
      if (error instanceof Error) {
        setFixAndCompileSC({
          isLoading: false,
          isSuccess: false,
          isError: true,
          fixedSmartContract: '',
          compilationOutput: error.message,
          artifact: {}
        });
        setCompileSC({
          isLoading: false,
          isSuccess: false,
          isError: true,
          artifact: {},
          compilationOutput: error.message
        });
      }
    }
  }

  async function auditSmartContract() {
    try {
      setAuditSC({
        isLoading: true,
        isSuccess: false,
        isError: false,
        auditingOutput: []
      });

      const { compileSC, generateSC, fixAndCompileSC } = useSCIterStore.getState();

      /* eslint-disable unicorn/no-nested-ternary */
      const smartContractToAudit = compileSC.isSuccess
        ? generateSC.smartContract
        : fixAndCompileSC.isSuccess
          ? fixAndCompileSC.fixedSmartContract
          : '';

      const selectedChainData = chainsData?.find((data) => data.chainName === selectedChain);
      const activeChainId = selectedChainData ? selectedChainData.id : '';

      const response = await LlmService.callAuditorLLM(smartContractToAudit, activeChainId);

      console.log('AUDIT RESPONSE', response);

      if (
        response &&
        typeof response === 'object' &&
        'audits' in response &&
        Array.isArray(response.audits)
      ) {
        const audits: IAuditResponse[] = [];

        for (const audit of response.audits) {
          if (
            audit &&
            typeof audit === 'object' &&
            'severity' in audit &&
            'description' in audit &&
            'title' in audit
          ) {
            audits.push({
              severity: audit.severity,
              title: audit.title,
              description: audit.description
            });
          }
        }

        setAuditSC({
          isLoading: false,
          isSuccess: true,
          isError: false,
          auditingOutput: audits
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        setAuditSC({
          isLoading: false,
          isSuccess: true,
          isError: false,
          auditingOutput: error.message
        });
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
          disabled={generateSC.isLoading || compileSC.isLoading || auditSC.isLoading}
          onClick={initSmartContractIter}
        >
          {generateSC.isLoading || compileSC.isLoading || auditSC.isLoading
            ? 'Generating Smart Contract'
            : 'Generate Smart Contract'}
        </Button>

        <GenerationStepsState />
      </div>
    </SectionContainer>
  );
}
