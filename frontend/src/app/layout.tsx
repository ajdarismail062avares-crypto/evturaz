import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: { default: 'evtur.az — Əmlakın Gələcəyi', template: '%s | evtur.az' },
  description: 'İmmersiv 3D virtual turlar, AI tövsiyələri və lüks əmlak platforması ilə xəyal evinizi tapın.',
  keywords: ['əmlak', 'virtual tur', '3D gəzinti', 'satılık evlər', 'kirayə mənzillər', 'lüks evlər', 'azerbaycan'],
  openGraph: {
    type: 'website',
    siteName: 'evtur.az',
    title: 'evtur.az — Əmlakın Gələcəyi',
    description: 'AI ilə gücləndirilmiş immersiv 3D virtual əmlak turları',
    locale: 'az_AZ',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
              duration: 4000,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
