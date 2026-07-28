import { describe, expect, it } from 'vitest';
import { normalizeIngredientName } from '../src/domain/aliases';
import { builtInRecipes, ingredientCategories, sampleIngredients } from '../src/domain/sampleData';

const hanText = /\p{Script=Han}/u;

describe('built-in sample data', () => {
  it('ships English category, recipe, ingredient, and canonical names by default', () => {
    expect(ingredientCategories.map((category) => category.name)).toContain('Vegetables');
    expect(builtInRecipes.map((recipe) => recipe.name)).toContain('Tomato Eggs');
    expect(sampleIngredients.map((ingredient) => ingredient.name)).toContain('Tomato');

    const visibleNames = [
      ...ingredientCategories.map((category) => category.name),
      ...builtInRecipes.map((recipe) => recipe.name),
      ...builtInRecipes.flatMap((recipe) => recipe.ingredients.map((ingredient) => ingredient.name)),
      ...sampleIngredients.flatMap((ingredient) => [ingredient.name, ingredient.canonicalName]),
    ];

    expect(visibleNames.filter((name) => hanText.test(name))).toEqual([]);
  });

  it('normalizes Chinese and English aliases to the same English canonical names', () => {
    expect(normalizeIngredientName('tomatoes')).toBe('Tomato');
    expect(normalizeIngredientName('番茄')).toBe('Tomato');
    expect(normalizeIngredientName('西红柿')).toBe('Tomato');
    expect(normalizeIngredientName('eggs')).toBe('Egg');
    expect(normalizeIngredientName('鸡蛋')).toBe('Egg');
  });
});
