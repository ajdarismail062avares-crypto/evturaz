'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Home, Heart, Play, Bell, Plus, Settings,
  LogOut, ChevronRight, LayoutDashboard,
} from 'lucide-react';
import { Navbar } from '@/components/ui/Navbar';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { AIAssistant } from '@/components/ai/AIAssistant';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    api.get('/users/me/dashboard').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [user, router]);

  if (!user || loading) {
    return <div className="min-h-screen bg-luxury-dark flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  const STAT_CARDS = [
    { icon: Home, label: 'Elanlarım', value: data?.properties?.length ?? 0, color: 'text-brand-400', bg: 'bg-brand-500/10' },
    { icon: Heart, label: 'Saxlanıb', value: data?.favorites ?? 0, color: 'text-red-400', bg: 'bg-red-500/10' },
    { icon: Play, label: 'Turlar', value: data?.tours?.length ?? 0, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { icon: Bell, label: 'Bildirişlər', value: data?.notifications?.length ?? 0, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ];

  const STATUS_LABEL: Record<string, string> = {
    LIVE: 'Canlı', COMPLETED: 'Tamamlandı', SCHEDULED: 'Planlaşdırılıb', CANCELLED: 'Ləğv edildi',
  };
  const STATUS_CLASS: Record<string, string> = {
    LIVE: 'bg-green-500/20 text-green-400',
    COMPLETED: 'bg-white/10 text-white/50',
    SCHEDULED: 'bg-blue-500/20 text-blue-400',
    CANCELLED: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="min-h-screen bg-luxury-dark">
      <Navbar />
      <div className="pt-20 section py-8">
        {/* Salamlama */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Xoş gəlmisiniz, {user.firstName} 👋</h1>
          <p className="text-white/50">Əmlak yolculuğunuzda nə baş verir.</p>
        </motion.div>

        {/* Statistikalar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STAT_CARDS.map(({ icon: Icon, label, value, color, bg }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="card p-5">
              <div className={`inline-flex p-2.5 rounded-xl ${bg} mb-3`}>
                <Icon size={20} className={color} />
              </div>
              <div className="text-2xl font-bold mb-0.5">{value}</div>
              <div className="text-sm text-white/50">{label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Elanlarım */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Elanlarım</h2>
                {(user.role === 'SELLER' || user.role === 'AGENT' || user.role === 'ADMIN') && (
                  <Link href="/dashboard/list-property" className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
                    <Plus size={14} /> Elan Əlavə Et
                  </Link>
                )}
              </div>
              {data?.properties?.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {data.properties.slice(0, 4).map((p: any, i: number) => (
                    <PropertyCard key={p.id} property={p} index={i} />
                  ))}
                </div>
              ) : (
                <div className="card p-8 text-center">
                  <div className="text-5xl mb-3">🏠</div>
                  <p className="text-white/50 mb-4">Hələ elan yoxdur</p>
                  <Link href="/dashboard/list-property" className="btn-primary">İlk Elanı Yarat</Link>
                </div>
              )}
            </section>

            {/* Son turlar */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Son Turlar</h2>
              {data?.tours?.length > 0 ? (
                <div className="space-y-3">
                  {data.tours.map((t: any) => (
                    <div key={t.id} className="card p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center">
                          <Play size={18} />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Virtual Tur</div>
                          <div className="text-xs text-white/40">{new Date(t.createdAt).toLocaleDateString('az-AZ')}</div>
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_CLASS[t.status] ?? 'bg-white/10 text-white/50'}`}>
                        {STATUS_LABEL[t.status] ?? t.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-6 text-center text-white/40 text-sm">Hələ tur yoxdur — başlamaq üçün əmlaka baxın!</div>
              )}
            </section>
          </div>

          {/* Sağ panel */}
          <div className="space-y-6">
            {/* Bildirişlər */}
            <section className="card p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Bell size={16} className="text-yellow-400" /> Bildirişlər
              </h3>
              {data?.notifications?.length > 0 ? (
                <div className="space-y-3">
                  {data.notifications.slice(0, 5).map((n: any) => (
                    <div key={n.id} className="flex gap-3 text-sm">
                      <div className="w-2 h-2 bg-brand-500 rounded-full mt-1.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{n.title}</div>
                        <div className="text-white/50 text-xs">{n.body}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/40 text-sm">Heç bir yeni bildiriş yoxdur!</p>
              )}
            </section>

            {/* Sürətli keçidlər */}
            <section className="card p-5">
              <h3 className="font-semibold mb-4">Sürətli Keçidlər</h3>
              <div className="space-y-2">
                {[
                  { href: '/properties', label: 'Əmlaklara Bax', icon: Home },
                  { href: '/dashboard/favorites', label: 'Saxlanmış Evlər', icon: Heart },
                  { href: '/dashboard/settings', label: 'Hesab Parametrləri', icon: Settings },
                  ...(user.role === 'ADMIN' ? [{ href: '/admin', label: 'Admin Paneli', icon: LayoutDashboard }] : []),
                ].map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/10 transition-colors group">
                    <div className="flex items-center gap-3 text-sm">
                      <Icon size={16} className="text-white/50" />
                      <span>{label}</span>
                    </div>
                    <ChevronRight size={14} className="text-white/30 group-hover:text-white/60" />
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <AIAssistant floating />
    </div>
  );
}
