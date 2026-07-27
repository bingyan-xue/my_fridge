import { describe, expect, it } from 'vitest';
import {
  adjustIngredientQuantity,
  createIngredientDraft,
  deleteIngredient,
  upsertIngredient,
} from '../src/domain/inventory';

describe('inventory helpers', () => {
  it('creates ingredient with normalized name and default expiry', () => {
    const item = createIngredientDraft(
      {
        name: '番茄',
        category: 'leafy-greens',
        quantity: 2,
        unit: '个',
        storageLocation: 'fridge',
        expiryDate: '',
        nutritionTags: ['fiber', 'vegetable'],
      },
      '2026-07-27',
    );

    expect(item.canonicalName).toBe('西红柿');
    expect(item.estimatedExpiryDate).toBe('2026-08-03');
  });

  it('upserts by id', () => {
    const first = createIngredientDraft(
      {
        name: '鸡蛋',
        category: 'eggs',
        quantity: 6,
        unit: '个',
        storageLocation: 'fridge',
        expiryDate: '',
        nutritionTags: ['protein'],
      },
      '2026-07-27',
    );
    const second = { ...first, quantity: 8 };

    expect(upsertIngredient([first], second)[0].quantity).toBe(8);
  });

  it('deletes by id', () => {
    const item = createIngredientDraft(
      {
        name: '鸡蛋',
        category: 'eggs',
        quantity: 6,
        unit: '个',
        storageLocation: 'fridge',
        expiryDate: '',
        nutritionTags: ['protein'],
      },
      '2026-07-27',
    );

    expect(deleteIngredient([item], item.id)).toHaveLength(0);
  });

  it('manual quantity adjustment changes current quantity', () => {
    const item = createIngredientDraft(
      {
        name: '鸡蛋',
        category: 'eggs',
        quantity: 6,
        unit: '个',
        storageLocation: 'fridge',
        expiryDate: '',
        nutritionTags: ['protein'],
      },
      '2026-07-27',
    );

    expect(adjustIngredientQuantity([item], item.id, 10, '2026-07-27T10:00:00.000Z')[0].quantity).toBe(10);
  });
});
