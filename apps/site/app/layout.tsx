import type { Metadata } from 'next';

import { Providers } from '@/components/providers';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'GuideShot — Screenshots that explain themselves',
    template: '%s — GuideShot',
  },
  description:
    'Capture real product states and turn them into durable, annotated guides.',
  openGraph: {
    title: 'GuideShot — Screenshots that explain themselves',
    description:
      'Capture real product states and turn them into durable, annotated guides.',
    type: 'website',
    images: [
      {
        url: 'https://raw.githubusercontent.com/wemuda/guideshot/main/assets/guideshot-banner.png',
        width: 2172,
        height: 724,
        alt: 'GuideShot annotated interface and responsive variants',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GuideShot — Screenshots that explain themselves',
    description:
      'Capture real product states and turn them into durable, annotated guides.',
    images: [
      'https://raw.githubusercontent.com/wemuda/guideshot/main/assets/guideshot-banner.png',
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
