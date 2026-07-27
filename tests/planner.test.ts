import { describe, expect, it } from 'vitest';
import { generateMeal } from '../src/domain/planner';
import type { IngredientItem, Recipe } from '../src/domain/types';

const today = '2026-07-27';

const egg: IngredientItem = {
  id: 'ing-egg',
  name: '鸡蛋',
  canonicalName: '鸡蛋',
  category: 'eggs',
  quantity: 2,
  unit: '个',
  storageLocation: 'fridge',
  addedAt: today,
  expiryDate: '2026-07-28',
  expirySource: 'user',
  nutritionTags: ['protein', 'fat'],
  updatedAt: `${today}T00:00:00.000Z`,
};

const rice: IngredientItem = {
  id: 'ing-rice',
  name: '大米',
  canonicalName: '大米',
  category: 'staple',
  quantity: 1,
  unit: 'kg',
  storageLocation: 'pantry',
  addedAt: today,
  estimatedExpiryDate: '2027-07-27',
  expirySource: 'default',
  nutritionTags: ['carb'],
  updatedAt: `${today}T00:00:00.000Z`,
};

const boiledEgg: Recipe = {
  id: 'recipe-egg',
  name: '水煮蛋',
  recipeType: 'readyToEat',
  source: 'builtIn',
  mealTypes: ['breakfast'],
  servings: 1,
  ingredients: [{ name: '鸡蛋', canonicalName: '鸡蛋', quantity: 1, unit: '个', required: true }],
  nutritionTags: ['protein', 'fat'],
  createdAt: `${today}T00:00:00.000Z`,
  updatedAt: `${today}T00:00:00.000Z`,
};

const riceRecipe: Recipe = {
  id: 'recipe-rice',
  name: '米饭',
  recipeType: 'staple',
  source: 'builtIn',
  mealTypes: ['lunch', 'dinner'],
  servings: 1,
  ingredients: [{ name: '大米', canonicalName: '大米', quantity: 100, unit: 'g', required: true }],
  nutritionTags: ['carb'],
  createdAt: `${today}T00:00:00.000Z`,
  updatedAt: `${today}T00:00:00.000Z`,
};

describe('generateMeal', () => {
  it('does not recommend a recipe for the wrong meal type', () => {
    const result = generateMeal({ mealType: 'lunch', today, ingredients: [egg], recipes: [boiledEgg] });

    expect(result.status).toBe('failed');
  });

  it('generates a breakfast item from available inventory', () => {
    const result = generateMeal({ mealType: 'breakfast', today, ingredients: [egg], recipes: [boiledEgg] });

    expect(result.status).toBe('generated');
    if (result.status === 'generated') {
      expect(result.meal.items[0].recipeSnapshot.name).toBe('水煮蛋');
      expect(result.meal.items[0].reasons.length).toBeLessThanOrEqual(2);
    }
  });

  it('converts deterministic units into inventory primary unit', () => {
    const result = generateMeal({ mealType: 'lunch', today, ingredients: [rice], recipes: [riceRecipe] });

    expect(result.status).toBe('generated');
    if (result.status === 'generated') {
      expect(result.meal.items[0].plannedConsumption[0].quantity).toBe(0.1);
      expect(result.meal.items[0].plannedConsumption[0].unit).toBe('kg');
    }
  });

  it('does not overwrite locked items', () => {
    const existingMeal = {
      mealType: 'breakfast' as const,
      items: [
        {
          id: 'planned-1',
          recipeSnapshot: boiledEgg,
          plannedServings: 1,
          plannedConsumption: [
            {
              ingredientItemId: 'ing-egg',
              ingredientName: '鸡蛋',
              canonicalName: '鸡蛋',
              quantity: 1,
              unit: '个' as const,
              requiresConfirmation: false,
            },
          ],
          status: 'completed' as const,
          reasons: ['补了蛋白质'],
          warnings: [],
          locked: true,
        },
      ],
    };

    const result = generateMeal({ mealType: 'breakfast', today, ingredients: [egg], recipes: [boiledEgg], existingMeal });

    expect(result.status).toBe('generated');
    if (result.status === 'generated') {
      expect(result.meal.items[0].id).toBe('planned-1');
    }
  });
});
