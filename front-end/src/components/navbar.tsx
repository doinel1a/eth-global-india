import React from 'react';

import defiBuilderLogo from '../assets/images/defi-builder-logo.png';
import ConsultIcon from './icons/consult';
import DevelopmentIcon from './icons/development';
import ProductsIcon from './icons/products';
import { Button } from './ui/button';

const menuItems = [
  {
    name: 'Products',
    icon: <ProductsIcon className='mr-2.5' />
  },
  {
    name: 'Development',
    icon: <DevelopmentIcon className='mr-2.5' />
  },
  {
    name: 'Consult',
    icon: <ConsultIcon className='mr-2.5' />
  }
];

export default function Navbar() {
  return (
    <header className='fixed z-10 flex w-full items-center justify-center border-b border-border bg-background backdrop-blur-lg'>
      <nav className='flex w-full max-w-[1320px] items-center justify-between p-5'>
        <img src={defiBuilderLogo} alt="DeFi Builder's logo" className='h-6' />

        <div className='flex gap-x-2.5'>
          {menuItems.map((item) => (
            <Button
              key={item.name.toLowerCase()}
              tabIndex={-1}
              variant='outline'
              title='Coming soon. . .'
              className='cursor-wait text-[#4F4F4F] hover:text-[#4F4F4F]'
            >
              {item.icon}
              {item.name}
            </Button>
          ))}

          <Button variant='default' className='ml-2.5'>
            Connect wallet
          </Button>
        </div>
      </nav>
    </header>
  );
}
