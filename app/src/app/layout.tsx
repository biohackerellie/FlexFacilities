import React from "react";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import AuthProvider from "@/components/contexts/providers/AuthProvider";
import { ThemeProviders } from "@/components/contexts/providers/ThemeProvider";
import Footer from "@/components/ui/footer";
import Navbar from "@/components/ui/navbar/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

import "./styles/globals.css";

export { meta as metadata } from "./metadata";

//layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          GeistSans.variable,
          GeistMono.variable,
        )}
      >
        <AuthProvider>
          <ThemeProviders attribute="class" defaultTheme="system" enableSystem>
              <Navbar />

              {children}
              <Footer />
            <Toaster />
          </ThemeProviders>
        </AuthProvider>
      </body>
    </html>
  );
}
