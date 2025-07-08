// components/providers.tsx
"use client";

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from "@/components/ui/sonner";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </SessionProvider>
  );
}