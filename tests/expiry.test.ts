import { describe, expect, it } from 'vitest';
import { applyDefaultExpiry, getEffectiveExpiryDate, getExpiryStatus } from '../src/domain/expiry';
import type { IngredientItem } from '../src/domain/types';

const baseItem: IngredientItem = {
  id: 'ing-1',
  name: '青菜',
  canonicalName: '叶菜',
  category: 'leafy-greens',
  quantity: 1,
  unit: '把',
  storageLocation: 'fridge',
  addedAt: '2026-07-27',
  expirySource: 'default',
  nutritionTags: ['fiber', 'vegetable'],
  updatedAt: '2026-07-27',
};

describe('expiry rules', () => {
  it('applies category default shelf life when user date is missing', () => {
    const result = applyDefaultExpiry(baseItem, { 'leafy-greens': 7 });

    expect(result.estimatedExpiryDate).toBe('2026-08-03');
    expect(result.expirySource).toBe('default');
  });

  it('keeps user-provided expiry date as the effective expiry date', () => {
    const item = { ...baseItem, expiryDate: '2026-07-30' };

    expect(getEffectiveExpiryDate(item)).toBe('2026-07-30');
    expect(applyDefaultExpiry(item, { 'leafy-greens': 7 }).expirySource).toBe('user');
  });

  it('treats today, tomorrow, and the day after tomorrow as expiring soon', () => {
    expect(getExpiryStatus({ ...baseItem, expiryDate: '2026-07-27' }, '2026-07-27')).toBe('expiringSoon');
    expect(getExpiryStatus({ ...baseItem, expiryDate: '2026-07-28' }, '2026-07-27')).toBe('expiringSoon');
    expect(getExpiryStatus({ ...baseItem, expiryDate: '2026-07-29' }, '2026-07-27')).toBe('expiringSoon');
  });

  it('marks dates before today as expired', () => {
    expect(getExpiryStatus({ ...baseItem, expiryDate: '2026-07-26' }, '2026-07-27')).toBe('expired');
  });

  it('marks items without an effective expiry date as unknown', () => {
    expect(getExpiryStatus(baseItem, '2026-07-27')).toBe('unknown');
  });
});
