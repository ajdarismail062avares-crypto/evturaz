'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, DollarSign, Percent, Calendar } from 'lucide-react';
import { calculateMortgage, formatPrice } from '@/lib/utils';

interface Props { homePrice?: number }

export function MortgageCalculator({ homePrice: initialPrice = 500000 }: Props) {
  const [price, setPrice] = useState(initialPrice);
  const [down, setDown] = useState(Math.round(initialPrice * 0.2));
  const [rate, setRate] = useState(7.2);
  const [term, setTerm] = useState(30);

  const result = useMemo(() => calculateMortgage({
    homePrice: price, downPayment: down, interestRate: rate, loanTerm: term,
  }), [price, down, rate, term]);

  const downPct = ((down / price) * 100).toFixed(1);

  const Field = ({ icon: Icon, label, value, onChange, min, max, step, prefix, suffix }: any) => (
    <div>
      <label className="flex items-center gap-2 text-sm text-white/60 mb-2">
        <Icon size={14} /> {label}
      </label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">{prefix}</span>}
        <input
          type="number" value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          min={min} max={max} step={step}
          className={`input ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-10' : ''}`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">{suffix}</span>}
      </div>
      {label === 'İlkin Ödəniş' && (
        <div className="mt-1 text-xs text-white/40">
          Ev qiymətinin {downPct}%-i
          {parseFloat(downPct) < 20 && <span className="text-yellow-400 ml-2">PMI tətbiq oluna bilər</span>}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Calculator size={20} className="text-brand-400" />
        <h3 className="text-xl font-semibold">İpoteka Kalkulyatoru</h3>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field icon={DollarSign} label="Ev Qiyməti" value={price} onChange={setPrice} min={50000} step={1000} prefix="₼" />
        <Field icon={DollarSign} label="İlkin Ödəniş" value={down} onChange={setDown} min={0} max={price} step={1000} prefix="₼" />
        <Field icon={Percent} label="Faiz Dərəcəsi" value={rate} onChange={setRate} min={0.1} max={30} step={0.1} suffix="%" />
        <div>
          <label className="flex items-center gap-2 text-sm text-white/60 mb-2"><Calendar size={14} /> Kredit Müddəti</label>
          <div className="flex gap-2">
            {[10, 15, 20, 30].map(t => (
              <button key={t} onClick={() => setTerm(t)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${term === t ? 'bg-brand-500 text-white' : 'glass text-white/60 hover:text-white'}`}>
                {t} il
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Nəticələr */}
      <motion.div key={result.monthlyPayment} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="card p-6 border border-brand-500/20">
        <div className="text-center mb-6">
          <div className="text-sm text-white/50 mb-1">Təxmini Aylıq Ödəniş</div>
          <div className="text-5xl font-bold gradient-text">{formatPrice(result.monthlyPayment)}</div>
          <div className="text-white/40 text-sm mt-1">/ ay</div>
        </div>

        {/* Bölünmə */}
        <div className="space-y-3">
          {[
            { label: 'Əsas Borc və Faiz', value: result.principalAndInterest, color: 'bg-brand-500' },
            { label: 'Əmlak Vergisi', value: result.propertyTax, color: 'bg-luxury-gold' },
            { label: 'Mülkiyyət Sığortası', value: result.insurance, color: 'bg-green-500' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/60">{label}</span>
                <span className="font-medium">{formatPrice(value)}/ay</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${(value / result.monthlyPayment) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 mt-5 pt-5 grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-white/50 mb-1">Ümumi Ödəniş</div>
            <div className="font-bold">{formatPrice(result.totalPayment + down)}</div>
          </div>
          <div className="text-center">
            <div className="text-white/50 mb-1">Ümumi Faiz</div>
            <div className="font-bold text-yellow-400">{formatPrice(result.totalInterest)}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
