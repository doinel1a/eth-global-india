import React from 'react';

import ChainSelectorSection from '@/components/sections/chain-selector';
import TemplateSelector from '@/components/sections/template-selector';

export default function HomePage() {
  return (
    <div className='flex w-full max-w-[1200px] flex-col gap-y-6'>
      <ChainSelectorSection />
      <TemplateSelector />
    </div>
  );
}
