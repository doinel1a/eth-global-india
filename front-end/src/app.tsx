import React from 'react';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

import mainBG from '@/assets/images/main-bg.svg';

import Footer from './components/footer';
import Navbar from './components/navbar';
import ThemeProvider from './components/ui/theme/provider';
import routes from './config/routes';
import EStorageKeys from './constants/storage-keys';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme='system' storageKey={EStorageKeys.theme}>
        <Navbar />

        <main
          className='flex h-full w-full justify-center pt-40'
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
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
