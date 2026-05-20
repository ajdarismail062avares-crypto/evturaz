'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Home, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const schema = z.object({
  firstName: z.string().min(1, 'Ad tələb olunur'),
  lastName: z.string().min(1, 'Soyad tələb olunur'),
  email: z.string().email('Düzgün e-poçt daxil edin'),
  password: z.string().min(8, 'Ən azı 8 simvol'),
  role: z.enum(['BUYER', 'SELLER', 'RENTER', 'AGENT']),
  phone: z.string().optional(),
});
type Form = z.infer<typeof schema>;

const ROLES = [
  { value: 'BUYER', label: '🏡 Alıcı', desc: 'Ev almaq istəyirəm' },
  { value: 'RENTER', label: '🔑 Kirayəçi', desc: 'Ev kirayə almaq istəyirəm' },
  { value: 'SELLER', label: '💰 Satıcı', desc: 'Əmlakımı satmaq istəyirəm' },
  { value: 'AGENT', label: '🏢 Agent', desc: 'Peşəkar daşınmaz əmlak agenti' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema), defaultValues: { role: 'BUYER' },
  });
  const selectedRole = watch('role');

  const onSubmit = async (data: Form) => {
    try {
      await registerUser(data);
      toast.success('Hesab yaradıldı! evtur.az-a xoş gəlmisiniz.');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Qeydiyyat alınmadı');
    }
  };

  return (
    <div className="min-h-screen bg-luxury-dark flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="flex items-center gap-2 mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center"><Home size={16} /></div>
            <span className="text-xl font-bold gradient-text">evtur.az</span>
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2">Hesab Yaradın</h1>
        <p className="text-white/50 mb-8">Xəyal evlərini tapan 98.000+ istifadəçiyə qoşulun</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Rol seçimi */}
          <div>
            <label className="text-sm text-white/60 mb-2 block">Mən...</label>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map(r => (
                <button type="button" key={r.value} onClick={() => setValue('role', r.value as any)}
                  className={cn('p-4 rounded-xl text-left border transition-all',
                    selectedRole === r.value ? 'border-brand-500 bg-brand-500/10' : 'border-white/10 glass hover:border-white/30')}>
                  <div className="font-medium text-sm">{r.label}</div>
                  <div className="text-xs text-white/40">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Ad</label>
              <input {...register('firstName')} placeholder="Əli" className="input" />
              {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Soyad</label>
              <input {...register('lastName')} placeholder="Həsənov" className="input" />
              {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="text-sm text-white/60 mb-1.5 block">E-poçt</label>
            <input {...register('email')} type="email" placeholder="siz@misal.com" className="input" />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Şifrə</label>
            <input {...register('password')} type="password" placeholder="Ən azı 8 simvol" className="input" />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Telefon <span className="text-white/30">(isteğe bağlı)</span></label>
            <input {...register('phone')} type="tel" placeholder="+994 50 000 00 00" className="input" />
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Hesab Yarat'}
          </button>

          <p className="text-center text-white/40 text-xs">
            Qeydiyyatdan keçməklə{' '}
            <Link href="/terms" className="text-brand-400 hover:underline">İstifadə Şərtləri</Link> və{' '}
            <Link href="/privacy" className="text-brand-400 hover:underline">Məxfilik Siyasəti</Link> ilə razılaşırsınız.
          </p>
        </form>

        <p className="text-center text-white/40 text-sm mt-6">
          Artıq hesabınız var?{' '}
          <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 font-medium">Daxil olun</Link>
        </p>
      </motion.div>
    </div>
  );
}
