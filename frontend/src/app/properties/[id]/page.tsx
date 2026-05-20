import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { PropertyDetailClient } from './PropertyDetailClient';

async function getProperty(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const property = await getProperty(params.id);
  if (!property) return { title: 'Property Not Found' };
  return {
    title: property.title,
    description: property.description.slice(0, 160),
    openGraph: {
      title: property.title,
      description: property.description.slice(0, 160),
      images: property.images[0] ? [{ url: property.images[0] }] : [],
      type: 'website',
    },
  };
}

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  const property = await getProperty(params.id);
  if (!property) notFound();
  return (
    <div className="min-h-screen bg-luxury-dark">
      <Navbar />
      <PropertyDetailClient property={property} />
    </div>
  );
}
