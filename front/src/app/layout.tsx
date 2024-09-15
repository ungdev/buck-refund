import '@/global.scss';
import Providers from '@/lib/Providers';
import React, { ReactNode, Suspense } from 'react';
import Redirecter from '@/components/utilities/Redirecter';
import AutoLogin from '@/components/utilities/AutoLogin';
import Wrapper from '@/components/utilities/Wrapper';
import PageSearchParams from '@/components/utilities/PageSearchParams';
import { Lexend } from 'next/font/google';

const lexend = Lexend({
  weight: ['400', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-lexend',
  fallback: ['sans-serif'],
  display: 'swap',
});

export const metadata = {
  title: 'BuckUTT - Transfert',
  description: 'Récupère ton solde BuckUTT',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className={lexend.variable}>
      <Providers>
        <Redirecter />
        <AutoLogin />
        <Suspense>
          <PageSearchParams />
        </Suspense>
        <body>
          <Wrapper>{children}</Wrapper>
        </body>
      </Providers>
    </html>
  );
}
