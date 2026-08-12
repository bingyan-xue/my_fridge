import { describe, expect, it } from 'vitest';
import { createUserRecipe, deleteRecipe, updateRecipeFromInput, upsertRecipe } from '../src/domain/recipes';

describe('recipe helpers', () => {
  it('creates user recipe with canonical ingredient names', () => {
    const recipe = createUserRecipe(
      {
        name: '西红柿炒蛋',
        recipeType: 'dish',
        mealTypes: ['lunch', 'dinner'],
        servings: 1,
        ingredients: [
          { name: '番茄', quantity: 1, unit: '个', required: true },
          { name: '鸡蛋', quantity: 1, unit: '个', required: true },
        ],
        nutritionTags: ['protein', 'fiber', 'fat'],
      },
      '2026-07-27T10:00:00.000Z',
    );

    expect(recipe.source).toBe('userCreated');
    expect(recipe.ingredients[0].canonicalName).toBe('Tomato');
  });

  it('upserts and deletes recipes by id', () => {
    const recipe = createUserRecipe(
      {
        name: '米饭',
        recipeType: 'staple',
        mealTypes: ['lunch', 'dinner'],
        servings: 1,
        ingredients: [{ name: '大米', quantity: 100, unit: 'g', required: true }],
        nutritionTags: ['carb'],
      },
      '2026-07-27T10:00:00.000Z',
    );

    expect(upsertRecipe([], recipe)).toHaveLength(1);
    expect(deleteRecipe([recipe], recipe.id)).toHaveLength(0);
  });

  it('updates an existing recipe while keeping its identity and source', () => {
    const recipe = createUserRecipe(
      {
        name: 'Tomato Eggs',
        recipeType: 'dish',
        mealTypes: ['lunch', 'dinner'],
        servings: 1,
        ingredients: [
          { name: 'Tomato', quantity: 1, unit: '个', required: true },
          { name: 'Egg', quantity: 1, unit: '个', required: true },
        ],
        nutritionTags: ['protein', 'vegetable'],
      },
      '2026-07-27T10:00:00.000Z',
    );

    const updated = updateRecipeFromInput(
      { ...recipe, source: 'builtIn' },
      {
        name: 'Tomato Eggs',
        recipeType: 'dish',
        mealTypes: ['lunch', 'dinner'],
        servings: 1,
        ingredients: [
          { name: 'Tomato', quantity: 2, unit: '个', required: true },
          { name: 'Egg', quantity: 3, unit: '个', required: true },
        ],
        nutritionTags: ['protein', 'vegetable', 'fat'],
      },
      '2026-08-12T10:00:00.000Z',
    );

    expect(updated).toMatchObject({
      id: recipe.id,
      source: 'builtIn',
      createdAt: '2026-07-27T10:00:00.000Z',
      updatedAt: '2026-08-12T10:00:00.000Z',
    });
    expect(updated.ingredients).toEqual([
      { name: 'Tomato', canonicalName: 'Tomato', quantity: 2, unit: '个', required: true },
      { name: 'Egg', canonicalName: 'Egg', quantity: 3, unit: '个', required: true },
    ]);
  });
});
