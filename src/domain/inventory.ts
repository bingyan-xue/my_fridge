import { normalizeIngredientName } from './aliases';
import { applyDefaultExpiry } from './expiry';
import { defaultShelfLifeByCategory } from './sampleData';
import type { IngredientItem, NutritionTag, Unit } from './types';

export type IngredientFormInput = {
  name: string;
  category: string;
  quantity: number;
  unit: Unit;
  storageLocation: IngredientItem['storageLocation'];
  expiryDate: string;
  nutritionTags: NutritionTag[];
};

export function createIngredientDraft(input: IngredientFormInput, today: string): IngredientItem {
  const now = new Date().toISOString();
  const item: IngredientItem = {
    id: `ing-${crypto.randomUUID()}`,
    name: input.name.trim(),
    canonicalName: normalizeIngredientName(input.name),
    category: input.category,
    quantity: input.quantity,
    unit: input.unit,
    storageLocation: input.storageLocation,
    addedAt: today,
    expiryDate: input.expiryDate || undefined,
    expirySource: input.expiryDate ? 'user' : 'default',
    nutritionTags: input.nutritionTags,
    updatedAt: now,
  };

  return applyDefaultExpiry(item, defaultShelfLifeByCategory);
}

export function upsertIngredient(items: IngredientItem[], item: IngredientItem): IngredientItem[] {
  const exists = items.some((candidate) => candidate.id === item.id);
  return exists ? items.map((candidate) => (candidate.id === item.id ? item : candidate)) : [item, ...items];
}

export function deleteIngredient(items: IngredientItem[], id: string): IngredientItem[] {
  return items.filter((item) => item.id !== id);
}

export function adjustIngredientQuantity(
  items: IngredientItem[],
  id: string,
  quantity: number,
  changedAt: string,
): IngredientItem[] {
  return items.map((item) => (item.id === id ? { ...item, quantity, updatedAt: changedAt } : item));
}
