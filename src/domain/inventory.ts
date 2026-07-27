import { normalizeIngredientName } from './aliases';
import { applyDefaultExpiry } from './expiry';
import { defaultShelfLifeByCategory } from './sampleData';
import type { AppData, IngredientItem, InventoryTransaction, NutritionTag, Unit } from './types';

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

export function completePlannedMealItem(data: AppData, mealPlanId: string, itemId: string, now: string): AppData {
  const plan = data.mealPlans.find((candidate) => candidate.id === mealPlanId);
  const meal = plan?.meals.find((candidate) => candidate.items.some((item) => item.id === itemId));
  const item = meal?.items.find((candidate) => candidate.id === itemId);
  if (!plan || !meal || !item || item.status === 'completed') {
    return data;
  }

  const transactions: InventoryTransaction[] = item.plannedConsumption.map((consumption) => ({
    id: `tx-${crypto.randomUUID()}`,
    ingredientItemId: consumption.ingredientItemId,
    mealPlanId,
    plannedMealItemId: itemId,
    quantityDelta: -consumption.quantity,
    unit: consumption.unit,
    reason: 'mealCompleted',
    createdAt: now,
  }));

  return {
    ...data,
    ingredients: data.ingredients.map((ingredient) => {
      const delta = transactions
        .filter((transaction) => transaction.ingredientItemId === ingredient.id)
        .reduce((sum, transaction) => sum + transaction.quantityDelta, 0);
      return delta === 0 ? ingredient : { ...ingredient, quantity: ingredient.quantity + delta, updatedAt: now };
    }),
    mealPlans: data.mealPlans.map((candidatePlan) =>
      candidatePlan.id === mealPlanId
        ? {
            ...candidatePlan,
            updatedAt: now,
            meals: candidatePlan.meals.map((candidateMeal) => ({
              ...candidateMeal,
              items: candidateMeal.items.map((candidateItem) =>
                candidateItem.id === itemId ? { ...candidateItem, status: 'completed', locked: true } : candidateItem,
              ),
            })),
          }
        : candidatePlan,
    ),
    inventoryTransactions: [...data.inventoryTransactions, ...transactions],
  };
}

export function undoCompletedMealItem(data: AppData, mealPlanId: string, itemId: string, now: string): AppData {
  const originalTransactions = data.inventoryTransactions.filter(
    (transaction) =>
      transaction.mealPlanId === mealPlanId &&
      transaction.plannedMealItemId === itemId &&
      transaction.reason === 'mealCompleted',
  );
  const alreadyUndoneIds = new Set(
    data.inventoryTransactions
      .filter((transaction) => transaction.reason === 'mealCompletionUndone' && transaction.relatedTransactionId)
      .map((transaction) => transaction.relatedTransactionId),
  );
  const transactionsToReverse = originalTransactions.filter((transaction) => !alreadyUndoneIds.has(transaction.id));
  if (transactionsToReverse.length === 0) {
    return data;
  }

  const reverseTransactions: InventoryTransaction[] = transactionsToReverse.map((transaction) => ({
    id: `tx-${crypto.randomUUID()}`,
    ingredientItemId: transaction.ingredientItemId,
    mealPlanId,
    plannedMealItemId: itemId,
    quantityDelta: -transaction.quantityDelta,
    unit: transaction.unit,
    reason: 'mealCompletionUndone',
    relatedTransactionId: transaction.id,
    createdAt: now,
  }));

  return {
    ...data,
    ingredients: data.ingredients.map((ingredient) => {
      const delta = reverseTransactions
        .filter((transaction) => transaction.ingredientItemId === ingredient.id)
        .reduce((sum, transaction) => sum + transaction.quantityDelta, 0);
      return delta === 0 ? ingredient : { ...ingredient, quantity: ingredient.quantity + delta, updatedAt: now };
    }),
    mealPlans: data.mealPlans.map((candidatePlan) =>
      candidatePlan.id === mealPlanId
        ? {
            ...candidatePlan,
            updatedAt: now,
            meals: candidatePlan.meals.map((candidateMeal) => ({
              ...candidateMeal,
              items: candidateMeal.items.map((candidateItem) =>
                candidateItem.id === itemId ? { ...candidateItem, status: 'planned', locked: false } : candidateItem,
              ),
            })),
          }
        : candidatePlan,
    ),
    inventoryTransactions: [...data.inventoryTransactions, ...reverseTransactions],
  };
}
