import React from 'react';

import { Check, Loader2, X } from 'lucide-react';

import { cn } from '@/lib/utils';

interface IGenerationStepsState {
  generateSCState: {
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
  };
  compileSCState: {
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
  };
  auditSCState: {
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
  };
}

export default function GenerationStepsState({
  generateSCState,
  compileSCState,
  auditSCState
}: IGenerationStepsState) {
  const generationSteps = [
    {
      number: 1,
      step: 'Generating',
      isLoading: generateSCState.isLoading,
      isSuccess: generateSCState.isSuccess,
      isError: generateSCState.isError,
      isStepConnected: true
    },
    {
      number: 2,
      step: 'Compiling',
      isLoading: compileSCState.isLoading,
      isSuccess: compileSCState.isSuccess,
      isError: compileSCState.isError,
      isStepConnected: true
    },
    {
      number: 3,
      step: 'Auditing',
      isLoading: auditSCState.isLoading,
      isSuccess: auditSCState.isSuccess,
      isError: auditSCState.isError,
      isStepConnected: true
    },
    {
      number: 4,
      step: 'Completed',
      isLoading: false,
      isSuccess: generateSCState.isSuccess && compileSCState.isSuccess && auditSCState.isSuccess,
      isError: generateSCState.isError && compileSCState.isError && auditSCState.isError,
      isStepConnected: false
    }
  ];

  return (
    <div className='flex gap-x-5'>
      {generationSteps.map((generationStep, index) => (
        <Step
          key={`${generationStep.step}-${index}`}
          number={generationStep.number}
          step={generationStep.step}
          isLoading={generationStep.isLoading}
          isSuccess={generationStep.isSuccess}
          isError={generationStep.isError}
          isStepConnected={generationStep.isStepConnected}
        />
      ))}
    </div>
  );
}

interface IStep {
  number: number;
  step: string;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isStepConnected: boolean;
}

/* eslint-disable unicorn/no-nested-ternary */
function Step({ number, step, isLoading, isSuccess, isError, isStepConnected }: IStep) {
  return (
    <div className='flex flex-col items-center justify-center gap-y-1.5'>
      <div
        className={cn(
          'relative flex h-7 w-7 items-center justify-center rounded-full bg-primary p-1 text-primary-foreground',
          { 'bg-blue-500 text-[#fafafa]': isSuccess, 'bg-red-500 text-[#fafafa]': isError }
        )}
      >
        {isLoading ? (
          <Loader2 className='h-7 w-7 animate-spin text-blue-500' />
        ) : isSuccess ? (
          <Check className='h-5 w-5' />
        ) : isError ? (
          <X className='h-5 w-5' />
        ) : (
          <span>{number}</span>
        )}

        {isStepConnected && (
          <span
            className={cn('absolute left-0 -z-[1] h-1 w-24 bg-primary text-primary-foreground', {
              'bg-blue-500': isSuccess,
              'bg-red-500': isError
            })}
          />
        )}
      </div>
      <span className='text-sm'>{step}</span>
    </div>
  );
}
