import React, { useEffect, useState } from 'react';

import { BrowserProvider, ContractFactory } from 'ethers';
import { Copy, FileDown } from 'lucide-react';

import { useToast } from '@/components/ui/use-toast';
import { mapChainToFileExtension } from '@/lib/mappers';
import useSelectedChainStore from '@/store/selected-chain';
import useSCIterStore from '@/store/smart-contract-iter';

import { Button } from '../ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import SectionContainer from './container';

const isClipboardApiSupported = !!(navigator.clipboard && navigator.clipboard.writeText);

interface ISmartContractCode {
  smartContractCode: string;
}

interface IContructorArguments {
  name: string;
  type: string;
}

export default function SmartContractCodeViewer({ smartContractCode }: ISmartContractCode) {
  const selectedChain = useSelectedChainStore((store) => store.selectedChain);

  const { compileSC } = useSCIterStore.getState();
  const { deploySC } = useSCIterStore.getState();

  const setDeploySC = useSCIterStore((store) => store.setDeploySC);

  const { toast } = useToast();
  const [contructorArguments, setConstructorArguments] = useState<IContructorArguments[]>([]);

  // eslint-disable-next-line sonarjs/cognitive-complexity
  useEffect(() => {
    if (
      compileSC &&
      'artifact' in compileSC &&
      compileSC.artifact &&
      typeof compileSC.artifact === 'object' &&
      'abi' in compileSC.artifact &&
      compileSC.artifact.abi &&
      typeof compileSC.artifact.abi === 'object'
    ) {
      console.log('ABI', compileSC.artifact.abi);

      const abiElements = compileSC.artifact.abi;

      for (const element of Object.values(abiElements)) {
        console.log('ABI ELEMENT', element);

        if (
          element &&
          typeof element === 'object' &&
          'type' in element &&
          typeof element.type === 'string' &&
          element.type === 'constructor'
        ) {
          console.log('CONSTRUCTOR', element);

          const constructor = element;

          if (
            constructor &&
            typeof constructor === 'object' &&
            'inputs' in constructor &&
            Array.isArray(constructor.inputs)
          ) {
            // eslint-disable-next-line quotes
            console.log("CONSTRUCTOR'S INPUTS", constructor.inputs);

            const constructorArguments: IContructorArguments[] = [];
            const constructorsInputs = constructor.inputs;

            for (const input in constructorsInputs) {
              if (
                input &&
                typeof input === 'object' &&
                'name' in input &&
                typeof input.name === 'string' &&
                'type' in input &&
                typeof input.type === 'string'
              ) {
                constructorArguments.push({
                  name: input.name,
                  type: input.type
                });
              }
            }

            setConstructorArguments(constructorArguments);
          }
        }
      }
    }
  }, [compileSC]);

  async function deployContract() {
    try {
      console.log('DEPLOYING SUCA');
      if (!window.ethereum) throw new Error('No ethereum provider found');
      const { compileSC } = useSCIterStore.getState();
      console.log('ARTIFACT', compileSC.artifact);
      setDeploySC({ isLoading: true, isSuccess: false, isError: false, deploymentAddress: '' });
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      console.log('SIGNER', signer.address);
      const contractFactory = new ContractFactory(
        compileSC.artifact.abi,
        compileSC.artifact.bytecode,
        signer
      );
      console.log('CONTRACT FACTORY', contractFactory);

      const deployedContract = await contractFactory.deploy(/** args */);
      console.log('DEPLOYED CONTRACT', deployedContract);
      const deploymentAddress = await deployedContract.getAddress();
      await deployedContract.waitForDeployment();
      setDeploySC({
        isLoading: false,
        isSuccess: true,
        isError: false,
        deploymentAddress: deploymentAddress
      });
      console.log('DEPLOY TX MINED SASATI LA PIDARI', deploymentAddress);
    } catch (error) {
      if (error instanceof Error) {
        console.log('ERROR', error);
        setDeploySC({ isLoading: false, isSuccess: false, isError: true, deploymentAddress: '' });
      }
    }
  }

  return (
    <SectionContainer className='flex flex-col items-start justify-between gap-y-10 px-10 py-12 backdrop-blur-md'>
      <div className='flex w-full items-start justify-between'>
        <div className='flex flex-col'>
          <h2 className='mb-2 text-3xl font-semibold'>Smart Contract Code</h2>
          <h3 className='text-lg'>Get the smart contract for your {selectedChain} project</h3>
        </div>

        {contructorArguments.length === 0 ? (
          <Button onClick={deployContract}>Deploy Smart Contract</Button>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <Button>Deploy Smart Contract</Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-md'>
              <DialogHeader>
                <DialogTitle>Deploy Smart Contract</DialogTitle>
                <DialogDescription>
                  Here you can provide the arguments for the constructor.
                </DialogDescription>
              </DialogHeader>
              <div className='flex items-center space-x-2'>
                {contructorArguments.map((argument, index) => (
                  <div key={`${argument}-${index}`}>
                    <Label htmlFor={argument.name} className='first-letter:uppercase'>
                      {argument.name}
                    </Label>

                    <Input
                      id={argument.name}
                      type={argument.type}
                      placeholder={`Insert ${argument}`}
                    />
                  </div>
                ))}
              </div>
              <DialogFooter className='sm:justify-start'>
                <DialogClose asChild>
                  <Button type='button' variant='secondary'>
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
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
