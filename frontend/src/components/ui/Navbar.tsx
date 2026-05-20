'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, Search, Heart, User, Bell, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/properties', label: 'Al' },
  { href: '/properties?listingType=FOR_RENT', label: 'Kirayə' },
  { href: '/properties?listingType=FOR_SALE&type=COMMERCIAL', label: 'Kommersiya' },
  { href: '/agents', label: 'Agentlər' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'glass shadow-luxury' : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
              <Home size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">evtur.az</span>
          </Link>

          {/* Masaüstü Naviqasiya */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href} href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-white',
                  pathname.startsWith(link.href.split('?')[0]) ? 'text-white' : 'text-white/60'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Sağ tərəf */}
          <div className="flex items-center gap-3">
            <Link href="/properties" className="hidden md:flex items-center gap-1 text-white/60 hover:text-white transition-colors">
              <Search size={18} />
            </Link>

            {user ? (
              <>
                <Link href="/dashboard/favorites" className="p-2 text-white/60 hover:text-white transition-colors">
                  <Heart size={18} />
                </Link>
                <Link href="/dashboard" className="p-2 text-white/60 hover:text-white transition-colors">
                  <Bell size={18} />
                </Link>
                <div className="relative">
                  <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 glass rounded-full px-3 py-1.5 hover:bg-white/10 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-brand-gradient flex items-center justify-center text-xs font-bold">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <span className="text-sm font-medium hidden sm:block">{user.firstName}</span>
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 top-full mt-2 w-52 glass rounded-xl overflow-hidden shadow-luxury border border-white/10"
                      >
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-sm" onClick={() => setProfileOpen(false)}>
                          <LayoutDashboard size={16} /> İdarə Paneli
                        </Link>
                        <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-sm" onClick={() => setProfileOpen(false)}>
                          <Settings size={16} /> Parametrlər
                        </Link>
                        <div className="border-t border-white/10" />
                        <button onClick={() => { logout(); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/20 text-red-400 transition-colors text-sm">
                          <LogOut size={16} /> Çıxış
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="btn-secondary py-2 px-4 text-sm">Daxil ol</Link>
                <Link href="/auth/register" className="btn-primary py-2 px-4 text-sm">Başlayın</Link>
              </div>
            )}

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-white/60 hover:text-white">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobil Menyu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map(link => (
                <Link key={link.href} href={link.href} className="block px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors" onClick={() => setMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
