import './globals.css';
import { Metadata } from 'next';
import ClientWrapper from './components/ClientWrapper';

export const metadata: Metadata = {
  title: 'EasyMarket',
  description: 'Your one-stop shop for all academic needs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}