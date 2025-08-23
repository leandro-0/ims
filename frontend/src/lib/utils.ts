import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number, locale: string = 'es-DO'): string {
  return new Intl.NumberFormat(locale).format(value)
}

export function formatCurrency(value: number, locale: string = 'es-DO', currency: string = 'DOP'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(value)
}

export function formatDate(dateString: string, locale: string = 'es-DO'): string {
  return new Date(dateString).toLocaleDateString(locale)
}


