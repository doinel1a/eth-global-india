import React from 'react';

import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <main className='flex h-full w-full items-center justify-center'>
        <h1 className='text-4xl'>Hello, ETH India!</h1>
      </main>
    </BrowserRouter>
  );
}

export default App;
