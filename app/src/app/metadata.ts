import type { Metadata } from 'next';

export const meta: Metadata = {
  title: 'FlexFacilities',
  description: 'Flexible Facility Rentals',
  keywords: ['Facility Rentals, Open Source, Facilities'],
  authors: [{ name: 'Ellie Kerns', url: 'https://epklabs.com' }],
  creator: 'Ellie Kerns',
  publisher: 'EPKLabs',
  openGraph: {
    title: 'FlexFacilities',
    description: 'Open Source Facility Rentals',
    siteName: 'FlexFacilities',

    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: false,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: false,
    },
  },
} as const;
