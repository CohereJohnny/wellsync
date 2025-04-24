'use client';

import { ThemeProvider } from 'next-themes';
import { SupabaseProvider } from '@/context/supabase-context';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <SupabaseProvider>
        {children}
      </SupabaseProvider>
    </ThemeProvider>
  );
} 