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
    <div className='flex flex-col w-[100%]'>
      <div className='flex w-full items-start justify-between flex-col md:flex-row sm:mb-11 mb-6'>
        <div className='flex flex-col '>
          <h2 className='text-lg sm:text-2xl font-semibold'>Select Template</h2>
          <h3 className='text-base sm:text-lg text-[#67696b] font-medium'>
            Choose modules to activate on your project, you can configure them later
          </h3>
        </div>

        <Anchor href='https://docs.defibuilder.com/multiversex/xdefi' className='mt-3 ml-0 md:ml-1 md:mt-0 bg-[#151616] hover:bg-[#8aebfc33] border-[#212b2d] border rounded-xl w-[150px] h-[40px] sm:w-[190px] sm:h-[54px] flex items-center justify-center text-[#F5F7FB] font-medium text-sm sm:text-base'>Explore Docs</Anchor>
      </div>

      <div className='grid min-[420px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4'>
        {scTemplates.map((scTemplate, index) => (
          <Card
            key={`${scTemplate}-${index}`}
            tabIndex={0}
            role='button'
            className={cn(' cursor-pointer rounded-3xl border-2 border-[#131c1d]  ', {
              'border-[#8AEBFC] ': selectedSCTemplate === scTemplate
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
            <CardHeader className='text-center p-4'>
              <CardTitle className='flex flex-col items-center gap-y-2.5 text-xl'>
                <TemplateIcon />
                <span className='text-[#F5F7FB] font-medium text-[18px]'>
                  {scTemplate}
                </span>
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
