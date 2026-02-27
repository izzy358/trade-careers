import type { MetadataRoute } from 'next';

const BASE_URL = 'https://frolicking-pastelito-510617.netlify.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
