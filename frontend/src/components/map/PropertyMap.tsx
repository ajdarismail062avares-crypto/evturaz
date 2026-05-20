'use client';

import { useState, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl } from 'react-map-gl';
import { Property } from '@/types';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Props {
  properties: Property[];
  onSelect?: (id: string) => void;
  className?: string;
  center?: [number, number];
}

export function PropertyMap({ properties, onSelect, className, center }: Props) {
  const [popup, setPopup] = useState<Property | null>(null);
  const [viewport, setViewport] = useState({
    latitude: center?.[0] ?? properties[0]?.latitude ?? 40.4093,
    longitude: center?.[1] ?? properties[0]?.longitude ?? 49.8671,
    zoom: 11,
  });

  const handleMarkerClick = useCallback((p: Property) => {
    setPopup(p);
    onSelect?.(p.id);
    setViewport(v => ({ ...v, latitude: p.latitude, longitude: p.longitude }));
  }, [onSelect]);

  return (
    <div className={cn('rounded-2xl overflow-hidden', className)}>
      <Map
        {...viewport}
        onMove={e => setViewport(e.viewState)}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />

        {properties.map(p => (
          <Marker
            key={p.id} latitude={p.latitude} longitude={p.longitude} anchor="bottom"
            onClick={e => { e.originalEvent.stopPropagation(); handleMarkerClick(p); }}
          >
            <div className={cn(
              'px-2.5 py-1.5 rounded-full text-xs font-bold cursor-pointer shadow-lg transition-all hover:scale-110',
              popup?.id === p.id ? 'bg-brand-500 text-white scale-110' : 'bg-luxury-dark border border-white/20 text-white hover:bg-brand-500'
            )}>
              {formatPrice(p.price, true)}
            </div>
          </Marker>
        ))}

        {popup && (
          <Popup
            latitude={popup.latitude} longitude={popup.longitude}
            anchor="top" onClose={() => setPopup(null)}
            closeButton={true} closeOnClick={false} maxWidth="280px"
          >
            <div className="bg-luxury-dark-2 rounded-xl overflow-hidden text-white">
              {popup.images[0] && (
                <img src={popup.images[0]} alt={popup.title} className="w-full h-36 object-cover" />
              )}
              <div className="p-3">
                <div className="font-bold text-lg">{formatPrice(popup.price)}</div>
                <div className="text-sm font-medium line-clamp-1 mb-1">{popup.title}</div>
                <div className="text-xs text-white/50 mb-3">{popup.city}, {popup.state}</div>
                <div className="flex items-center gap-3 text-xs text-white/60 mb-3">
                  {popup.bedrooms != null && <span>{popup.bedrooms} otaq</span>}
                  {popup.bathrooms != null && <span>{popup.bathrooms} hamam</span>}
                  <span>{popup.squareFeet.toLocaleString()} kv.fut</span>
                </div>
                <Link href={`/properties/${popup.id}`} className="btn-primary text-xs py-2 w-full text-center block">
                  Ətraflı Bax →
                </Link>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
