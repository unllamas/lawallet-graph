import type { Metadata } from 'next';

import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'LaWallet Graph',
  description: '...',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className='dark h-full scroll-smooth'>
      <body className='overflow-x-hidden antialiased'>{children}</body>
    </html>
  );
}
