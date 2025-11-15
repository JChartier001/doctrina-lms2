import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import ContextProviders from '@/providers';

import { Toaster } from 'sonner';
import './globals.css';

const poppins = Poppins({
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Doctrina LMS',
  description: ' A New Era For Medical Aesthetics Education',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ContextProviders>
      <html lang="en">
        <Toaster
          theme="light"
          position="bottom-center"
          richColors
          visibleToasts={1}
        />
        <body className={poppins.className}>{children}</body>
      </html>
    </ContextProviders>
  );
}
