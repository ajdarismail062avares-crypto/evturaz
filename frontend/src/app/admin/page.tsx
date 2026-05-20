'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Home, Play, DollarSign, TrendingUp, Shield, CheckCircle, XCircle } from 'lucide-react';
import { Navbar } from '@/components/ui/Navbar';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [tab, setTab] = useState<'overview' | 'users' | 'properties'>('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [pendingProps, setPendingProps] = useState<any[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') { router.push('/'); return; }
    loadData();
  }, [user, router]);

  const loadData = async () => {
    const [statsRes, usersRes, propsRes] = await Promise.allSettled([
      api.get('/admin/stats'),
      api.get('/admin/users', { params: { limit: '20' } }),
      api.get('/admin/properties/pending'),
    ]);
    if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
    if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data.users);
    if (propsRes.status === 'fulfilled') setPendingProps(propsRes.value.data);
  };

  const approveProperty = async (id: string) => {
    await api.patch(`/admin/properties/${id}/approve`);
    toast.success('Əmlak təsdiqləndi');
    setPendingProps(p => p.filter(x => x.id !== id));
  };

  const toggleUser = async (id: string) => {
    await api.patch(`/admin/users/${id}/toggle`);
    toast.success('İstifadəçi statusu yeniləndi');
    loadData();
  };

  if (!user || user.role !== 'ADMIN') return null;

  const STAT_CARDS = [
    { icon: Users, label: 'Ümumi İstifadəçilər', value: stats?.stats?.users ?? '—', color: 'text-brand-400' },
    { icon: Home, label: 'Əmlaklar', value: stats?.stats?.properties ?? '—', color: 'text-green-400' },
    { icon: Play, label: 'Virtual Turlar', value: stats?.stats?.tours ?? '—', color: 'text-purple-400' },
    { icon: DollarSign, label: 'Gəlir', value: stats?.stats?.revenue ? formatPrice(stats.stats.revenue) : '₼0', color: 'text-yellow-400' },
  ];

  const TAB_LABELS = { overview: 'Ümumi Baxış', users: 'İstifadəçilər', properties: 'Əmlaklar' };
  const ROLE_LABEL: Record<string, string> = { BUYER: 'Alıcı', SELLER: 'Satıcı', RENTER: 'Kirayəçi', AGENT: 'Agent', ADMIN: 'Admin' };

  return (
    <div className="min-h-screen bg-luxury-dark">
      <Navbar />
      <div className="pt-20 section py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin İdarəetmə Paneli</h1>
            <p className="text-white/40 text-sm">Platforma idarəetməsi və analitika</p>
          </div>
        </div>

        {/* Statistikalar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STAT_CARDS.map(({ icon: Icon, label, value, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="card p-5">
              <Icon size={24} className={`${color} mb-3`} />
              <div className="text-2xl font-bold mb-0.5">{value}</div>
              <div className="text-sm text-white/50">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Nişanlar */}
        <div className="flex gap-1 glass rounded-xl p-1 mb-6 w-fit">
          {(['overview', 'users', 'properties'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-brand-500 text-white' : 'text-white/60 hover:text-white'}`}>
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Ümumi baxış */}
        {tab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-brand-400" /> Son İstifadəçilər</h3>
              <div className="space-y-3">
                {stats?.recentUsers?.map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-xs font-bold">
                        {u.firstName[0]}
                      </div>
                      <div>
                        <div className="font-medium">{u.firstName} {u.lastName}</div>
                        <div className="text-white/40 text-xs">{u.email}</div>
                      </div>
                    </div>
                    <span className="text-xs glass px-2.5 py-1 rounded-full">{ROLE_LABEL[u.role] ?? u.role}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Home size={16} className="text-green-400" /> Ən Populyar Əmlaklar</h3>
              <div className="space-y-3">
                {stats?.topProperties?.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium line-clamp-1">{p.title}</div>
                      <div className="text-white/40 text-xs">{p.city} · {formatPrice(p.price)}</div>
                    </div>
                    <div className="text-right text-xs text-white/50">
                      <div>{p.viewCount.toLocaleString()} baxış</div>
                      <div>{p.favoriteCount} saxlanıb</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* İstifadəçilər */}
        {tab === 'users' && (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10">
                <tr className="text-white/50 text-xs uppercase">
                  <th className="p-4 text-left">İstifadəçi</th>
                  <th className="p-4 text-left">Rol</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Qoşuldu</th>
                  <th className="p-4 text-left">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-medium">{u.firstName} {u.lastName}</div>
                      <div className="text-white/40 text-xs">{u.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="glass text-xs px-2.5 py-1 rounded-full">{ROLE_LABEL[u.role] ?? u.role}</span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${u.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {u.isActive ? 'Aktiv' : 'Dayandırılıb'}
                      </span>
                    </td>
                    <td className="p-4 text-white/50 text-xs">{new Date(u.createdAt).toLocaleDateString('az-AZ')}</td>
                    <td className="p-4">
                      <button onClick={() => toggleUser(u.id)} className="text-xs glass px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
                        {u.isActive ? 'Dayandır' : 'Aktivləşdir'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Gözləyən əmlaklar */}
        {tab === 'properties' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Təsdiq Gözləyən Elanlar ({pendingProps.length})</h3>
            {pendingProps.length === 0 ? (
              <div className="card p-8 text-center text-white/40">Gözləyən elan yoxdur</div>
            ) : (
              pendingProps.map(p => (
                <div key={p.id} className="card p-5 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold line-clamp-1">{p.title}</div>
                    <div className="text-white/50 text-sm">{p.city}, {p.state} · {formatPrice(p.price)}</div>
                    <div className="text-white/30 text-xs">{p.owner?.firstName} {p.owner?.lastName} tərəfindən · {p.owner?.email}</div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => approveProperty(p.id)}
                      className="flex items-center gap-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 px-4 py-2 rounded-xl text-sm transition-colors">
                      <CheckCircle size={14} /> Təsdiqlə
                    </button>
                    <button className="flex items-center gap-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 px-4 py-2 rounded-xl text-sm transition-colors">
                      <XCircle size={14} /> Rədd Et
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
