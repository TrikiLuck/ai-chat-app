import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } else if (days > 0) {
    return `${days}д назад`;
  } else if (hours > 0) {
    return `${hours}ч назад`;
  } else if (minutes > 0) {
    return `${minutes}м назад`;
  } else {
    return 'только что';
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
