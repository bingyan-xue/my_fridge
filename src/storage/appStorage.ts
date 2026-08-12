import { builtInRecipes, createSampleAppData, sampleIngredients } from '../domain/sampleData';
import type { AppData } from '../domain/types';

export const APP_DATA_KEY = 'my-fridge-app-data';

function assertAppData(value: unknown): asserts value is AppData {
  if (!value || typeof value !== 'object') {
    throw new Error('缺少必要字段');
  }

  const data = value as Partial<AppData>;
  if (data.schemaVersion !== 1) {
    throw new Error('schemaVersion 不支持');
  }

  if (
    !Array.isArray(data.ingredients) ||
    !Array.isArray(data.recipes) ||
    !Array.isArray(data.mealPlans) ||
    !Array.isArray(data.inventoryTransactions) ||
    !data.settings
  ) {
    throw new Error('缺少必要字段');
  }
}

export function saveAppData(data: AppData): void {
  localStorage.setItem(APP_DATA_KEY, JSON.stringify(data));
}

export function loadAppData(): AppData {
  const raw = localStorage.getItem(APP_DATA_KEY);
  if (!raw) {
    return resetToSampleData();
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    assertAppData(parsed);
    const refreshed = refreshBuiltInData(parsed);
    if (JSON.stringify(refreshed) !== JSON.stringify(parsed)) {
      saveAppData(refreshed);
    }
    return refreshed;
  } catch {
    return resetToSampleData();
  }
}

function refreshBuiltInData(data: AppData): AppData {
  const sampleIngredientNames = new Map(
    sampleIngredients.map((ingredient) => [ingredient.id, { name: ingredient.name, canonicalName: ingredient.canonicalName }]),
  );
  const builtInRecipeIds = new Set(builtInRecipes.map((recipe) => recipe.id));
  const builtInRecipesById = new Map(builtInRecipes.map((recipe) => [recipe.id, recipe]));
  const deletedBuiltInRecipeIds = new Set(data.settings.deletedBuiltInRecipeIds ?? []);
  const existingRecipeIds = new Set(data.recipes.map((recipe) => recipe.id));
  const userRecipes = data.recipes.filter((recipe) => recipe.source !== 'builtIn' && !builtInRecipeIds.has(recipe.id));
  const preservedBuiltInRecipes = data.recipes
    .filter((recipe) => recipe.source === 'builtIn' && !deletedBuiltInRecipeIds.has(recipe.id))
    .map((recipe) => {
      const latestBuiltInRecipe = builtInRecipesById.get(recipe.id);
      return latestBuiltInRecipe && recipe.updatedAt === latestBuiltInRecipe.updatedAt ? structuredClone(latestBuiltInRecipe) : recipe;
    });
  const missingBuiltInRecipes = builtInRecipes.filter(
    (recipe) => !existingRecipeIds.has(recipe.id) && !deletedBuiltInRecipeIds.has(recipe.id),
  );

  return {
    ...data,
    ingredients: data.ingredients.map((ingredient) => {
      const current = sampleIngredientNames.get(ingredient.id);
      return current ? { ...ingredient, ...current } : ingredient;
    }),
    recipes: [...preservedBuiltInRecipes, ...structuredClone(missingBuiltInRecipes), ...userRecipes],
  };
}

export function resetToSampleData(): AppData {
  const sample = createSampleAppData();
  saveAppData(sample);
  return sample;
}

export function serializeForExport(data: AppData, exportedAt: string): string {
  return JSON.stringify({ ...data, exportedAt }, null, 2);
}

export function parseImportedData(jsonText: string): AppData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('文件不是 JSON');
  }

  assertAppData(parsed);
  return parsed;
}
