import React from 'react';

import Anchor from '@/components/anchor';
import TemplateIcon from '@/components/icons/template';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import useSelectedChainStore from '@/store/selected-chain';
import useSCCustomisationsStore from '@/store/smart-contract-customisations';

interface ISmartContractTemplates {
  scTemplates: string[];
}

export default function SmartContractTemplates({ scTemplates }: ISmartContractTemplates) {
  const selectedChain = useSelectedChainStore((store) => store.selectedChain);

  const selectedSCTemplate = useSCCustomisationsStore((store) => store.scCustomisations.template);
  const setSCTemplate = useSCCustomisationsStore((store) => store.setSCTemplate);
  const setSCFeatures = useSCCustomisationsStore((store) => store.setSCFeatures);

  return (
    <div className='flex flex-col gap-y-5'>
      <div className='flex w-full items-start justify-between'>
        <div className='flex flex-col'>
          <h2 className='mb-2 text-3xl font-semibold'>Select Template</h2>
          <h3 className='text-lg'>
            Choose modules to activate on your project, you can configure them later
          </h3>
        </div>

        <Anchor href='https://docs.defibuilder.com/multiversex/xdefi'>Explore Docs</Anchor>
      </div>

      <div className='flex gap-x-2.5'>
        {scTemplates.map((scTemplate, index) => (
          <Card
            key={`${scTemplate}-${index}`}
            tabIndex={0}
            role='button'
            className={cn('w-1/6 cursor-pointer rounded-3xl border-2', {
              'border-blue-500': selectedSCTemplate === scTemplate
            })}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                setSCTemplate(scTemplate);
                setSCFeatures([]);
              }
            }}
            onClick={() => {
              setSCTemplate(scTemplate);
              setSCFeatures([]);
            }}
          >
            <CardHeader className='text-center'>
              <CardTitle className='flex flex-col items-center gap-y-2.5 text-xl'>
                <TemplateIcon />
                {scTemplate}
              </CardTitle>
              <CardDescription>
                Generate a {selectedChain} custom {scTemplate}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
