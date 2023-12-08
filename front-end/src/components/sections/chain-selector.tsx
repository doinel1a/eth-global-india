import React from 'react';

import stepBackground from '@/assets/images/step.svg';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import IChainData from '@/interfaces/chain-data';
import useSelectedChainStore from '@/store/selected-chain';

import Image from '../image';
import { Skeleton } from '../ui/skeleton';
import SectionContainer from './container';

interface IChainSelectorSection {
  isChainsDataLoading: boolean;
  chainsData: IChainData[] | undefined;
}

export default function ChainSelectorSection({
  isChainsDataLoading,
  chainsData
}: IChainSelectorSection) {
  const selectedChain = useSelectedChainStore((store) => store.selectedChain);
  const setSelectedChain = useSelectedChainStore((store) => store.setSelectedChain);

  const selectedChainIndex = chainsData?.findIndex((data) => data.chainName === selectedChain) || 0;

  return (
    <SectionContainer
      className='flex items-center justify-between px-10 py-12 backdrop-blur-md'
      style={{
        background: `url(${stepBackground}) no-repeat`
      }}
    >
      <div className='flex flex-col gap-y-2.5'>
        {isChainsDataLoading ? (
          <Skeleton className='h-10 w-96' />
        ) : (
          <h2 className='text-4xl font-semibold'>{selectedChain} AI Builder</h2>
        )}
        {isChainsDataLoading ? (
          <Skeleton className='h-7 w-96' />
        ) : (
          <h3 className='text-lg'>Generate your custom DeFi application for {selectedChain}</h3>
        )}
      </div>

      <div className='flex items-center gap-x-2.5'>
        {isChainsDataLoading ? (
          <div className='flex items-center gap-x-2.5'>
            <Skeleton className='h-7 w-40' />
            <Skeleton className='h-10 w-40' />
          </div>
        ) : (
          <>
            <p className='text-lg'>Select target chain</p>
            <Select onValueChange={(value) => setSelectedChain(value)} defaultValue={selectedChain}>
              <SelectTrigger className='w-40'>
                <SelectValue
                  placeholder={
                    <div className='flex items-center gap-x-2.5'>
                      <Image
                        src={chainsData ? chainsData[selectedChainIndex]?.chainLogoURL : ''}
                        alt={chainsData ? `${chainsData[selectedChainIndex]?.chainName} logo` : ''}
                        className='h-5 w-5'
                      />
                      {selectedChain}
                    </div>
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {chainsData?.map((data, index) => (
                  <SelectItem
                    key={`${data.chainName}-${index}`}
                    value={data.chainName}
                    className='pl-2'
                  >
                    <div className='flex items-center gap-x-2.5'>
                      <Image
                        src={data.chainLogoURL}
                        alt={`${data.chainName}'s logo`}
                        className='h-5 w-5'
                      />
                      {data.chainName}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
      </div>
    </SectionContainer>
  );
}
