// components/providers.tsx
"use client";

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { StompSessionProvider } from "react-stomp-hooks"
import { AppConfig } from "@/core/app-config"

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <StompSessionProvider url={AppConfig.stompBaseUrl}>
      <SessionProvider>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </SessionProvider>
    </StompSessionProvider>
  );
}