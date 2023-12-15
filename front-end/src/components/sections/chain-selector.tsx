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
import { Button } from '../ui/button';

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
      className='flex flex-col items-start justify-between lg:px-10 lg:py-12 md:px-10 md:py-12 p-5 backdrop-blur-md sm:flex-col md:flex-row md:items-center mb-7 sm:mb-9'
      style={{
        background: `url(${stepBackground}) no-repeat`,
        backgroundSize: "contain"
      }}
    >
      <div className='flex flex-col'>
        <Button className=' hover:bg-transparent bg-transparent w-fit p-0 h-auto text-[#67696b] text-[16px] mb-1 font-normal'>
          <img src="/img/arrow-left.svg" alt="" className='h-18 m-w-18 mr-2' />
          Back
        </Button>
        {isChainsDataLoading ? (
          <Skeleton className='h-10 w-96' />
        ) : (
          <h2 className='md:text-4xl text-[26px] font-semibold mb-2'>{selectedChain} AI Builder</h2>
        )}
        {isChainsDataLoading ? (
          <Skeleton className='h-7 w-96' />
        ) : (
          <h3 className='sm:text-lg  text-base text-[#67696b] font-medium'>Generate your custom DeFi application for {selectedChain}</h3>
        )}
      </div>

      <div className='flex items-center gap-x-2.5 mt-4 md:mt-0 flex-col sm:flex-row'>
        {isChainsDataLoading ? (
          <div className='flex items-center gap-x-2.5'>
            <Skeleton className='h-7 w-40' />
            <Skeleton className='h-10 w-40' />
          </div>
        ) : (
          <>
            <p className='text-lg'>Select target chain</p>
            <Select onValueChange={(value) => setSelectedChain(value)} defaultValue={selectedChain}>
              <SelectTrigger className='w-40 bg-[#151616] border-[#212b2d]'>
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
