import type { Metadata } from 'next';
import type { OpenGraph } from 'next/dist/lib/metadata/types/opengraph-types';

export const openGraph: OpenGraph = {
  title: 'FlexFacilities',
  description: 'Free and Open Source facility rental software',
  url: 'https://github.com/biohackerellie/flexfacilities',
  siteName: 'FlexFacilities',
  images: [
    {
      url: 'https://flexroster.io/FlexOSS.jpg',
      width: 1472,
      height: 832,
    },
  ],
};
export const meta: Metadata = {
  title: 'FlexFacilities',
  description: 'Flexible Facility Rentals',
  keywords: ['Facility Rentals, Open Source, Facilities, k-12, Schools'],
  creator: 'Ellie Kerns',
  openGraph: openGraph,
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
