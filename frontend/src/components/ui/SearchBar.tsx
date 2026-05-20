'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  className?: string;
  compact?: boolean;
}

const LIST_TYPES = [
  { label: 'Satılık', value: 'FOR_SALE' },
  { label: 'Kirayə', value: 'FOR_RENT' },
  { label: 'İcarə', value: 'FOR_LEASE' },
  { label: 'Hərrac', value: 'AUCTION' },
];

export function SearchBar({ className, compact = false }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [listingType, setListingType] = useState('FOR_SALE');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    params.set('listingType', listingType);
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="glass rounded-2xl p-2 flex flex-col sm:flex-row gap-2">
        {/* Elan növü */}
        <div className="flex border-b sm:border-b-0 sm:border-r border-white/10 pb-2 sm:pb-0 sm:pr-2 gap-1">
          {LIST_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setListingType(t.value)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                listingType === t.value ? 'bg-brand-500 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Axtarış sahəsi */}
        <div className="flex items-center gap-2 flex-1 px-2">
          <MapPin size={18} className="text-white/40 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Şəhər, məhəllə, ünvan və ya poçt kodu axtar..."
            className="flex-1 bg-transparent text-white placeholder-white/40 text-sm focus:outline-none"
          />
        </div>

        {/* Axtar düyməsi */}
        <button onClick={handleSearch} className="btn-primary flex items-center gap-2 px-6 py-3 flex-shrink-0">
          <Search size={18} />
          <span className="hidden sm:inline">Axtar</span>
        </button>
      </div>

      {!compact && (
        <div className="flex items-center justify-center gap-6 mt-4 text-sm text-white/50">
          <span>Populyar:</span>
          {['Bakı', 'Gəncə', 'Sumqayıt', 'Şirvan', 'Lənkəran'].map(city => (
            <button
              key={city}
              onClick={() => { setQuery(city); setTimeout(handleSearch, 0); }}
              className="hover:text-white transition-colors"
            >
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
