/* eslint-disable indent */
import React from 'react';

import useSelectedChainStore from '@/store/selected-chain';
import useSCIterStore from '@/store/smart-contract-iter';

import SectionContainer from '../container';
import DownloadPDFButton from './pdf-report/download-report-button';

export default function AuditSection() {
  const selectedChain = useSelectedChainStore((store) => store.selectedChain);

  const auditResponse = useSCIterStore((store) => store.auditSC.auditingOutput);

  return (
    <SectionContainer className='flex flex-col items-start justify-between gap-y-10 px-10 py-12 backdrop-blur-md'>
      <div className='flex w-full items-start justify-between'>
        <div className='flex flex-col'>
          <h2 className='mb-2 text-3xl font-semibold'>Smart Contract Audit</h2>
          <h3 className='text-lg'>Get to know how&apos;s your {selectedChain} Smart Contract </h3>
        </div>

        {/* 
          If auditResponse is STRING, it means the AUDITING SERVICE returned an error;
          If auditResponse is EMPTY, it means there are no AUDITS (the AUDITING SERVICE returned an EMPTY object)
        */}
        {typeof auditResponse === 'string' ||
        (Array.isArray(auditResponse) && auditResponse.length === 0) ? (
          <></>
        ) : (
          <DownloadPDFButton auditResponse={auditResponse} />
        )}
      </div>
    </SectionContainer>
  );
}
