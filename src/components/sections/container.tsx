import type { PropsWithChildren } from 'react';

import React from 'react';

import { cn } from '@/lib/utils';

interface ISectionContainer extends PropsWithChildren, React.HTMLAttributes<HTMLDivElement> {}

export default function SectionContainer({
  className,
  children,
  ...properties
}: ISectionContainer) {
  return (
    <section className={cn('border-border w-full rounded-3xl border-2', className)} {...properties}>
      {children}
    </section>
  );
}
