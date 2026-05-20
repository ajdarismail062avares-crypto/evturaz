'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Home } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Düzgün e-poçt daxil edin'),
  password: z.string().min(1, 'Şifrə tələb olunur'),
});
type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    try {
      await login(data.email, data.password);
      toast.success('Xoş gəlmisiniz!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Yanlış e-poçt və ya şifrə');
    }
  };

  return (
    <div className="min-h-screen bg-luxury-dark flex">
      {/* Sol panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-luxury-dark-3 to-luxury-dark" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-12">
            <div className="w-20 h-20 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto mb-8 shadow-brand">
              <Home size={40} />
            </div>
            <h2 className="text-4xl font-bold gradient-text mb-4">evtur.az</h2>
            <p className="text-white/60 text-lg max-w-sm">Əmlakın gələcəyi — immersiv 3D turlar, AI tövsiyələri və lüks elanlar.</p>
          </div>
        </div>
        <div className="absolute bottom-8 left-8 right-8">
          <div className="glass rounded-2xl p-6">
            <div className="flex gap-1 mb-2">{Array.from({length:5}).map((_,i) => <span key={i} className="text-luxury-gold">★</span>)}</div>
            <p className="text-white/80 text-sm italic">"3D tur vasitəsilə xəyal evimi tapdım — heç fiziki baxış etmədən müqavilə imzaladım!"</p>
            <p className="text-white/40 text-xs mt-2">— Aynur M., Bakı</p>
          </div>
        </div>
      </div>

      {/* Sağ panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center"><Home size={16} /></div>
            <span className="text-xl font-bold gradient-text">evtur.az</span>
          </div>

          <h1 className="text-3xl font-bold mb-2">Xoş gəlmisiniz</h1>
          <p className="text-white/50 mb-8">evtur.az hesabınıza daxil olun</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">E-poçt</label>
              <input {...register('email')} type="email" placeholder="siz@misal.com" className="input" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm text-white/60">Şifrə</label>
                <Link href="/auth/forgot" className="text-xs text-brand-400 hover:text-brand-300">Şifrəni unutmusunuz?</Link>
              </div>
              <div className="relative">
                <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="••••••••" className="input pr-10" />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Daxil Ol'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <span className="relative bg-luxury-dark px-4 text-xs text-white/30">VƏ YA</span>
          </div>

          <button className="btn-secondary w-full flex items-center justify-center gap-2 py-3">
            <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google ilə davam et
          </button>

          <p className="text-center text-white/40 text-sm mt-6">
            Hesabınız yoxdur?{' '}
            <Link href="/auth/register" className="text-brand-400 hover:text-brand-300 font-medium">Pulsuz qeydiyyatdan keçin</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
