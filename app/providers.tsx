'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        gutter={12}
        containerStyle={{
          top: 16,
          right: 16,
        }}
        toastOptions={{
          duration: 3000,
        }}
      />
    </>
  );
}
