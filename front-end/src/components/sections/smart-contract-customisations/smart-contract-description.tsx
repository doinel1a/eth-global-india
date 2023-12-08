import React from 'react';

import { Textarea } from '@/components/ui/textarea';
import useSelectedChainStore from '@/store/selected-chain';
import useSCCustomisationsStore from '@/store/smart-contract-customisations';

export default function SmartContractDescription() {
  const selectedChain = useSelectedChainStore((store) => store.selectedChain);

  const scDescription = useSCCustomisationsStore((store) => store.scCustomisations.description);
  const setSCDescription = useSCCustomisationsStore((store) => store.setSCDescription);

  return (
    <div className='flex w-full flex-col gap-y-5'>
      <div>
        <h2 className='mb-2 text-3xl font-semibold'>Describe Customisation</h2>
        <h3 className='text-lg'>Choose customization to add into your {selectedChain} project</h3>
      </div>

      <Textarea
        value={scDescription}
        placeholder='Insert token name, supply and others customisations'
        className='h-60 w-full resize-none rounded-3xl'
        onChange={(event) => setSCDescription(event.target.value)}
      />
    </div>
  );
}
