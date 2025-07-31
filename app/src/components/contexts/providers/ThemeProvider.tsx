"use client";

import type { ThemeProviderProps } from "next-themes/dist/types";
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProviders({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider attribute="class">{children}</NextThemesProvider>;
}
