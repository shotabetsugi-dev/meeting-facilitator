import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function getYearMonth(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${year}-${month}`
}

export function getRandomColor(): string {
  const colors = [
    '#E74C3C',
    '#3498DB',
    '#2ECC71',
    '#9B59B6',
    '#F39C12',
    '#1ABC9C',
    '#E67E22',
    '#95A5A6',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}
