export type Unit = '个' | '根' | '把' | 'g' | 'kg' | 'ml' | 'L' | '袋' | '盒' | '包' | '瓶' | '斤';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'any';
export type NutritionTag = 'carb' | 'fat' | 'fiber' | 'protein' | 'vegetable' | 'fruit' | 'dairy';
export type RecipeType = 'dish' | 'staple' | 'readyToEat' | 'combo';
export type ExpiryStatus = 'normal' | 'expiringSoon' | 'expired' | 'unknown';
export type IngredientCategoryId = string;

export type IngredientItem = {
  id: string;
  name: string;
  canonicalName: string;
  category: IngredientCategoryId;
  quantity: number;
  unit: Unit;
  storageLocation: 'fridge' | 'freezer' | 'pantry' | 'other';
  addedAt: string;
  expiryDate?: string;
  estimatedExpiryDate?: string;
  expirySource: 'user' | 'default';
  nutritionTags: NutritionTag[];
  updatedAt: string;
};

export type IngredientCategory = {
  id: IngredientCategoryId;
  name: string;
  defaultShelfLifeDays: number;
  defaultNutritionTags: NutritionTag[];
};

export type RecipeIngredient = {
  name: string;
  canonicalName: string;
  quantity: number;
  unit: Unit;
  required: boolean;
};

export type Recipe = {
  id: string;
  name: string;
  recipeType: RecipeType;
  source: 'builtIn' | 'userCreated';
  mealTypes: MealType[];
  servings: number;
  ingredients: RecipeIngredient[];
  nutritionTags: NutritionTag[];
  optionalMeta?: {
    difficulty?: 'easy' | 'medium' | 'hard';
    estimatedMinutes?: number;
    cookware?: string[];
    steps?: string[];
  };
  createdAt: string;
  updatedAt: string;
};

export type ConsumptionItem = {
  ingredientItemId: string;
  ingredientName: string;
  canonicalName: string;
  quantity: number;
  unit: Unit;
  requiresConfirmation: boolean;
};

export type PlannedMealItem = {
  id: string;
  recipeSnapshot: Recipe;
  plannedServings: number;
  plannedConsumption: ConsumptionItem[];
  status: 'planned' | 'completed';
  reasons: string[];
  warnings: string[];
  locked: boolean;
};

export type Meal = {
  mealType: 'breakfast' | 'lunch' | 'dinner';
  items: PlannedMealItem[];
};

export type MealPlan = {
  id: string;
  date: string;
  meals: Meal[];
  createdAt: string;
  updatedAt: string;
};

export type InventoryTransaction = {
  id: string;
  ingredientItemId: string;
  mealPlanId?: string;
  plannedMealItemId?: string;
  quantityDelta: number;
  unit: Unit;
  reason: 'mealCompleted' | 'mealCompletionUndone' | 'manualAdjustment';
  relatedTransactionId?: string;
  createdAt: string;
};

export type UserSettings = {
  updatedAt: string;
  deletedBuiltInRecipeIds?: string[];
};

export type AppData = {
  schemaVersion: 1;
  ingredients: IngredientItem[];
  recipes: Recipe[];
  mealPlans: MealPlan[];
  inventoryTransactions: InventoryTransaction[];
  settings: UserSettings;
};
