import React from 'react';

import { BrowserProvider, ContractFactory } from 'ethers';

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
  const setDeploySC = useSCIterStore((store) => store.setDeploySC);
  const resetSCIterState = useSCIterStore((store) => store.reset);

  const { toast } = useToast();

  async function initSmartContractIter() {
    resetSCIterState();

    await generateSmartContract();

    await compileSmartContract();

    const { compileSC } = useSCIterStore.getState();

    if (compileSC.isError) {
      toast({
        variant: 'destructive',
        title: 'Oops, something went wrong',
        description: 'Relax, our AI friend is taking care of it!'
      });

      await fixAndCompileSmartContract();
    }

    const { fixAndCompileSC } = useSCIterStore.getState();

    if (fixAndCompileSC.isError) {
      toast({
        variant: 'destructive',
        title: 'Oops, my processor overheated',
        description:
          'Our AI friend could not figure out your requirements. Plase be more precise with your smart contract description and try again!'
      });

      return;
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
  async function fixAndCompileSmartContract() {
    try {
      setFixAndCompileSC({
        isLoading: true,
        isSuccess: false,
        isError: false,
        fixedSmartContract: '',
        compilationOutput: '',
        artifact: {}
      });

      const { generateSC } = useSCIterStore.getState();

      const response = await LlmService.buildCodeAndResolve(
        mapChainToCompileEndpoint(selectedChain),
        generateSC.smartContract
      );

      if (response.success && response.message === 'OK') {
        setFixAndCompileSC({
          isLoading: false,
          isSuccess: true,
          isError: false,
          fixedSmartContract: response.code,
          compilationOutput: response.message,
          artifact: response.artifact
        });
      } else {
        setFixAndCompileSC({
          isLoading: false,
          isSuccess: false,
          isError: true,
          fixedSmartContract: response.code,
          compilationOutput: response.message,
          artifact: response.artifact
        });
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

      const { compileSC } = useSCIterStore.getState();
      const { generateSC } = useSCIterStore.getState();
      const { fixAndCompileSC } = useSCIterStore.getState();

      /* eslint-disable unicorn/no-nested-ternary */
      const smartContractToAudit = compileSC.isSuccess
        ? generateSC.smartContract
        : fixAndCompileSC.isSuccess
          ? fixAndCompileSC.fixedSmartContract
          : '';

      const response = await LlmService.callAuditorLLM(smartContractToAudit);
      console.log('AUDIT RESPONSE', response);

      if (
        response &&
        typeof response === 'object' &&
        'audits' in response &&
        Array.isArray(response.audits)
      ) {
        const audits: IAuditResponse[] = [];

        for (const audit of response.audits) {
          if (audit && typeof audit === 'object' && 'severity' in audit && 'description' in audit) {
            console.log('CIAO');
            audits.push({
              severity: audit.severity,
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

  async function deployContract() {
    try {
      console.log('DEPLOYING SUCA');
      if (!window.ethereum) throw new Error('No ethereum provider found');
      const { compileSC } = useSCIterStore.getState();
      console.log('ARTIFACT', compileSC.artifact);
      setDeploySC({ isLoading: true, isSuccess: false, isError: false, deploymentAddress: '' });
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      console.log('SIGNER', signer.address);
      const contractFactory = new ContractFactory(
        compileSC.artifact.abi,
        compileSC.artifact.bytecode,
        signer
      );
      console.log('CONTRACT FACTORY', contractFactory);

      const deployedContract = await contractFactory.deploy(/** args */);
      console.log('DEPLOYED CONTRACT', deployedContract);
      const deploymentAddress = await deployedContract.getAddress();
      await deployedContract.waitForDeployment();
      setDeploySC({
        isLoading: false,
        isSuccess: true,
        isError: false,
        deploymentAddress: deploymentAddress
      });
      console.log('DEPLOY TX MINED SASATI LA PIDARI', deploymentAddress);
    } catch (error) {
      if (error instanceof Error) {
        console.log('ERROR', error);
        setDeploySC({ isLoading: false, isSuccess: false, isError: true, deploymentAddress: '' });
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

        <Button onClick={deployContract}>Deploy the Motherfucker</Button>

        <GenerationStepsState />
      </div>
    </SectionContainer>
  );
}

