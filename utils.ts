import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string): string {
  const numberValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(numberValue);
}

export function calculateSavings(regularPrice: number | string, salePrice: number | string): {
  savingsAmount: number;
  savingsPercent: number;
} {
  const regPrice = typeof regularPrice === 'string' ? parseFloat(regularPrice) : regularPrice;
  const discPrice = typeof salePrice === 'string' ? parseFloat(salePrice) : salePrice;
  
  const savingsAmount = regPrice - discPrice;
  const savingsPercent = Math.round((savingsAmount / regPrice) * 100);
  
  return {
    savingsAmount,
    savingsPercent
  };
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

export function getDaysRemaining(endDate?: Date | string | null): string {
  if (!endDate) return "No end date";
  
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const now = new Date();
  
  // Set both dates to the start of the day to get whole days
  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);
  
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = endDay.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "Expired";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day";
  return `${diffDays} days`;
}
