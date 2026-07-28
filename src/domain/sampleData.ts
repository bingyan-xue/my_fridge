import type { AppData, IngredientCategory, IngredientItem, NutritionTag, Recipe, Unit } from './types';
import { normalizeIngredientName } from './aliases';
import { applyDefaultExpiry } from './expiry';

const sampleDate = '2026-07-27';
const sampleTimestamp = '2026-07-27T08:00:00.000Z';

export const ingredientCategories: IngredientCategory[] = [
  { id: 'leafy-greens', name: 'Leafy Greens', defaultShelfLifeDays: 7, defaultNutritionTags: ['fiber', 'vegetable'] },
  { id: 'vegetables', name: 'Vegetables', defaultShelfLifeDays: 10, defaultNutritionTags: ['fiber', 'vegetable'] },
  { id: 'fruit', name: 'Fruit', defaultShelfLifeDays: 10, defaultNutritionTags: ['fiber', 'fruit'] },
  { id: 'eggs', name: 'Eggs', defaultShelfLifeDays: 21, defaultNutritionTags: ['protein', 'fat'] },
  { id: 'dairy', name: 'Dairy', defaultShelfLifeDays: 7, defaultNutritionTags: ['protein', 'fat', 'dairy'] },
  { id: 'meat', name: 'Meat', defaultShelfLifeDays: 3, defaultNutritionTags: ['protein', 'fat'] },
  { id: 'soy', name: 'Soy Products', defaultShelfLifeDays: 5, defaultNutritionTags: ['protein'] },
  { id: 'staple', name: 'Staples', defaultShelfLifeDays: 365, defaultNutritionTags: ['carb'] },
  { id: 'nuts', name: 'Nuts', defaultShelfLifeDays: 30, defaultNutritionTags: ['fat', 'protein'] },
  { id: 'other', name: 'Other', defaultShelfLifeDays: 14, defaultNutritionTags: [] },
];

export const defaultShelfLifeByCategory: Record<string, number> = Object.fromEntries(
  ingredientCategories.map((category) => [category.id, category.defaultShelfLifeDays]),
);

const categoryTags = new Map(ingredientCategories.map((category) => [category.id, category.defaultNutritionTags]));

function ingredient(
  id: string,
  name: string,
  category: string,
  quantity: number,
  unit: Unit,
  addedAt: string,
  options: {
    storageLocation?: IngredientItem['storageLocation'];
    expiryDate?: string;
    nutritionTags?: NutritionTag[];
  } = {},
): IngredientItem {
  const item: IngredientItem = {
    id,
    name,
    canonicalName: normalizeIngredientName(name),
    category,
    quantity,
    unit,
    storageLocation: options.storageLocation ?? 'fridge',
    addedAt,
    expiryDate: options.expiryDate,
    expirySource: options.expiryDate ? 'user' : 'default',
    nutritionTags: options.nutritionTags ?? categoryTags.get(category) ?? [],
    updatedAt: sampleTimestamp,
  };

  return applyDefaultExpiry(item, defaultShelfLifeByCategory);
}

function recipeIngredient(name: string, quantity: number, unit: Unit, required = true) {
  return { name, canonicalName: normalizeIngredientName(name), quantity, unit, required };
}

function recipe(
  id: string,
  name: string,
  recipeType: Recipe['recipeType'],
  mealTypes: Recipe['mealTypes'],
  ingredients: Recipe['ingredients'],
  nutritionTags: NutritionTag[],
): Recipe {
  return {
    id,
    name,
    recipeType,
    source: 'builtIn',
    mealTypes,
    servings: 1,
    ingredients,
    nutritionTags,
    createdAt: sampleTimestamp,
    updatedAt: sampleTimestamp,
  };
}

export const builtInRecipes: Recipe[] = [
  recipe('recipe-boiled-egg', 'Boiled Egg', 'readyToEat', ['breakfast', 'any'], [recipeIngredient('Egg', 1, '个')], ['protein', 'fat']),
  recipe('recipe-milk', 'Milk', 'readyToEat', ['breakfast', 'any'], [recipeIngredient('Milk', 250, 'ml')], ['protein', 'dairy', 'fat']),
  recipe('recipe-banana', 'Banana', 'readyToEat', ['breakfast', 'any'], [recipeIngredient('Banana', 1, '根')], ['fruit', 'fiber', 'carb']),
  recipe('recipe-apple', 'Apple', 'readyToEat', ['breakfast', 'any'], [recipeIngredient('Apple', 1, '个')], ['fruit', 'fiber']),
  recipe('recipe-yogurt', 'Yogurt', 'readyToEat', ['breakfast', 'any'], [recipeIngredient('Yogurt', 1, '盒')], ['protein', 'dairy']),
  recipe('recipe-rice', 'Rice', 'staple', ['lunch', 'dinner', 'any'], [recipeIngredient('Rice', 100, 'g')], ['carb']),
  recipe('recipe-porridge', 'Rice Porridge', 'staple', ['breakfast', 'any'], [recipeIngredient('Rice', 60, 'g')], ['carb']),
  recipe('recipe-noodles', 'Plain Noodles', 'staple', ['lunch', 'dinner', 'any'], [recipeIngredient('Noodles', 100, 'g')], ['carb']),
  recipe('recipe-tomato-egg', 'Tomato Eggs', 'dish', ['lunch', 'dinner'], [recipeIngredient('Tomato', 1, '个'), recipeIngredient('Egg', 1, '个')], ['protein', 'vegetable', 'fat']),
  recipe('recipe-tofu-greens', 'Tofu with Greens', 'dish', ['lunch', 'dinner'], [recipeIngredient('Leafy Greens', 1, '把'), recipeIngredient('Tofu', 200, 'g')], ['protein', 'vegetable', 'fiber']),
  recipe('recipe-potato-beef', 'Potato Beef', 'dish', ['lunch', 'dinner'], [recipeIngredient('Potato', 2, '个'), recipeIngredient('Beef', 250, 'g')], ['protein', 'carb', 'fat']),
  recipe('recipe-chicken-rice', 'Chicken Rice', 'combo', ['lunch', 'dinner'], [recipeIngredient('Chicken Breast', 200, 'g'), recipeIngredient('Rice', 100, 'g')], ['protein', 'carb']),
  recipe('recipe-cabbage-egg', 'Cabbage Eggs', 'dish', ['lunch', 'dinner'], [recipeIngredient('Cabbage', 300, 'g'), recipeIngredient('Egg', 1, '个')], ['protein', 'vegetable', 'fiber']),
  recipe('recipe-milk-egg-banana', 'Milk Egg Banana', 'combo', ['breakfast'], [recipeIngredient('Milk', 250, 'ml'), recipeIngredient('Egg', 1, '个'), recipeIngredient('Banana', 1, '根')], ['protein', 'dairy', 'fruit']),
  recipe('recipe-bread-milk', 'Bread and Milk', 'combo', ['breakfast'], [recipeIngredient('Bread', 1, '包'), recipeIngredient('Milk', 250, 'ml')], ['carb', 'protein', 'dairy']),
  recipe('recipe-corn-egg', 'Corn and Egg', 'combo', ['breakfast', 'any'], [recipeIngredient('Corn', 1, '根'), recipeIngredient('Egg', 1, '个')], ['carb', 'protein', 'fiber']),
  recipe('recipe-stir-leafy', 'Sauteed Leafy Greens', 'dish', ['lunch', 'dinner'], [recipeIngredient('Leafy Greens', 1, '把')], ['vegetable', 'fiber']),
  recipe('recipe-nuts-yogurt', 'Nuts and Yogurt', 'combo', ['breakfast', 'any'], [recipeIngredient('Nuts', 30, 'g'), recipeIngredient('Yogurt', 1, '盒')], ['protein', 'fat', 'dairy']),
];

export const sampleIngredients: IngredientItem[] = [
  ingredient('ing-leafy-1', 'Leafy Greens', 'leafy-greens', 2, '把', '2026-07-22'),
  ingredient('ing-spinach', 'Spinach', 'leafy-greens', 300, 'g', '2026-07-24'),
  ingredient('ing-cabbage', 'Cabbage', 'vegetables', 1, '个', '2026-07-23'),
  ingredient('ing-tomato', 'Tomato', 'vegetables', 4, '个', '2026-07-25'),
  ingredient('ing-potato', 'Potato', 'vegetables', 5, '个', '2026-07-20', { storageLocation: 'pantry' }),
  ingredient('ing-carrot', 'Carrot', 'vegetables', 3, '根', '2026-07-21', { storageLocation: 'fridge' }),
  ingredient('ing-corn', 'Corn', 'vegetables', 2, '根', '2026-07-26'),
  ingredient('ing-banana', 'Banana', 'fruit', 5, '根', '2026-07-25', { storageLocation: 'pantry' }),
  ingredient('ing-apple', 'Apple', 'fruit', 6, '个', '2026-07-18', { storageLocation: 'fridge' }),
  ingredient('ing-eggs', 'Egg', 'eggs', 8, '个', '2026-07-16'),
  ingredient('ing-milk', 'Milk', 'dairy', 1, 'L', '2026-07-25', { expiryDate: '2026-07-28' }),
  ingredient('ing-yogurt', 'Yogurt', 'dairy', 3, '盒', '2026-07-24'),
  ingredient('ing-tofu', 'Tofu', 'soy', 400, 'g', '2026-07-25', { expiryDate: '2026-07-28' }),
  ingredient('ing-beef', 'Beef', 'meat', 500, 'g', '2026-07-26', { storageLocation: 'freezer' }),
  ingredient('ing-chicken', 'Chicken Breast', 'meat', 1, '斤', '2026-07-26', { storageLocation: 'freezer' }),
  ingredient('ing-rice', 'Rice', 'staple', 2, 'kg', '2026-07-01', { storageLocation: 'pantry' }),
  ingredient('ing-noodles', 'Noodles', 'staple', 800, 'g', '2026-07-03', { storageLocation: 'pantry' }),
  ingredient('ing-bread', 'Bread', 'staple', 1, '包', '2026-07-26', { storageLocation: 'pantry', nutritionTags: ['carb'] }),
  ingredient('ing-oats', 'Oats', 'staple', 1, '袋', '2026-07-04', { storageLocation: 'pantry' }),
  ingredient('ing-nuts', 'Nuts', 'nuts', 300, 'g', '2026-07-19', { storageLocation: 'pantry' }),
  ingredient('ing-mushroom', 'Mushroom', 'vegetables', 200, 'g', '2026-07-25'),
  ingredient('ing-cucumber', 'Cucumber', 'vegetables', 2, '根', '2026-07-25'),
  ingredient('ing-shrimp', 'Shrimp', 'meat', 300, 'g', '2026-07-26', { storageLocation: 'freezer', nutritionTags: ['protein'] }),
  ingredient('ing-soy-milk', 'Soy Milk', 'soy', 2, '瓶', '2026-07-26', { nutritionTags: ['protein'] }),
];

export const defaultSettings = {
  updatedAt: sampleTimestamp,
};

export function createSampleAppData(): AppData {
  return {
    schemaVersion: 1,
    ingredients: structuredClone(sampleIngredients),
    recipes: structuredClone(builtInRecipes),
    mealPlans: [],
    inventoryTransactions: [],
    settings: { ...defaultSettings },
  };
}

export const sampleAppData: AppData = createSampleAppData();
