import React, { useState } from 'react';

import IChainData from '@/interfaces/chain-data';
import { cn } from '@/lib/utils';
import useSelectedChainStore from '@/store/selected-chain';

import Anchor from '../anchor';
import TemplateIcon from '../icons/template';
import { Button } from '../ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import SectionContainer from './container';

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

type SCFeatureKey = keyof typeof scFeatures;

function isSCFeatureKey(scTemplate: string): scTemplate is SCFeatureKey {
  return ['Token', 'NFT', 'Staking', 'Farm', 'Marketplace', 'Launchpad'].includes(scTemplate);
}

export default function SmartContractCustomisationSection({
  chainsData
}: ISmartContractCustomisationSection) {
  const selectedChain = useSelectedChainStore((store) => store.selectedChain);

  const [selectedSCTemplate, setSelectedSCTemplate] = useState<SCFeatureKey>('Token');
  const [selectedSCFeatures, setSelectedSCFeatures] = useState<string[]>([]);
  const [smartContractPromt, setSmartContractPromt] = useState('');

  return (
    <SectionContainer className='flex flex-col items-start justify-between gap-y-10 px-10 py-12 backdrop-blur-md'>
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
                // eslint-disable-next-line sonarjs/no-collapsible-if
                if (event.key === 'Enter' || event.key === ' ') {
                  // eslint-disable-next-line unicorn/no-lonely-if
                  if (isSCFeatureKey(scTemplate)) {
                    setSelectedSCTemplate(scTemplate);
                  }
                }
              }}
              onClick={() => {
                if (isSCFeatureKey(scTemplate)) {
                  setSelectedSCTemplate(scTemplate);
                }
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

      <div className='flex flex-col gap-y-5'>
        <div>
          <h2 className='mb-2 text-3xl font-semibold'>Features Request</h2>
          <h3 className='text-lg'>Choose features to activate on your {selectedChain} project</h3>
        </div>

        <div className='flex gap-x-5'>
          {scFeatures[selectedSCTemplate]?.map((feature, index) => (
            <div key={`${feature}-${index}`} className='flex items-center gap-x-1.5'>
              <Checkbox
                id={feature}
                onCheckedChange={(isChecked) => {
                  if (isChecked) {
                    setSelectedSCFeatures((previousFeatures) => [...previousFeatures, feature]);
                  } else {
                    setSelectedSCFeatures((previousFeatures) =>
                      previousFeatures.filter((previousFeature) => previousFeature !== feature)
                    );
                  }
                }}
              />
              <label htmlFor={feature}>{feature}</label>
            </div>
          ))}
        </div>
      </div>

      <div className='flex w-full flex-col gap-y-5'>
        <div>
          <h2 className='mb-2 text-3xl font-semibold'>Describe Customisation</h2>
          <h3 className='text-lg'>Choose customization to add into your {selectedChain} project</h3>
        </div>

        <Textarea
          value={smartContractPromt}
          placeholder='Insert token name, supply and others customisations'
          className='h-60 w-full resize-none rounded-3xl'
          onChange={(event) => setSmartContractPromt(event.target.value)}
        />
      </div>

      <Button onClick={() => {}}>Generate Smart Contract</Button>
    </SectionContainer>
  );
}
