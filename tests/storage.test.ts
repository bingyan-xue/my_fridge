import { beforeEach, describe, expect, it } from 'vitest';
import { createSampleAppData } from '../src/domain/sampleData';
import {
  APP_DATA_KEY,
  loadAppData,
  parseImportedData,
  resetToSampleData,
  saveAppData,
  serializeForExport,
} from '../src/storage/appStorage';

describe('appStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads sample data when localStorage is empty', () => {
    const data = loadAppData();

    expect(data.schemaVersion).toBe(1);
    expect(data.ingredients.length).toBeGreaterThanOrEqual(20);
    expect(data.recipes.length).toBeGreaterThanOrEqual(15);
  });

  it('refreshes persisted built-in recipes and sample ingredient names to English', () => {
    const data = createSampleAppData();
    const oldData = {
      ...data,
      ingredients: data.ingredients.map((ingredient) =>
        ingredient.id === 'ing-tomato'
          ? { ...ingredient, name: '番茄', canonicalName: '西红柿', quantity: 3 }
          : ingredient,
      ),
      recipes: [
        ...data.recipes.map((recipe) =>
          recipe.id === 'recipe-tomato-egg'
            ? {
                ...recipe,
                name: '西红柿炒蛋',
                ingredients: recipe.ingredients.map((ingredient) =>
                  ingredient.canonicalName === 'Tomato'
                    ? { ...ingredient, name: '西红柿', canonicalName: '西红柿' }
                    : ingredient,
                ),
              }
            : recipe,
        ),
        {
          ...data.recipes[0],
          id: 'user-recipe',
          name: 'My Recipe',
          source: 'userCreated' as const,
        },
      ],
    };
    localStorage.setItem(APP_DATA_KEY, JSON.stringify(oldData));

    const loaded = loadAppData();

    expect(loaded.ingredients.find((ingredient) => ingredient.id === 'ing-tomato')).toMatchObject({
      name: 'Tomato',
      canonicalName: 'Tomato',
      quantity: 3,
    });
    expect(loaded.recipes.find((recipe) => recipe.id === 'recipe-tomato-egg')?.name).toBe('Tomato Eggs');
    expect(loaded.recipes.find((recipe) => recipe.id === 'user-recipe')?.name).toBe('My Recipe');
  });

  it('saves and loads app data', () => {
    const data = createSampleAppData();
    const changed = { ...data, ingredients: data.ingredients.slice(0, 1) };

    saveAppData(changed);

    expect(loadAppData().ingredients).toHaveLength(1);
  });

  it('does not restore deleted built-in recipes on normal reload', () => {
    const data = createSampleAppData();
    const changed = {
      ...data,
      recipes: data.recipes.filter((recipe) => recipe.id !== 'recipe-tomato-egg'),
      settings: {
        ...data.settings,
        deletedBuiltInRecipeIds: ['recipe-tomato-egg'],
      },
    };
    localStorage.setItem(APP_DATA_KEY, JSON.stringify(changed));

    const loaded = loadAppData();

    expect(loaded.recipes.some((recipe) => recipe.id === 'recipe-tomato-egg')).toBe(false);
    expect(loaded.settings.deletedBuiltInRecipeIds).toEqual(['recipe-tomato-egg']);
  });

  it('preserves edited built-in recipes on normal reload', () => {
    const data = createSampleAppData();
    const changed = {
      ...data,
      recipes: data.recipes.map((recipe) =>
        recipe.id === 'recipe-tomato-egg'
          ? {
              ...recipe,
              ingredients: recipe.ingredients.map((ingredient) =>
                ingredient.canonicalName === 'Egg' ? { ...ingredient, quantity: 3 } : ingredient,
              ),
              updatedAt: '2026-08-12T10:00:00.000Z',
            }
          : recipe,
      ),
    };
    localStorage.setItem(APP_DATA_KEY, JSON.stringify(changed));

    const loaded = loadAppData();
    const tomatoEggs = loaded.recipes.find((recipe) => recipe.id === 'recipe-tomato-egg');

    expect(tomatoEggs?.ingredients.find((ingredient) => ingredient.canonicalName === 'Egg')?.quantity).toBe(3);
    expect(tomatoEggs?.updatedAt).toBe('2026-08-12T10:00:00.000Z');
  });

  it('exports schemaVersion and exportedAt', () => {
    const json = serializeForExport(createSampleAppData(), '2026-07-27T12:00:00.000Z');
    const parsed = JSON.parse(json);

    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.exportedAt).toBe('2026-07-27T12:00:00.000Z');
  });

  it('rejects invalid JSON without writing localStorage', () => {
    localStorage.setItem(APP_DATA_KEY, JSON.stringify(createSampleAppData()));

    expect(() => parseImportedData('{bad')).toThrow('文件不是 JSON');
    expect(loadAppData().schemaVersion).toBe(1);
  });

  it('rejects unsupported schemaVersion', () => {
    expect(() => parseImportedData(JSON.stringify({ schemaVersion: 99 }))).toThrow('schemaVersion 不支持');
  });

  it('rejects missing required fields', () => {
    expect(() => parseImportedData(JSON.stringify({ schemaVersion: 1 }))).toThrow('缺少必要字段');
  });

  it('resets sample data into localStorage', () => {
    const data = resetToSampleData();

    expect(data.ingredients.length).toBeGreaterThanOrEqual(20);
    expect(localStorage.getItem(APP_DATA_KEY)).toContain('"schemaVersion":1');
  });
});
