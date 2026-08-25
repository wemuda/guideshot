import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'GuideShot — Guides that never drift',
  description:
    'Generate reproducible, annotated screenshots of real product states from one declarative recipe.',
  openGraph: {
    title: 'GuideShot — Guides that never drift',
    description:
      'Generate reproducible, annotated screenshots of real product states from one declarative recipe.',
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
    title: 'GuideShot — Guides that never drift',
    description:
      'Generate reproducible, annotated screenshots of real product states from one declarative recipe.',
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
