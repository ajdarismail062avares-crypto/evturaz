'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, Bed, Bath, Maximize, MapPin, Play, Star } from 'lucide-react';
import { Property } from '@/types';
import { cn, formatPrice } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface PropertyCardProps {
  property: Property;
  index?: number;
  className?: string;
}

export function PropertyCard({ property, index = 0, className }: PropertyCardProps) {
  const [favorited, setFavorited] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const { user } = useAuthStore();

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Sevimlilərə əlavə etmək üçün daxil olun'); return; }
    try {
      const { data } = await api.post(`/properties/${property.id}/favorite`);
      setFavorited(data.favorited);
      toast.success(data.favorited ? 'Sevimlilərə əlavə edildi' : 'Sevimlilərdən çıxarıldı');
    } catch {
      toast.error('Xəta baş verdi');
    }
  };

  const listingBadge = {
    FOR_SALE: { label: 'Satılır', cls: 'bg-brand-500' },
    FOR_RENT: { label: 'Kirayədir', cls: 'bg-purple-500' },
    FOR_LEASE: { label: 'İcarədir', cls: 'bg-orange-500' },
    AUCTION: { label: 'Hərrac', cls: 'bg-red-500' },
  }[property.listingType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={cn('card group cursor-pointer', className)}
    >
      <Link href={`/properties/${property.id}`}>
        {/* Şəkil */}
        <div className="relative h-56 overflow-hidden">
          {property.images[imgIdx] ? (
            <Image
              src={property.images[imgIdx]}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-luxury-dark-2 to-luxury-dark-3 flex items-center justify-center">
              <span className="text-4xl">🏠</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Etiketlər */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full text-white', listingBadge.cls)}>
              {listingBadge.label}
            </span>
            {property.isFeatured && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-luxury-gold text-luxury-dark">Seçilmiş</span>
            )}
          </div>

          {/* 3D Tur etiketi */}
          {property.has3DTour && (
            <div className="absolute top-3 right-12 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
              <Play size={10} className="text-brand-400" />
              <span className="text-xs text-brand-400 font-semibold">3D Tur</span>
            </div>
          )}

          {/* Sevimli düyməsi */}
          <button
            onClick={handleFavorite}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all"
          >
            <Heart size={16} className={cn('transition-colors', favorited ? 'fill-red-500 text-red-500' : 'text-white')} />
          </button>

          {/* Şəkil nöqtələri */}
          {property.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {property.images.slice(0, 5).map((_, i) => (
                <button
                  key={i}
                  onClick={e => { e.preventDefault(); setImgIdx(i); }}
                  className={cn('w-1.5 h-1.5 rounded-full transition-all', i === imgIdx ? 'bg-white w-4' : 'bg-white/50')}
                />
              ))}
            </div>
          )}
        </div>

        {/* Məzmun */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="text-2xl font-bold text-white">
                {formatPrice(property.price)}
                {property.listingType === 'FOR_RENT' && <span className="text-sm font-normal text-white/50">/ay</span>}
              </div>
              {property.estimatedValue && property.estimatedValue !== property.price && (
                <div className="text-xs text-white/40">Təxmini: {formatPrice(property.estimatedValue)}</div>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-white/60">
              <Star size={14} className="fill-luxury-gold text-luxury-gold" />
              <span>4.8</span>
            </div>
          </div>

          <h3 className="font-semibold text-white mb-1 line-clamp-1 group-hover:text-brand-300 transition-colors">
            {property.title}
          </h3>

          <div className="flex items-center gap-1 text-white/50 text-sm mb-4">
            <MapPin size={13} />
            <span className="line-clamp-1">{property.address}, {property.city}</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-white/60 border-t border-white/10 pt-4">
            {property.bedrooms != null && (
              <div className="flex items-center gap-1.5">
                <Bed size={14} />
                <span>{property.bedrooms} otaq</span>
              </div>
            )}
            {property.bathrooms != null && (
              <div className="flex items-center gap-1.5">
                <Bath size={14} />
                <span>{property.bathrooms} hamam</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 ml-auto">
              <Maximize size={14} />
              <span>{property.squareFeet.toLocaleString()} kv.fut</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
