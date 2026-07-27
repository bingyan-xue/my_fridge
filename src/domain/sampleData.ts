import type { AppData, IngredientCategory, IngredientItem, NutritionTag, Recipe, Unit } from './types';
import { normalizeIngredientName } from './aliases';
import { applyDefaultExpiry } from './expiry';

const sampleDate = '2026-07-27';
const sampleTimestamp = '2026-07-27T08:00:00.000Z';

export const ingredientCategories: IngredientCategory[] = [
  { id: 'leafy-greens', name: '叶菜', defaultShelfLifeDays: 7, defaultNutritionTags: ['fiber', 'vegetable'] },
  { id: 'vegetables', name: '蔬菜', defaultShelfLifeDays: 10, defaultNutritionTags: ['fiber', 'vegetable'] },
  { id: 'fruit', name: '水果', defaultShelfLifeDays: 10, defaultNutritionTags: ['fiber', 'fruit'] },
  { id: 'eggs', name: '蛋类', defaultShelfLifeDays: 21, defaultNutritionTags: ['protein', 'fat'] },
  { id: 'dairy', name: '奶制品', defaultShelfLifeDays: 7, defaultNutritionTags: ['protein', 'fat', 'dairy'] },
  { id: 'meat', name: '肉类', defaultShelfLifeDays: 3, defaultNutritionTags: ['protein', 'fat'] },
  { id: 'soy', name: '豆制品', defaultShelfLifeDays: 5, defaultNutritionTags: ['protein'] },
  { id: 'staple', name: '米面主食', defaultShelfLifeDays: 365, defaultNutritionTags: ['carb'] },
  { id: 'nuts', name: '坚果', defaultShelfLifeDays: 30, defaultNutritionTags: ['fat', 'protein'] },
  { id: 'other', name: '其他', defaultShelfLifeDays: 14, defaultNutritionTags: [] },
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
  recipe('recipe-boiled-egg', '水煮蛋', 'readyToEat', ['breakfast', 'any'], [recipeIngredient('鸡蛋', 1, '个')], ['protein', 'fat']),
  recipe('recipe-milk', '牛奶', 'readyToEat', ['breakfast', 'any'], [recipeIngredient('牛奶', 250, 'ml')], ['protein', 'dairy', 'fat']),
  recipe('recipe-banana', '香蕉', 'readyToEat', ['breakfast', 'any'], [recipeIngredient('香蕉', 1, '根')], ['fruit', 'fiber', 'carb']),
  recipe('recipe-apple', '苹果', 'readyToEat', ['breakfast', 'any'], [recipeIngredient('苹果', 1, '个')], ['fruit', 'fiber']),
  recipe('recipe-yogurt', '酸奶', 'readyToEat', ['breakfast', 'any'], [recipeIngredient('酸奶', 1, '盒')], ['protein', 'dairy']),
  recipe('recipe-rice', '米饭', 'staple', ['lunch', 'dinner', 'any'], [recipeIngredient('大米', 100, 'g')], ['carb']),
  recipe('recipe-porridge', '白粥', 'staple', ['breakfast', 'any'], [recipeIngredient('大米', 60, 'g')], ['carb']),
  recipe('recipe-noodles', '清汤面', 'staple', ['lunch', 'dinner', 'any'], [recipeIngredient('面条', 100, 'g')], ['carb']),
  recipe('recipe-tomato-egg', '西红柿炒蛋', 'dish', ['lunch', 'dinner'], [recipeIngredient('西红柿', 1, '个'), recipeIngredient('鸡蛋', 1, '个')], ['protein', 'vegetable', 'fat']),
  recipe('recipe-tofu-greens', '青菜豆腐', 'dish', ['lunch', 'dinner'], [recipeIngredient('叶菜', 1, '把'), recipeIngredient('豆腐', 200, 'g')], ['protein', 'vegetable', 'fiber']),
  recipe('recipe-potato-beef', '土豆牛肉', 'dish', ['lunch', 'dinner'], [recipeIngredient('土豆', 2, '个'), recipeIngredient('牛肉', 250, 'g')], ['protein', 'carb', 'fat']),
  recipe('recipe-chicken-rice', '鸡肉米饭', 'combo', ['lunch', 'dinner'], [recipeIngredient('鸡胸肉', 200, 'g'), recipeIngredient('大米', 100, 'g')], ['protein', 'carb']),
  recipe('recipe-cabbage-egg', '白菜炒蛋', 'dish', ['lunch', 'dinner'], [recipeIngredient('白菜', 300, 'g'), recipeIngredient('鸡蛋', 1, '个')], ['protein', 'vegetable', 'fiber']),
  recipe('recipe-milk-egg-banana', '牛奶鸡蛋香蕉', 'combo', ['breakfast'], [recipeIngredient('牛奶', 250, 'ml'), recipeIngredient('鸡蛋', 1, '个'), recipeIngredient('香蕉', 1, '根')], ['protein', 'dairy', 'fruit']),
  recipe('recipe-bread-milk', '面包牛奶', 'combo', ['breakfast'], [recipeIngredient('面包', 1, '包'), recipeIngredient('牛奶', 250, 'ml')], ['carb', 'protein', 'dairy']),
  recipe('recipe-corn-egg', '玉米鸡蛋', 'combo', ['breakfast', 'any'], [recipeIngredient('玉米', 1, '根'), recipeIngredient('鸡蛋', 1, '个')], ['carb', 'protein', 'fiber']),
  recipe('recipe-stir-leafy', '清炒叶菜', 'dish', ['lunch', 'dinner'], [recipeIngredient('叶菜', 1, '把')], ['vegetable', 'fiber']),
  recipe('recipe-nuts-yogurt', '坚果酸奶', 'combo', ['breakfast', 'any'], [recipeIngredient('坚果', 30, 'g'), recipeIngredient('酸奶', 1, '盒')], ['protein', 'fat', 'dairy']),
];

export const sampleIngredients: IngredientItem[] = [
  ingredient('ing-leafy-1', '青菜', 'leafy-greens', 2, '把', '2026-07-22'),
  ingredient('ing-spinach', '菠菜', 'leafy-greens', 300, 'g', '2026-07-24'),
  ingredient('ing-cabbage', '白菜', 'vegetables', 1, '个', '2026-07-23'),
  ingredient('ing-tomato', '番茄', 'vegetables', 4, '个', '2026-07-25'),
  ingredient('ing-potato', '马铃薯', 'vegetables', 5, '个', '2026-07-20', { storageLocation: 'pantry' }),
  ingredient('ing-carrot', '胡萝卜', 'vegetables', 3, '根', '2026-07-21', { storageLocation: 'fridge' }),
  ingredient('ing-corn', '玉米', 'vegetables', 2, '根', '2026-07-26'),
  ingredient('ing-banana', '香蕉', 'fruit', 5, '根', '2026-07-25', { storageLocation: 'pantry' }),
  ingredient('ing-apple', '苹果', 'fruit', 6, '个', '2026-07-18', { storageLocation: 'fridge' }),
  ingredient('ing-eggs', '鸡蛋', 'eggs', 8, '个', '2026-07-16'),
  ingredient('ing-milk', '牛奶', 'dairy', 1, 'L', '2026-07-25', { expiryDate: '2026-07-28' }),
  ingredient('ing-yogurt', '酸奶', 'dairy', 3, '盒', '2026-07-24'),
  ingredient('ing-tofu', '豆腐', 'soy', 400, 'g', '2026-07-25', { expiryDate: '2026-07-28' }),
  ingredient('ing-beef', '牛肉', 'meat', 500, 'g', '2026-07-26', { storageLocation: 'freezer' }),
  ingredient('ing-chicken', '鸡胸肉', 'meat', 1, '斤', '2026-07-26', { storageLocation: 'freezer' }),
  ingredient('ing-rice', '大米', 'staple', 2, 'kg', '2026-07-01', { storageLocation: 'pantry' }),
  ingredient('ing-noodles', '面条', 'staple', 800, 'g', '2026-07-03', { storageLocation: 'pantry' }),
  ingredient('ing-bread', '面包', 'staple', 1, '包', '2026-07-26', { storageLocation: 'pantry', nutritionTags: ['carb'] }),
  ingredient('ing-oats', '燕麦', 'staple', 1, '袋', '2026-07-04', { storageLocation: 'pantry' }),
  ingredient('ing-nuts', '坚果', 'nuts', 300, 'g', '2026-07-19', { storageLocation: 'pantry' }),
  ingredient('ing-mushroom', '香菇', 'vegetables', 200, 'g', '2026-07-25'),
  ingredient('ing-cucumber', '黄瓜', 'vegetables', 2, '根', '2026-07-25'),
  ingredient('ing-shrimp', '虾仁', 'meat', 300, 'g', '2026-07-26', { storageLocation: 'freezer', nutritionTags: ['protein'] }),
  ingredient('ing-soy-milk', '豆浆', 'soy', 2, '瓶', '2026-07-26', { nutritionTags: ['protein'] }),
];

export const defaultSettings = {
  updatedAt: sampleTimestamp,
};

export const sampleAppData: AppData = {
  schemaVersion: 1,
  ingredients: sampleIngredients,
  recipes: builtInRecipes,
  mealPlans: [],
  inventoryTransactions: [],
  settings: defaultSettings,
};
