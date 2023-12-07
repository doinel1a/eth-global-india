import React from 'react';

import { BrowserRouter } from 'react-router-dom';

import ThemeProvider from './components/ui/theme/provider';
import EStorageKeys from './constants/storage-keys';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme='system' storageKey={EStorageKeys.theme}>
        <main className='flex h-full w-full items-center justify-center'>
          <h1 className='text-4xl'>Hello, ETH India!</h1>
        </main>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
