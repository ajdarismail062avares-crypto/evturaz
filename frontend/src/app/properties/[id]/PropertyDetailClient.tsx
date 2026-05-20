'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Bed, Bath, Maximize, MapPin, Heart, Share2, Play, Calendar,
  Phone, Mail, Star, ChevronLeft, ChevronRight, Home, Zap, Shield,
} from 'lucide-react';
import { Property } from '@/types';
import { formatPrice, generateDemoRoomData } from '@/lib/utils';
import { MortgageCalculator } from '@/components/ui/MortgageCalculator';
import { AIAssistant } from '@/components/ai/AIAssistant';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Props { property: Property }

const TABS = ['Ümumi', 'Detallar', 'İpoteka', 'AI Köməkçi', 'Rəylər'];

export function PropertyDetailClient({ property }: Props) {
  const [imgIdx, setImgIdx] = useState(0);
  const [tab, setTab] = useState('Ümumi');
  const [favorited, setFavorited] = useState(false);

  const prevImg = () => setImgIdx(i => (i - 1 + property.images.length) % property.images.length);
  const nextImg = () => setImgIdx(i => (i + 1) % property.images.length);

  const amenityIcons: Record<string, string> = {
    pool: '🏊', garage: '🚗', 'air conditioning': '❄️', heating: '🔥',
    'washer/dryer': '👕', furnished: '🛋️', 'pet friendly': '🐾', basement: '🏠',
  };

  const listingLabel: Record<string, string> = {
    FOR_SALE: 'SATILIR', FOR_RENT: 'KİRAYƏDİR', FOR_LEASE: 'İCARƏDİR', AUCTION: 'HƏRRAC',
  };
  const typeLabel: Record<string, string> = {
    HOUSE: 'Ev', APARTMENT: 'Mənzil', CONDO: 'Kondo', COMMERCIAL: 'Kommersiya',
    LAND: 'Torpaq', TOWNHOUSE: 'Şəhər evi', VILLA: 'Villa',
  };

  return (
    <div className="pt-20 pb-24">
      {/* Şəkil qalereyası */}
      <div className="relative h-[60vh] min-h-96 overflow-hidden">
        {property.images.length > 0 ? (
          <Image src={property.images[imgIdx]} alt={property.title} fill className="object-cover" priority />
        ) : (
          <div className="w-full h-full bg-luxury-dark-2 flex items-center justify-center text-8xl">🏠</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark via-transparent to-transparent" />

        {property.images.length > 1 && (
          <>
            <button onClick={prevImg} className="absolute left-4 top-1/2 -translate-y-1/2 glass rounded-full p-3 hover:bg-white/20 transition-colors">
              <ChevronLeft size={22} />
            </button>
            <button onClick={nextImg} className="absolute right-4 top-1/2 -translate-y-1/2 glass rounded-full p-3 hover:bg-white/20 transition-colors">
              <ChevronRight size={22} />
            </button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
              {property.images.map((_, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={cn('h-1.5 rounded-full transition-all', i === imgIdx ? 'w-6 bg-white' : 'w-1.5 bg-white/50')} />
              ))}
            </div>
          </>
        )}

        <div className="absolute bottom-6 right-6 flex gap-2">
          {property.has3DTour && (
            <Link href={`/properties/${property.id}/tour`}
              className="btn-primary flex items-center gap-2 py-3 shadow-brand">
              <Play size={18} /> 3D Tura Başla
            </Link>
          )}
          <button onClick={() => { setFavorited(f => !f); toast.success(favorited ? 'Sevimlilərdən çıxarıldı' : 'Sevimlilərə əlavə edildi!'); }}
            className={cn('glass rounded-xl p-3 transition-colors', favorited ? 'text-red-400' : 'text-white/70 hover:text-white')}>
            <Heart size={20} className={favorited ? 'fill-current' : ''} />
          </button>
          <button className="glass rounded-xl p-3 text-white/70 hover:text-white transition-colors">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Əsas məzmun */}
      <div className="section py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sol sütun */}
          <div className="lg:col-span-2">
            {/* Başlıq */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {listingLabel[property.listingType] ?? property.listingType}
                </span>
                <span className="text-white/40 text-sm">{typeLabel[property.propertyType] ?? property.propertyType}</span>
                {property.mlsNumber && <span className="text-white/30 text-xs">MLS# {property.mlsNumber}</span>}
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">{property.title}</h1>
              <div className="flex items-center gap-2 text-white/60 mb-4">
                <MapPin size={16} />
                <span>{property.address}, {property.city}, {property.state} {property.zipCode}</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-4xl font-bold gradient-text">
                  {formatPrice(property.price)}
                  {property.listingType === 'FOR_RENT' && <span className="text-lg text-white/50">/ay</span>}
                </div>
                {property.estimatedValue && (
                  <div className="text-sm text-white/40">
                    Təxmini dəyər: {formatPrice(property.estimatedValue)}
                  </div>
                )}
              </div>
            </div>

            {/* Əsas göstəricilər */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { icon: Bed, label: 'Otaqlar', value: property.bedrooms ?? '—' },
                { icon: Bath, label: 'Hamamlar', value: property.bathrooms ?? '—' },
                { icon: Maximize, label: 'Kv. Fut', value: property.squareFeet.toLocaleString() },
                { icon: Home, label: 'Tikinti İli', value: property.yearBuilt ?? '—' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="card p-4 text-center">
                  <Icon size={20} className="text-brand-400 mx-auto mb-2" />
                  <div className="text-xl font-bold">{value}</div>
                  <div className="text-xs text-white/50">{label}</div>
                </div>
              ))}
            </div>

            {/* Nişanlar */}
            <div className="flex gap-1 glass rounded-xl p-1 mb-6 overflow-x-auto">
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={cn('px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                    tab === t ? 'bg-brand-500 text-white' : 'text-white/60 hover:text-white')}>
                  {t}
                </button>
              ))}
            </div>

            {/* Nişan məzmunu */}
            {tab === 'Ümumi' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-white/70 leading-relaxed mb-8 text-lg">{property.description}</p>
                {property.amenities && property.amenities.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Avadanlıqlar</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {property.amenities.map(a => (
                        <div key={a.id} className="glass rounded-xl p-3 flex items-center gap-2 text-sm">
                          <span>{amenityIcons[a.name.toLowerCase()] ?? '✓'}</span>
                          <span className="text-white/80">{a.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {tab === 'Detallar' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    ['Əmlak Növü', typeLabel[property.propertyType] ?? property.propertyType],
                    ['Elan Növü', listingLabel[property.listingType] ?? property.listingType],
                    ['Tikinti İli', property.yearBuilt ?? '—'],
                    ['Torpaq Sahəsi', property.lotSize ? `${property.lotSize.toLocaleString()} kv.fut` : '—'],
                    ['Mərtəbə Sayı', property.floors ?? '—'],
                    ['Qaraj', property.garage ? `Bəli (${property.garageSpaces} yer)` : 'Xeyr'],
                    ['Hovuz', property.pool ? 'Bəli' : 'Xeyr'],
                    ['HOA Haqqı', property.hoaFee ? formatPrice(property.hoaFee) + '/ay' : 'Yoxdur'],
                    ['Şəhər', property.city],
                    ['Rayon/Ştat', property.state],
                    ['Poçt Kodu', property.zipCode],
                    ['Məhəllə', property.neighborhood ?? '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between py-3 border-b border-white/10">
                      <span className="text-white/50 text-sm">{k}</span>
                      <span className="font-medium text-sm">{v}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {tab === 'İpoteka' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <MortgageCalculator homePrice={property.price} />
              </motion.div>
            )}

            {tab === 'AI Köməkçi' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <AIAssistant property={property} />
              </motion.div>
            )}

            {tab === 'Rəylər' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {property.reviews?.length ? (
                  <div className="space-y-4">
                    {property.reviews.map((r: any) => (
                      <div key={r.id} className="card p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-sm font-bold">
                            {r.user.firstName[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{r.user.firstName} {r.user.lastName}</div>
                            <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={12} className="fill-luxury-gold text-luxury-gold" />)}</div>
                          </div>
                        </div>
                        <p className="text-white/70 text-sm">{r.body}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-white/40">Hələ rəy yoxdur</div>
                )}
              </motion.div>
            )}
          </div>

          {/* Sağ — agent kartı */}
          <div className="space-y-6">
            {property.agent && (
              <div className="card p-6">
                <h3 className="font-semibold mb-4">Elanı verən</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-full bg-brand-gradient flex items-center justify-center text-xl font-bold overflow-hidden">
                    {property.agent.avatar
                      ? <Image src={property.agent.avatar} alt="" width={56} height={56} className="object-cover" />
                      : `${property.agent.firstName?.[0]}${property.agent.lastName?.[0]}`}
                  </div>
                  <div>
                    <div className="font-semibold">{property.agent.firstName} {property.agent.lastName}</div>
                    <div className="text-white/50 text-sm">Lisenziyalı Agent</div>
                    {property.agent.licenseNumber && <div className="text-white/30 text-xs">#{property.agent.licenseNumber}</div>}
                  </div>
                </div>
                <div className="space-y-2">
                  {property.agent.phone && (
                    <a href={`tel:${property.agent.phone}`} className="flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300">
                      <Phone size={14} /> {property.agent.phone}
                    </a>
                  )}
                  <a href={`mailto:${property.agent.email}`} className="flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300">
                    <Mail size={14} /> Agentə Yazın
                  </a>
                </div>
                <button className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
                  <Calendar size={16} /> Baxış Planlaşdır
                </button>
              </div>
            )}

            {property.has3DTour && (
              <div className="card p-6 border border-brand-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
                    <Play size={16} />
                  </div>
                  <h3 className="font-semibold">3D Virtual Tur</h3>
                </div>
                <p className="text-white/60 text-sm mb-4">Bu əmlakı indi immersiv birinci şəxs 3D rejimdə gəzin.</p>
                <Link href={`/properties/${property.id}/tour`} className="btn-primary w-full flex items-center justify-center gap-2">
                  Tura Başla →
                </Link>
              </div>
            )}

            <div className="card p-6">
              <h3 className="font-semibold mb-4">Qısa Məlumat</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-white/60"><Zap size={14} className="text-yellow-400" /> Baxış: {property.viewCount.toLocaleString()}</div>
                <div className="flex items-center gap-2 text-white/60"><Heart size={14} className="text-red-400" /> Saxlanıb: {property.favoriteCount.toLocaleString()}</div>
                <div className="flex items-center gap-2 text-white/60"><Shield size={14} className="text-green-400" /> Təsdiqlənmiş Elan</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
