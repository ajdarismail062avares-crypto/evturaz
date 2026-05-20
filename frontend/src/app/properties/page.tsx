import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/ui/Navbar';
import { PropertiesClient } from './PropertiesClient';

export const metadata: Metadata = {
  title: 'Əmlaklar',
  description: 'Azərbaycanda satılık, kirayə və icarə evlər — interaktiv xəritə və 3D virtual turlarla axtarın.',
};

export default function PropertiesPage() {
  return (
    <div className="min-h-screen bg-luxury-dark">
      <Navbar />
      <Suspense fallback={<div className="pt-24 section text-white/50">Əmlaklar yüklənir...</div>}>
        <PropertiesClient />
      </Suspense>
    </div>
  );
}
