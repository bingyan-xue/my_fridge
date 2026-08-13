import { getExpiryStatus } from './expiry';
import { convertQuantity } from './units';
import type { IngredientItem, Meal, PlannedMealItem, Recipe } from './types';

export type GenerateMealInput = {
  mealType: 'breakfast' | 'lunch' | 'dinner';
  today: string;
  ingredients: IngredientItem[];
  recipes: Recipe[];
  existingMeal?: Meal;
};

export type GenerateMealResult =
  | { status: 'generated'; meal: Meal }
  | { status: 'failed'; reason: '缺食材' | '数量不足' | '单位需要确认' | '餐次不匹配' | '菜谱不足' };

type BuildPlannedMealItemOptions = {
  allowInsufficientInventory?: boolean;
};

function mealTypeMatches(recipe: Recipe, mealType: GenerateMealInput['mealType']): boolean {
  return recipe.mealTypes.includes(mealType) || recipe.mealTypes.includes('any');
}

function findInventoryIngredient(ingredients: IngredientItem[], canonicalName: string): IngredientItem | undefined {
  return ingredients.find((item) => item.canonicalName === canonicalName);
}

function scoreRecipe(recipe: Recipe, ingredients: IngredientItem[], today: string): { score: number; reasons: string[]; warnings: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const warnings: string[] = [];

  for (const recipeIngredient of recipe.ingredients.filter((item) => item.required)) {
    const inventoryItem = findInventoryIngredient(ingredients, recipeIngredient.canonicalName);
    if (!inventoryItem) {
      continue;
    }

    const status = getExpiryStatus(inventoryItem, today);
    if (status === 'expiringSoon') {
      score += 80;
      if (reasons.length < 2) {
        reasons.push(`用了快过期的${inventoryItem.name}`);
      }
    }
    if (inventoryItem.nutritionTags.includes('protein') && recipe.nutritionTags.includes('protein')) {
      score += 10;
    }
  }

  if (recipe.nutritionTags.includes('protein') && reasons.length < 2) {
    reasons.push('补了蛋白质');
  }
  if (recipe.recipeType === 'staple' && reasons.length < 2) {
    reasons.push('生成基础餐');
  }
  if (!recipe.nutritionTags.includes('protein')) {
    warnings.push('这餐蛋白质偏少');
  }
  if (!recipe.nutritionTags.includes('vegetable') && !recipe.nutritionTags.includes('fruit')) {
    warnings.push('这餐蔬果偏少');
  }

  return { score, reasons: reasons.slice(0, 2), warnings: warnings.slice(0, 2) };
}

function buildConsumption(recipe: Recipe, ingredients: IngredientItem[]) {
  return recipe.ingredients
    .filter((ingredient) => ingredient.required)
    .map((recipeIngredient) => {
      const inventoryItem = findInventoryIngredient(ingredients, recipeIngredient.canonicalName);
      if (!inventoryItem) {
        return null;
      }

      const converted = convertQuantity(recipeIngredient.quantity, recipeIngredient.unit, inventoryItem.unit);
      return {
        ingredientItemId: inventoryItem.id,
        ingredientName: inventoryItem.name,
        canonicalName: inventoryItem.canonicalName,
        quantity: converted ?? recipeIngredient.quantity,
        unit: converted === null ? recipeIngredient.unit : inventoryItem.unit,
        requiresConfirmation: converted === null,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

export function getRecipeInventoryWarnings(recipe: Recipe, ingredients: IngredientItem[], today: string): string[] {
  const warnings: string[] = [];

  for (const recipeIngredient of recipe.ingredients.filter((ingredient) => ingredient.required)) {
    const inventoryItem = findInventoryIngredient(ingredients, recipeIngredient.canonicalName);
    if (!inventoryItem || getExpiryStatus(inventoryItem, today) === 'expired') {
      warnings.push('missingIngredient');
      continue;
    }

    const convertedNeed = convertQuantity(recipeIngredient.quantity, recipeIngredient.unit, inventoryItem.unit);
    if (convertedNeed === null) {
      warnings.push('unitNeedsConfirmation');
      continue;
    }

    if (inventoryItem.quantity < convertedNeed) {
      warnings.push('insufficientQuantity');
    }
  }

  return [...new Set(warnings)];
}

export function buildPlannedMealItem(
  recipe: Recipe,
  ingredients: IngredientItem[],
  today: string,
  options: BuildPlannedMealItemOptions = {},
): PlannedMealItem | null {
  const inventoryWarnings = getRecipeInventoryWarnings(recipe, ingredients, today);
  if (inventoryWarnings.length > 0 && !options.allowInsufficientInventory) {
    return null;
  }

  const scored = scoreRecipe(recipe, ingredients, today);
  return {
    id: `planned-${crypto.randomUUID()}`,
    recipeSnapshot: recipe,
    plannedServings: 1,
    plannedConsumption: buildConsumption(recipe, ingredients),
    status: 'planned',
    reasons: scored.reasons,
    warnings: [...scored.warnings, ...inventoryWarnings].slice(0, 2),
    locked: false,
  };
}

function recipeIsFeasible(recipe: Recipe, ingredients: IngredientItem[], today: string): boolean {
  return recipe.ingredients
    .filter((ingredient) => ingredient.required)
    .every((recipeIngredient) => {
      const inventoryItem = findInventoryIngredient(ingredients, recipeIngredient.canonicalName);
      if (!inventoryItem || getExpiryStatus(inventoryItem, today) === 'expired') {
        return false;
      }

      const convertedNeed = convertQuantity(recipeIngredient.quantity, recipeIngredient.unit, inventoryItem.unit);
      if (convertedNeed === null) {
        return true;
      }
      return inventoryItem.quantity >= convertedNeed;
    });
}

export function generateMeal(input: GenerateMealInput): GenerateMealResult {
  const lockedItems = input.existingMeal?.items.filter((item) => item.locked) ?? [];
  if (lockedItems.length > 0) {
    return { status: 'generated', meal: { mealType: input.mealType, items: lockedItems } };
  }

  if (input.recipes.length === 0) {
    return { status: 'failed', reason: '菜谱不足' };
  }

  const mealTypeCandidates = input.recipes.filter((recipe) => mealTypeMatches(recipe, input.mealType));
  if (mealTypeCandidates.length === 0) {
    return { status: 'failed', reason: '餐次不匹配' };
  }

  const candidates = mealTypeCandidates
    .filter((recipe) => recipeIsFeasible(recipe, input.ingredients, input.today))
    .map((recipe) => ({ recipe, ...scoreRecipe(recipe, input.ingredients, input.today) }))
    .sort((a, b) => b.score - a.score);

  if (candidates.length === 0) {
    return { status: 'failed', reason: '缺食材' };
  }

  const topScore = candidates[0].score;
  const topCandidates = candidates.filter((candidate) => candidate.score >= topScore - 10);
  const selected = topCandidates[Math.floor(Math.random() * topCandidates.length)];
  const item = buildPlannedMealItem(selected.recipe, input.ingredients, input.today);
  if (!item) {
    return { status: 'failed', reason: '缺食材' };
  }

  return { status: 'generated', meal: { mealType: input.mealType, items: [item] } };
}
