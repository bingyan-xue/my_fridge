import { describe, expect, it } from 'vitest';
import {
  adjustIngredientQuantity,
  completePlannedMealItem,
  createIngredientDraft,
  deleteIngredient,
  undoCompletedMealItem,
  upsertIngredient,
} from '../src/domain/inventory';
import type { AppData } from '../src/domain/types';

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

    expect(item.canonicalName).toBe('Tomato');
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

describe('meal completion inventory transactions', () => {
  const data: AppData = {
    schemaVersion: 1,
    ingredients: [
      {
        id: 'ing-egg',
        name: '鸡蛋',
        canonicalName: '鸡蛋',
        category: 'eggs',
        quantity: 6,
        unit: '个',
        storageLocation: 'fridge',
        addedAt: '2026-07-27',
        expirySource: 'default',
        estimatedExpiryDate: '2026-08-17',
        nutritionTags: ['protein'],
        updatedAt: '2026-07-27T00:00:00.000Z',
      },
    ],
    recipes: [],
    mealPlans: [
      {
        id: 'plan-1',
        date: '2026-07-27',
        createdAt: '2026-07-27T00:00:00.000Z',
        updatedAt: '2026-07-27T00:00:00.000Z',
        meals: [
          {
            mealType: 'breakfast',
            items: [
              {
                id: 'planned-egg',
                recipeSnapshot: {
                  id: 'recipe-egg',
                  name: '水煮蛋',
                  recipeType: 'readyToEat',
                  source: 'builtIn',
                  mealTypes: ['breakfast'],
                  servings: 1,
                  ingredients: [{ name: '鸡蛋', canonicalName: '鸡蛋', quantity: 2, unit: '个', required: true }],
                  nutritionTags: ['protein'],
                  createdAt: '2026-07-27T00:00:00.000Z',
                  updatedAt: '2026-07-27T00:00:00.000Z',
                },
                plannedServings: 1,
                plannedConsumption: [
                  {
                    ingredientItemId: 'ing-egg',
                    ingredientName: '鸡蛋',
                    canonicalName: '鸡蛋',
                    quantity: 2,
                    unit: '个',
                    requiresConfirmation: false,
                  },
                ],
                status: 'planned',
                reasons: ['补了蛋白质'],
                warnings: [],
                locked: false,
              },
            ],
          },
        ],
      },
    ],
    inventoryTransactions: [],
    settings: { updatedAt: '2026-07-27T00:00:00.000Z' },
  };

  it('deducts inventory only after confirmation', () => {
    const completed = completePlannedMealItem(data, 'plan-1', 'planned-egg', '2026-07-27T08:00:00.000Z');

    expect(completed.ingredients[0].quantity).toBe(4);
    expect(completed.inventoryTransactions[0].quantityDelta).toBe(-2);
    expect(completed.mealPlans[0].meals[0].items[0].locked).toBe(true);
  });

  it('restores inventory after canceling confirmation', () => {
    const completed = completePlannedMealItem(data, 'plan-1', 'planned-egg', '2026-07-27T08:00:00.000Z');
    const undone = undoCompletedMealItem(completed, 'plan-1', 'planned-egg', '2026-07-27T08:05:00.000Z');

    expect(undone.ingredients[0].quantity).toBe(6);
    expect(undone.inventoryTransactions.at(-1)?.quantityDelta).toBe(2);
    expect(undone.mealPlans[0].meals[0].items[0].locked).toBe(false);
  });
});
