import { useState } from 'react';

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

  const [isActive, setIsActive] = useState(false);

  const handleClick = event => {
    // 👇️ toggle isActive state on click
    setIsActive(current => !current);
  };

  return (
    <header className='fixed z-10 flex w-full items-center justify-center border-b border-border bg-background backdrop-blur-lg'>
      <nav className='flex w-full max-w-[1320px] items-center justify-between p-3 sm:p-5'>
        <img src={defiBuilderLogo} alt="DeFi Builder's logo" className='sm:h-6 h-4 ' />

        <div className='flex items-center gap-x-2.5'>
          {menuItems.map((item) => (
            <Button
              key={item.name.toLowerCase()}
              tabIndex={-1}
              variant='outline'
              title='Coming soon. . .'
              className='cursor-wait text-[#4F4F4F] hover:text-[#4F4F4F] hidden md:flex'
            >
              {item.icon}
              <span className=''>
                {item.name}
              </span>
            </Button>

          ))}
          <div className={isActive ? 'menu_ic' : 'cancel_ic'}>
            <button onClick={handleClick} className='md:hidden w-[30px] sm:w-[40px] flex items-center justify-center bg-gradient-to-b from-[#F5F7FB] to-[#7590BA] rounded-lg'>            
              <img src="/img/menu.svg" alt="" className='sm:h-9 h-[30px] w-6 menu' />
              <img src="/img/cancel.svg" alt="" className='sm:h-9 h-[30px] w-6 cancel' />
            </button>

            <div className={isActive ? 'add ease-out duration-300  bg-[#131c1d] items-center flex flex-col h-[220px] fixed left-0 sm:top-[80px] w-[100%] pt-6 top-[66px] z-10' :
                                      'remove ease-out duration-300  bg-[#131c1d] items-center flex flex-col h-[220px] fixed left-0 w-[100%] pt-6 top-[-220px] z-10'}>
              {menuItems.map((item) => (
                <Button
                  key={item.name.toLowerCase()}
                  tabIndex={-1}
                  variant='outline'
                  title='Coming soon. . .'
                  className='cursor-wait text-[#4F4F4F] hover:text-[#4F4F4F] my-2'
                >
                  {item.icon}
                  <span className=''>
                    {item.name}
                  </span>
                </Button>

              ))}
            </div>
          </div>
          <w3m-button />
        </div>
      </nav>
    </header>


  );
}
