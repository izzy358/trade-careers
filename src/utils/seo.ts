import type { Metadata } from 'next';

export const SITE_NAME = 'Trade Careers';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tradecareers.com';

export function absoluteUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, SITE_URL).toString();
}

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
};

export function buildMetadata({
  title,
  description,
  path,
  type = 'website',
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      type,
      url,
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}
