'use client';

import type { ReactNode } from 'react';
import { CigarAppProvider } from '@/context/CigarAppContext';

export default function Providers({ children }: { children: ReactNode }) {
  return <CigarAppProvider>{children}</CigarAppProvider>;
}