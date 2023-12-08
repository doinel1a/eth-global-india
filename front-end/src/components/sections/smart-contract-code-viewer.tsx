import React from 'react';

import { Copy, FileDown } from 'lucide-react';

import { useToast } from '@/components/ui/use-toast';
import { mapChainToFileExtension } from '@/lib/mappers';
import useSelectedChainStore from '@/store/selected-chain';

import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import SectionContainer from './container';

const isClipboardApiSupported = !!(navigator.clipboard && navigator.clipboard.writeText);

interface ISmartContractCode {
  smartContractCode: string;
}

export default function SmartContractCodeViewer({ smartContractCode }: ISmartContractCode) {
  const selectedChain = useSelectedChainStore((store) => store.selectedChain);

  const { toast } = useToast();

  return (
    <SectionContainer className='flex flex-col items-start justify-between gap-y-10 px-10 py-12 backdrop-blur-md'>
      <div>
        <h2 className='mb-2 text-3xl font-semibold'>Smart Contract Code</h2>
        <h3 className='text-lg'>Get the smart contract for your {selectedChain} project</h3>
      </div>

      <div className='relative flex w-full'>
        <Textarea
          value={smartContractCode}
          readOnly
          className='h-96 w-full resize-none rounded-3xl p-5'
        />

        <div className='absolute right-5 top-5 flex gap-x-5'>
          <Button
            variant='outline'
            className='p-2.5'
            onClick={() => {
              downloadSmartContractCode(
                smartContractCode,
                `smart-contract.${mapChainToFileExtension(selectedChain)}`
              );

              toast({
                title: 'Success',
                description: 'Smart Contract downloaded successfully!'
              });
            }}
          >
            <FileDown className='h-5 w-5' />
          </Button>
          {isClipboardApiSupported ? (
            <Button
              variant='outline'
              className='p-2.5'
              onClick={() => {
                copySmartContractCode(smartContractCode);

                toast({
                  title: 'Success',
                  description: 'Smart Contract code copied successfully!'
                });
              }}
            >
              <Copy className='h-5 w-5' />
            </Button>
          ) : (
            <></>
          )}
        </div>
      </div>
    </SectionContainer>
  );
}

function downloadSmartContractCode(smartContractCode: string, fileName: string) {
  const smartContractBlob = new Blob([smartContractCode], { type: 'text/plain' });
  const url = URL.createObjectURL(smartContractBlob);

  const temporaryAnchor = document.createElement('a');
  temporaryAnchor.href = url;
  temporaryAnchor.download = fileName;

  document.body.append(temporaryAnchor);
  temporaryAnchor.click();
  document.body.append(temporaryAnchor);

  URL.revokeObjectURL(url);
}

function copySmartContractCode(smartContractCode: string) {
  navigator.clipboard.writeText(smartContractCode);
}
