"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";
import { usePathname } from "next/navigation";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");

  return (
    <NextThemesProvider {...props} forcedTheme={isAuthPage ? "light" : undefined}>
      {children}
    </NextThemesProvider>
  );
}
