'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, MapPin, ArrowRight, Play, Star, Shield, Zap, Globe } from 'lucide-react';
import { Navbar } from '@/components/ui/Navbar';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { SearchBar } from '@/components/ui/SearchBar';

const STATS = [
  { label: 'Elan Sayı', value: '50K+' },
  { label: 'Virtual Tur', value: '120K+' },
  { label: 'Məmnun Müştəri', value: '98K+' },
  { label: 'Şəhər', value: '500+' },
];

const FEATURES = [
  { icon: Play, title: 'Sərbəst Gəzinti Rejimi', desc: 'Hər hansı bir evdə birinci şəxs 3D rejimdə gəzin — sanki video oyunudasınız, real ziyarətdən əvvəl.', color: 'from-blue-500 to-cyan-500' },
  { icon: Zap, title: 'AI Tövsiyələri', desc: 'GPT əsaslı mühərrik sizin zövqünüzü öyrənir və ideal variantları avtomatik təqdim edir.', color: 'from-purple-500 to-pink-500' },
  { icon: Globe, title: 'Birgə Turlar', desc: 'Agentinizi və ya ailəni eyni evə real vaxtda birlikdə dəvət edin — dünyanın istənilən yerindən.', color: 'from-orange-500 to-red-500' },
  { icon: Shield, title: 'Rəqəmsal Müqavilələr', desc: 'Alqı-satqı və kirayə müqavilələrini rəqəmsal imzalayın — hüquqi cəhətdən etibarlı, anında.', color: 'from-green-500 to-emerald-500' },
];

export default function HomePage() {
  const [query, setQuery] = useState('');

  return (
    <div className="min-h-screen bg-luxury-dark">
      <Navbar />

      {/* Əsas bölmə */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-luxury-gradient" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-luxury-gold/10 rounded-full blur-3xl animate-float" />
        </div>

        <div className="relative section text-center z-10 pt-32 pb-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm text-brand-300 mb-6 border border-brand-500/30">
              <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
              Əmlakın Gələcəyi Burada Başlayır
            </span>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              <span className="gradient-text">Evi Gəzin</span>
              <br />
              <span className="text-white">Ziyarətdən Əvvəl</span>
              <br />
              <span className="gold-text">3D Tur ilə</span>
            </h1>

            <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
              İmmersiv 3D virtual turlar, AI tövsiyələri və lüks əmlak — hamısı bir platformada.
            </p>

            <SearchBar className="max-w-3xl mx-auto mb-8" />

            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/properties" className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
                Evlərə Bax <ArrowRight size={20} />
              </Link>
              <Link href="/tour/demo" className="btn-secondary flex items-center gap-2 text-lg px-8 py-4">
                <Play size={20} /> Virtual Tura Bax
              </Link>
            </div>
          </motion.div>

          {/* Statistikalar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-3xl mx-auto"
          >
            {STATS.map(s => (
              <div key={s.label} className="card p-6 text-center">
                <div className="text-3xl font-bold gradient-text mb-1">{s.value}</div>
                <div className="text-sm text-white/50">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Üstünlüklər */}
      <section className="py-24 section">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 gradient-text">Niyə evtur.az?</h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Əmlak prosesinin hər addımını ən müasir texnologiya ilə yenidən kəşf etdik.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              className="card p-8 group hover:scale-105 transition-transform duration-300"
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${f.color} mb-5`}>
                <f.icon size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Bölməsi */}
      <section className="py-20 section">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden glass border border-brand-500/30 p-12 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-brand-900/50 to-luxury-dark-3/50" />
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-4">Xəyal Evinizi Tapmağa Hazırsınız?</h2>
            <p className="text-white/60 text-lg mb-8">evtur.az-da ideal evlərini tapan 98,000+ məmnun müştəriyə qoşulun.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/auth/register" className="btn-gold text-lg px-10 py-4">Pulsuz Başlayın</Link>
              <Link href="/properties" className="btn-secondary text-lg px-10 py-4">Elanlara Bax</Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 section">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-bold gradient-text">evtur.az</div>
          <div className="flex gap-8 text-white/50 text-sm">
            <Link href="/about" className="hover:text-white transition-colors">Haqqımızda</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Məxfilik</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Şərtlər</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Əlaqə</Link>
          </div>
          <div className="text-white/30 text-sm">© 2026 evtur.az. Bütün hüquqlar qorunur.</div>
        </div>
      </footer>
    </div>
  );
}
