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

export function formatISODate(dateString: string, locale: string = 'es-DO', tz: string = 'America/Santo_Domingo'): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(getDateWithCorrectTz(dateString))
}

export function getDateWithCorrectTz(dateString: string): Date {
  const date = new Date(dateString);

  if (typeof window !== 'undefined' && window.location.hostname === "bento.leandroj.tech") {
    date.setHours(date.getHours() - 4)
    return date
  }
  return date
}
