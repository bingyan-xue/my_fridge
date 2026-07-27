import type { ExpiryStatus, IngredientItem } from './types';

export type ShelfLifeByCategory = Record<string, number>;

function parseDateOnly(date: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: string, days: number): string {
  const parsed = parseDateOnly(date);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return formatDateOnly(parsed);
}

function differenceInDays(date: string, today: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((parseDateOnly(date).getTime() - parseDateOnly(today).getTime()) / msPerDay);
}

export function applyDefaultExpiry(item: IngredientItem, shelfLifeByCategory: ShelfLifeByCategory): IngredientItem {
  if (item.expiryDate) {
    return { ...item, estimatedExpiryDate: undefined, expirySource: 'user' };
  }

  const shelfLifeDays = shelfLifeByCategory[item.category];
  if (typeof shelfLifeDays !== 'number') {
    return { ...item, estimatedExpiryDate: undefined, expirySource: 'default' };
  }

  return {
    ...item,
    estimatedExpiryDate: addDays(item.addedAt, shelfLifeDays),
    expirySource: 'default',
  };
}

export function getEffectiveExpiryDate(item: IngredientItem): string | undefined {
  return item.expiryDate ?? item.estimatedExpiryDate;
}

export function getExpiryStatus(item: IngredientItem, today: string): ExpiryStatus {
  const effectiveExpiryDate = getEffectiveExpiryDate(item);
  if (!effectiveExpiryDate) {
    return 'unknown';
  }

  const daysUntilExpiry = differenceInDays(effectiveExpiryDate, today);
  if (daysUntilExpiry < 0) {
    return 'expired';
  }
  if (daysUntilExpiry <= 2) {
    return 'expiringSoon';
  }
  return 'normal';
}
