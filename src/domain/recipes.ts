import { normalizeIngredientName } from './aliases';
import type { MealType, NutritionTag, Recipe, Unit } from './types';

export type RecipeFormInput = {
  name: string;
  recipeType: Recipe['recipeType'];
  mealTypes: MealType[];
  servings: number;
  ingredients: Array<{ name: string; quantity: number; unit: Unit; required: boolean }>;
  nutritionTags: NutritionTag[];
};

export function createUserRecipe(input: RecipeFormInput, now: string): Recipe {
  return {
    id: `recipe-${crypto.randomUUID()}`,
    name: input.name.trim(),
    recipeType: input.recipeType,
    source: 'userCreated',
    mealTypes: input.mealTypes,
    servings: input.servings,
    ingredients: input.ingredients.map((ingredient) => ({
      ...ingredient,
      canonicalName: normalizeIngredientName(ingredient.name),
    })),
    nutritionTags: input.nutritionTags,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateRecipeFromInput(recipe: Recipe, input: RecipeFormInput, now: string): Recipe {
  return {
    ...recipe,
    name: input.name.trim(),
    recipeType: input.recipeType,
    mealTypes: input.mealTypes,
    servings: input.servings,
    ingredients: input.ingredients.map((ingredient) => ({
      ...ingredient,
      canonicalName: normalizeIngredientName(ingredient.name),
    })),
    nutritionTags: input.nutritionTags,
    updatedAt: now,
  };
}

export function upsertRecipe(recipes: Recipe[], recipe: Recipe): Recipe[] {
  const exists = recipes.some((candidate) => candidate.id === recipe.id);
  return exists ? recipes.map((candidate) => (candidate.id === recipe.id ? recipe : candidate)) : [recipe, ...recipes];
}

export function deleteRecipe(recipes: Recipe[], id: string): Recipe[] {
  return recipes.filter((recipe) => recipe.id !== id);
}
