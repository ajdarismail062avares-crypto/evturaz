'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Props { onClose: () => void }

const PROPERTY_TYPES = [
  { value: 'HOUSE', label: 'Ev' },
  { value: 'APARTMENT', label: 'Mənzil' },
  { value: 'CONDO', label: 'Kondo' },
  { value: 'COMMERCIAL', label: 'Kommersiya' },
  { value: 'LAND', label: 'Torpaq' },
  { value: 'TOWNHOUSE', label: 'Şəhər evi' },
  { value: 'VILLA', label: 'Villa' },
];

export function FilterPanel({ onClose }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minBeds, setMinBeds] = useState(searchParams.get('minBeds') || '');
  const [minBaths, setMinBaths] = useState(searchParams.get('minBaths') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [minSqft, setMinSqft] = useState(searchParams.get('minSqft') || '');
  const [has3DTour, setHas3DTour] = useState(false);

  const apply = () => {
    const params = new URLSearchParams(searchParams.toString());
    const set = (k: string, v: string) => v ? params.set(k, v) : params.delete(k);
    set('minPrice', minPrice);
    set('maxPrice', maxPrice);
    set('minBeds', minBeds);
    set('minBaths', minBaths);
    set('type', type);
    set('minSqft', minSqft);
    params.delete('page');
    router.push(`/properties?${params.toString()}`);
    onClose();
  };

  const clear = () => {
    setMinPrice(''); setMaxPrice(''); setMinBeds(''); setMinBaths(''); setType(''); setMinSqft('');
    router.push('/properties');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="border-b border-white/10 bg-luxury-dark-2/80 backdrop-blur-xl"
    >
      <div className="section py-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Qiymət aralığı */}
          <div className="lg:col-span-1">
            <label className="text-xs text-white/50 uppercase tracking-wide mb-2 block">Qiymət Aralığı</label>
            <div className="flex gap-2">
              <input value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min ₼" className="input py-2 text-sm" />
              <input value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max ₼" className="input py-2 text-sm" />
            </div>
          </div>

          {/* Otaq sayı */}
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wide mb-2 block">Min Otaq Sayı</label>
            <div className="flex gap-1.5">
              {['', '1', '2', '3', '4', '5'].map(b => (
                <button key={b} onClick={() => setMinBeds(b)}
                  className={cn('flex-1 py-2 rounded-lg text-sm font-medium transition-all', minBeds === b ? 'bg-brand-500 text-white' : 'glass text-white/60 hover:text-white')}>
                  {b || 'Hamısı'}
                </button>
              ))}
            </div>
          </div>

          {/* Hamam sayı */}
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wide mb-2 block">Min Hamam Sayı</label>
            <div className="flex gap-1.5">
              {['', '1', '2', '3', '4'].map(b => (
                <button key={b} onClick={() => setMinBaths(b)}
                  className={cn('flex-1 py-2 rounded-lg text-sm font-medium transition-all', minBaths === b ? 'bg-brand-500 text-white' : 'glass text-white/60 hover:text-white')}>
                  {b || 'Hamısı'}
                </button>
              ))}
            </div>
          </div>

          {/* Sahə */}
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wide mb-2 block">Min Sahə (kv.fut)</label>
            <select value={minSqft} onChange={e => setMinSqft(e.target.value)} className="input py-2 text-sm bg-transparent">
              <option value="" className="bg-luxury-dark">İstənilən</option>
              {[500, 750, 1000, 1500, 2000, 3000, 4000, 5000].map(s => (
                <option key={s} value={s} className="bg-luxury-dark">{s.toLocaleString()}+ kv.fut</option>
              ))}
            </select>
          </div>
        </div>

        {/* Əmlak növü */}
        <div className="mt-5">
          <label className="text-xs text-white/50 uppercase tracking-wide mb-2 block">Əmlak Növü</label>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setType('')}
              className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-all', type === '' ? 'bg-brand-500 text-white' : 'glass text-white/60 hover:text-white')}>
              Bütün Növlər
            </button>
            {PROPERTY_TYPES.map(t => (
              <button key={t.value} onClick={() => setType(t.value)}
                className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-all', type === t.value ? 'bg-brand-500 text-white' : 'glass text-white/60 hover:text-white')}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Tur filtri */}
        <div className="flex items-center gap-3 mt-4">
          <button onClick={() => setHas3DTour(h => !h)}
            className={cn('w-12 h-6 rounded-full transition-colors', has3DTour ? 'bg-brand-500' : 'bg-white/20')}>
            <div className={cn('w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5', has3DTour ? 'translate-x-6' : '')} />
          </button>
          <label className="text-sm text-white/70">Yalnız 3D Virtual Tur olan elanlar</label>
        </div>

        {/* Düymələr */}
        <div className="flex items-center gap-3 mt-5">
          <button onClick={apply} className="btn-primary">Filtrləri Tətbiq Et</button>
          <button onClick={clear} className="btn-secondary text-sm">Hamısını Sil</button>
        </div>
      </div>
    </motion.div>
  );
}
