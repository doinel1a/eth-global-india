import React from 'react';

import stepBackground from '@/assets/images/step.svg';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import SectionContainer from './container';

export default function ChainSelectorSection() {
  return (
    <SectionContainer
      className='bg-background flex items-center justify-between px-10 py-12 backdrop-blur-lg'
      style={{
        background: `url(${stepBackground}) no-repeat`
      }}
    >
      <div className='flex flex-col'>
        <h2 className='mb-2 text-4xl font-semibold'>Zeta AI Builder</h2>
        <h3 className='text-lg'>Generate your custom DeFi application for Zeta</h3>
      </div>

      <div className='flex items-center gap-x-2.5'>
        <p className='text-lg'>Select target chain</p>

        <Select>
          <SelectTrigger className='w-[140px]'>
            <SelectValue placeholder='Zeta' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='near'>Near</SelectItem>
            <SelectItem value='multiversx'>MultiversX</SelectItem>
            <SelectItem value='sway'>Sway</SelectItem>
            <SelectItem value='aurora'>Aurora</SelectItem>
            <SelectItem value='zeta'>Zeta</SelectItem>
            <SelectItem value='ethereum'>Ethereum</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SectionContainer>
  );
}
