import type { ReactNode } from 'react';
import { AuthProvider } from '@/core/auth';
import { ErrorBoundary } from '@/core/errors';
import { DropdownProvider } from './DropdownProvider';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DropdownProvider>
          {children}
        </DropdownProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
