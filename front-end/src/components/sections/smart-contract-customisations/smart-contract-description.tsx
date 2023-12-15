import React from 'react';

import { Textarea } from '@/components/ui/textarea';
import useSelectedChainStore from '@/store/selected-chain';
import useSCCustomisationsStore from '@/store/smart-contract-customisations';

const examplePrompts: Record<string, string> = {
  Token:
    'Createa token named ETHIndia with an max supply of 1 billion and can be minted after deployment if you hold a soulbound NFT.',
  NFT: 'Create an NFT collection that has a minting price of 0.1 ETH and there can be only 10 NFTs minted per day.',
  Staking:
    'Create a staking pool that has a reward of 0.1 ETH per day and has a lockup period of 30 days.',
  Farm: 'Create a farm that has a reward of 0.1 ETH per day and has a lockup period of 30 days.',
  Marketplace: 'Create a NFT marketplace that has a fee of 1% per transaction.',
  Launchpad: 'Create an ICO launchpad that has a fee of 1% per transaction.'
};

export default function SmartContractDescription() {
  const selectedChain = useSelectedChainStore((store) => store.selectedChain);

  const scDescription = useSCCustomisationsStore((store) => store.scCustomisations.description);
  const setSCDescription = useSCCustomisationsStore((store) => store.setSCDescription);

  const scTemplate = useSCCustomisationsStore((store) => store.scCustomisations.template);

  return (
    <div className='flex w-full flex-col'>
      <div className='mt-9 sm:mt-12  sm:mb-9 mb-6'>
        <h2 className='text-lg sm:text-2xl font-semibold'>Describe Customisation</h2>
        <h3 className='text-base sm:text-lg font-medium text-[#69696b]'>Choose customization to add into your {selectedChain} project</h3>
      </div>

      <Textarea
        value={scDescription}
        placeholder={examplePrompts[scTemplate]}
        className='h-60 w-full resize-none rounded-3xl p-5'
        onChange={(event) => setSCDescription(event.target.value)}
      />
    </div>
  );
}

