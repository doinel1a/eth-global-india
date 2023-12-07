import React from 'react';

import SectionContainer from './container';

export default function TemplateSelector() {
  return (
    <SectionContainer className='flex items-center justify-between bg-background p-10 backdrop-blur-lg'>
      <div className='flex flex-col'>
        <h2 className='mb-2 text-3xl font-semibold'>Select Template</h2>
        <h3 className='text-lg'>
          Choose modules to activate on your project, you can configure them later
        </h3>
      </div>
    </SectionContainer>
  );
}
