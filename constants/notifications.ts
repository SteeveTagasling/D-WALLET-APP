import type { StoredID } from './types';

const WARN_DAYS = 30;

export function getDaysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export interface ExpiryWarning {
  id: string;
  name: string;
  days: number;
  emoji: string;
}

export function getExpiringIDs(ids: StoredID[]): ExpiryWarning[] {
  const warnings: ExpiryWarning[] = [];
  for (const id of ids) {
    if (!id.expiryDate) continue;
    const days = getDaysUntilExpiry(id.expiryDate);
    if (days <= WARN_DAYS && days >= 0) {
      warnings.push({ id: id.id, name: id.name, days, emoji: id.iconEmoji });
    }
  }
  return warnings.sort((a, b) => a.days - b.days);
}

export function getExpiryMessage(days: number): string {
  if (days === 0) return 'expires TODAY';
  if (days === 1) return 'expires tomorrow';
  return `expires in ${days} days`;
}