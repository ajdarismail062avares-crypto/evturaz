import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, compact = false): string {
  if (compact) {
    if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1)}M`;
    if (price >= 1_000) return `$${(price / 1_000).toFixed(0)}K`;
    return `$${price.toLocaleString()}`;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
}

export function calculateMortgage(params: {
  homePrice: number; downPayment: number; loanTerm: number;
  interestRate: number; propertyTaxRate?: number;
}) {
  const { homePrice, downPayment, loanTerm, interestRate, propertyTaxRate = 1.2 } = params;
  const principal = homePrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const nPayments = loanTerm * 12;

  let principalAndInterest = 0;
  if (monthlyRate === 0) {
    principalAndInterest = principal / nPayments;
  } else {
    principalAndInterest = principal * (monthlyRate * Math.pow(1 + monthlyRate, nPayments))
      / (Math.pow(1 + monthlyRate, nPayments) - 1);
  }

  const propertyTax = (homePrice * propertyTaxRate / 100) / 12;
  const insurance = (homePrice * 0.5 / 100) / 12;
  const monthlyPayment = principalAndInterest + propertyTax + insurance;
  const totalPayment = principalAndInterest * nPayments;
  const totalInterest = totalPayment - principal;

  return { principalAndInterest, propertyTax, insurance, monthlyPayment, totalPayment, totalInterest };
}

export function generateDemoRoomData() {
  return {
    scale: 1,
    origin: { x: 0, y: 0, z: 0 },
    rooms: [
      {
        id: 'living', name: 'Qonaq Otağı',
        bounds: { min: { x: -6, z: -5 }, max: { x: 6, z: 5 } },
        height: 2.8, floorTexture: 'hardwood',
        spawnPoint: { x: 0, y: 1.7, z: 0 },
        furniture: [
          { id: 'sofa1', type: 'sofa', position: { x: 0, y: 0.45, z: 2 }, rotation: Math.PI, scale: { x: 1, y: 1, z: 1 }, color: '#6b7280' },
          { id: 'table1', type: 'table', position: { x: 0, y: 0.375, z: 0.5 }, rotation: 0, scale: { x: 1, y: 1, z: 1 }, color: '#8b7355' },
        ],
      },
      {
        id: 'kitchen', name: 'Mətbəx',
        bounds: { min: { x: 6, z: -5 }, max: { x: 12, z: 3 } },
        height: 2.8, floorTexture: 'tile',
        furniture: [
          { id: 'table2', type: 'table', position: { x: 2, y: 0.375, z: 0 }, rotation: 0, scale: { x: 1.2, y: 1, z: 0.8 }, color: '#d1c4a8' },
        ],
      },
      {
        id: 'master', name: 'Baş Yataq Otağı',
        bounds: { min: { x: -6, z: -12 }, max: { x: 2, z: -5 } },
        height: 2.8,
        furniture: [
          { id: 'bed1', type: 'bed', position: { x: -2, y: 0.25, z: -2 }, rotation: 0, scale: { x: 1, y: 1, z: 1 }, color: '#f0e8d8' },
          { id: 'wardrobe1', type: 'wardrobe', position: { x: 2.5, y: 1.1, z: -2 }, rotation: 0, scale: { x: 1, y: 1, z: 1 }, color: '#7b6b55' },
        ],
      },
      {
        id: 'bathroom', name: 'Hamam',
        bounds: { min: { x: 2, z: -12 }, max: { x: 7, z: -5 } },
        height: 2.6, floorTexture: 'tile',
        furniture: [
          { id: 'bath1', type: 'bathtub', position: { x: 1.5, y: 0.3, z: -2 }, rotation: 0, scale: { x: 1, y: 1, z: 1 }, color: '#e0e0e0' },
        ],
      },
    ],
  };
}
