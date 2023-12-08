import React, { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import IChainData from '@/interfaces/chain-data';
import useSelectedChainStore from '@/store/selected-chain';
import useSCCustomisationsStore from '@/store/smart-contract-customisations';

import SectionContainer from '../container';
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

  useEffect(() => {
    console.log('selectedChain', selectedChain);
  }, [selectedChain]);

  useEffect(() => {
    console.log('scCustomisations', scCustomisations);
  }, [scCustomisations]);

  return (
    <SectionContainer className='flex flex-col items-start justify-between gap-y-10 px-10 py-12 backdrop-blur-md'>
      <SmartContractTemplates scTemplates={scTemplates} />
      <SmartContractFeatures scFeatures={scFeatures} />
      <SmartContractDescription />

      <Button onClick={() => {}}>Generate Smart Contract</Button>
    </SectionContainer>
  );
}
