import { Inter, JetBrains_Mono } from 'next/font/google';

import { ThemeProviders } from '@/components/contexts/providers/ThemeProvider';
import { cn } from '@/lib/utils';

import './styles/globals.css';

export { meta as metadata } from './metadata';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});
const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

//layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning={true}>
      <body
        className={cn(
          'h-screen font-sans antialiased',
          fontSans.variable,
          fontMono.variable,
        )}
      >
        <ThemeProviders attribute='class' defaultTheme='system' enableSystem>
          {children}
        </ThemeProviders>
      </body>
    </html>
  );
}
