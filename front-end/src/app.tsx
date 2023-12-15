import React from 'react';

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { WagmiConfig } from 'wagmi';
import { arbitrum, avalanche, bsc, fantom, gnosis, mainnet, optimism, polygon } from 'wagmi/chains';

import mainBG from '@/assets/images/main-bg.svg';
import { Toaster } from '@/components/ui/toaster';

import Footer from './components/footer';
import Navbar from './components/navbar';
import ThemeProvider from './components/ui/theme/provider';
import routes from './config/routes';
import EStorageKeys from './constants/storage-keys';

const chains = [mainnet, polygon, avalanche, arbitrum, bsc, optimism, gnosis, fantom];
const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || '';
const metadata = {
  name: 'DeFi Builder',
  description: 'DeFi Builder',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/142919060']
};

const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

createWeb3Modal({ wagmiConfig, projectId, chains });
function App() {
  return (
    <BrowserRouter>
      <WagmiConfig config={wagmiConfig}>
        <ThemeProvider defaultTheme='system' storageKey={EStorageKeys.theme}>
          <Navbar />

          <main
            className='flex h-full w-full justify-center pb-20 pt-40 pl-1 pr-1'
            style={{
              background: `url(${mainBG}) no-repeat center top`
            }}
          >
            <Routes>
              {routes.map((route) => (
                <Route key={`route-${route.path}`} path={route.path} element={<route.page />} />
              ))}
            </Routes>
          </main>

          <Footer />

          <Toaster />
        </ThemeProvider>
      </WagmiConfig>
    </BrowserRouter>
  );
}

export default App;
