'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Grid3X3, Map, ChevronLeft, ChevronRight } from 'lucide-react';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { PropertyMap } from '@/components/map/PropertyMap';
import { FilterPanel } from '@/components/ui/FilterPanel';
import { SearchBar } from '@/components/ui/SearchBar';
import { api } from '@/lib/api';
import { Property } from '@/types';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'map' | 'split';

export function PropertiesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

  const currentPage = parseInt(searchParams.get('page') || '1');

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(searchParams.entries());
      const { data } = await api.get('/properties', { params });
      setProperties(data.properties);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`/properties?${params.toString()}`);
  };

  const SORT_OPTIONS = [
    { value: 'createdAt_desc', label: 'Ən Yeni' },
    { value: 'price_asc', label: 'Qiymət ↑' },
    { value: 'price_desc', label: 'Qiymət ↓' },
    { value: 'viewCount_desc', label: 'Populyar' },
    { value: 'squareFeet_desc', label: 'Ən Böyük' },
  ];

  return (
    <div className="pt-20 min-h-screen">
      {/* Üst panel */}
      <div className="border-b border-white/10 bg-luxury-dark/80 backdrop-blur-xl sticky top-16 z-30">
        <div className="section py-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <SearchBar compact className="max-w-lg" />
            </div>

            {/* Sıralama */}
            <select
              className="glass rounded-xl px-3 py-2 text-sm text-white bg-transparent cursor-pointer"
              defaultValue="createdAt_desc"
              onChange={e => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('sort', e.target.value);
                router.push(`/properties?${params.toString()}`);
              }}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-luxury-dark">{o.label}</option>)}
            </select>

            {/* Filtrlər */}
            <button onClick={() => setShowFilters(s => !s)}
              className={cn('glass rounded-xl px-4 py-2 text-sm flex items-center gap-2 transition-colors',
                showFilters ? 'border-brand-500 text-brand-300' : 'text-white/70 hover:text-white')}>
              <SlidersHorizontal size={16} /> Filtrlər
            </button>

            {/* Görüntü rejimi */}
            <div className="glass rounded-xl flex overflow-hidden">
              {([['grid', Grid3X3], ['map', Map], ['split', SlidersHorizontal]] as const).map(([v, Icon]) => (
                <button key={v} onClick={() => setView(v as ViewMode)}
                  className={cn('p-2.5 transition-colors', view === v ? 'bg-brand-500 text-white' : 'text-white/60 hover:text-white')}>
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          <div className="text-sm text-white/40 mt-2">
            {loading ? 'Axtarılır...' : `${total.toLocaleString()} əmlak tapıldı`}
          </div>
        </div>
      </div>

      {showFilters && <FilterPanel onClose={() => setShowFilters(false)} />}

      <div className={cn('section py-6', view === 'split' && 'max-w-full px-0')}>
        {view === 'map' ? (
          <PropertyMap properties={properties} onSelect={setSelectedProperty} className="h-[calc(100vh-200px)]" />
        ) : view === 'split' ? (
          <div className="flex h-[calc(100vh-200px)]">
            <div className="w-1/2 overflow-y-auto px-4 py-2">
              <PropertyGrid properties={properties} loading={loading} selectedId={selectedProperty} />
            </div>
            <PropertyMap properties={properties} onSelect={setSelectedProperty} className="w-1/2 h-full sticky top-0" />
          </div>
        ) : (
          <PropertyGrid properties={properties} loading={loading} selectedId={selectedProperty} />
        )}

        {/* Səhifələmə */}
        {pages > 1 && view !== 'map' && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}
              className="glass rounded-lg p-2 disabled:opacity-30 hover:bg-white/10 transition-colors">
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
              const p = i + 1;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={cn('w-10 h-10 rounded-lg text-sm font-medium transition-colors',
                    p === currentPage ? 'bg-brand-500 text-white' : 'glass text-white/60 hover:text-white')}>
                  {p}
                </button>
              );
            })}

            <button disabled={currentPage >= pages} onClick={() => setPage(currentPage + 1)}
              className="glass rounded-lg p-2 disabled:opacity-30 hover:bg-white/10 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PropertyGrid({ properties, loading, selectedId }: { properties: Property[]; loading: boolean; selectedId: string | null }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="card h-72 shimmer" />
        ))}
      </div>
    );
  }
  if (properties.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="text-6xl mb-4">🏠</div>
        <h3 className="text-xl font-semibold mb-2">Əmlak tapılmadı</h3>
        <p className="text-white/50">Axtarış filtrlərini dəyişdirməyi sınayın</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((p, i) => (
        <PropertyCard key={p.id} property={p} index={i}
          className={selectedId === p.id ? 'ring-2 ring-brand-500' : ''} />
      ))}
    </div>
  );
}
