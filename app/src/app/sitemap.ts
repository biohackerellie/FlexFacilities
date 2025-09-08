import type { MetadataRoute } from 'next';

const baseURL = process.env.NEXT_PUBLIC_HOST;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${baseURL}`,
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: `${baseURL}/facilities`,
    },
    {
      url: `${baseURL}/calendar`,
    },
  ];
}
