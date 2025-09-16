import type { Metadata } from 'next';

export const meta: Metadata = {
  title: 'FlexFacilities',
  description: 'Laurel Public Schools in Laurel, Montana Facility Rentals 🏳',
  keywords: ['Laurel Public Schools, Facility Rentals, Laurel, Montana'],
  authors: [{ name: 'Ellie Kerns', url: 'https://epklabs.com' }],
  creator: 'Ellie Kerns',
  publisher: 'EPKLabs',
  openGraph: {
    title: 'LPS Facilities',
    description: 'Laurel Public Schools Facility Rentals',
    siteName: 'LPS Facilities',

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
