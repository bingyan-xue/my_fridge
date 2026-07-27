# My Fridge Demo architecture

> Maintenance rule: this file is the English companion to `docs/my-fridge-demo-arch.md`. The Chinese version is the source of truth. Any future architecture change must update both files; if the two versions disagree, follow the Chinese version.

## 1. Background and goal

My Fridge Demo is a mobile first local PWA. It tests one core idea: after a user records the food they have at home, the system can use inventory, shelf life, and simple nutrition rules to generate meal plans for the current day.

The demo serves a single user and runs locally first. It does not aim to cover the full product. It only needs to prove this loop:

1. The user enters ingredients through a form.
2. The system estimates expiration dates from default shelf life rules.
3. The user can randomly generate breakfast, lunch, or dinner.
4. A generated result is only a plan. It does not deduct inventory.
5. The system deducts inventory only after the user confirms that a meal item was made.
6. If the user cancels that confirmation, the system restores the deducted inventory.
7. The user can export and import local data for backup and device transfer.

## 2. Non goals

The demo does not include:

- Accounts
- Cloud sync
- WeChat Mini Program
- Native mobile app
- AI voice or natural language ingredient entry
- AI generated recipes
- Photo based ingredient recognition
- Receipt scanning
- Shopping lists
- Exact calorie calculation
- Exact grams of carbs, fat, fiber, or protein
- Seasoning inventory management
- Complex steps, time, difficulty, or cookware systems
- Multi person household collaboration

These features can be revisited for the full product. The demo only keeps the extension points that are needed later.

## 3. Technical decisions

### 3.1 Tech stack

- React: pages and interactions.
- TypeScript: data models and core business logic.
- Vite: local development and bundling.
- localStorage: demo data persistence.

Core logic should be written as plain TypeScript modules where possible, instead of being tied to React components. This keeps inventory, recipes, the planner, and data models easier to reuse in a future native app or WeChat Mini Program.

### 3.2 PWA strategy

The demo uses a mobile first Web App shape.

- `manifest` is required. It defines the app name, icons, theme color, and home screen install metadata.
- `service worker` is optional for the demo. The first priority is to make the local web app run reliably. Offline caching can be added later.

### 3.3 Migration strategy

The current version does not build a native app or mini program, but the architecture should avoid locking core logic inside browser UI code.

Future paths:

- Native app: prefer wrapping the PWA with Capacitor.
- WeChat Mini Program: build a separate mini program UI and reuse plain TypeScript business logic where possible.
- Cloud sync: keep the core objects stable so localStorage data can later move to a backend database.

## 4. System modules

### 4.1 inventory

Handles ingredient inventory:

- Create, read, update, and delete ingredients
- Default shelf life calculation
- Expiration status
- Inventory deduction
- Inventory restoration
- Manual inventory edits

It does not handle recipe matching, recommendation reasons, or nutrition checks.

### 4.2 recipes

Handles recipes and meal items:

- Built in recipes
- User created recipes
- Basic meal items
- Ready to eat items
- Breakfast combinations

In the demo, `Recipe` is a broad concept. It can represent:

- `dish`: a dish, such as tomato scrambled eggs
- `staple`: a staple, such as rice
- `readyToEat`: a ready to eat item, such as banana or milk
- `combo`: a meal combination, such as milk + egg + bread

### 4.3 planner

Handles meal generation:

- Generate by meal type
- Filter infeasible items
- Rule based scoring
- Weighted random selection
- Same day repetition control
- Basic meal fallback
- Recommendation reasons
- Lightweight nutrition hints

The planner only produces plans. It does not directly mutate real inventory.

### 4.4 aliases

Normalizes ingredient aliases to improve matching between inventory and recipes.

Examples:

- 番茄 -> 西红柿
- 马铃薯 -> 土豆
- 青菜 -> 叶菜

### 4.5 storage

Handles local data:

- localStorage reads and writes
- `schemaVersion` management
- Sample data initialization
- Data export
- Data import
- Basic data validation

### 4.6 settings

Demo settings stay small:

- Local data notice
- Restore sample data
- Export data
- Import data

Time, difficulty, and cookware may matter in the full product, but the demo UI does not expose them and the generator does not depend on them.

### 4.7 ui

Handles pages:

- Today
- Inventory
- Recipes
- Settings

The UI calls core modules instead of implementing complex business rules directly.

## 5. Data models

### 5.1 AppData

```ts
type AppData = {
  schemaVersion: 1;
  ingredients: IngredientItem[];
  recipes: Recipe[];
  mealPlans: MealPlan[];
  inventoryTransactions: InventoryTransaction[];
  settings: UserSettings;
};
```

### 5.2 IngredientItem

```ts
type IngredientItem = {
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
```

Rules:

- If the user provides `expiryDate`, use that date.
- If the user leaves it blank, estimate `estimatedExpiryDate` from the category default shelf life.
- The effective expiration date is `expiryDate ?? estimatedExpiryDate`.

### 5.3 IngredientCategory

```ts
type IngredientCategory = {
  id: IngredientCategoryId;
  name: string;
  defaultShelfLifeDays: number;
  defaultNutritionTags: NutritionTag[];
};
```

Default shelf life reduces data entry work. For example, leafy greens can default to 7 days and rice or flour can default to 365 days. The implementation phase will define the concrete sample table.

### 5.4 Unit

```ts
type Unit =
  | '个'
  | '根'
  | '把'
  | 'g'
  | 'kg'
  | 'ml'
  | 'L'
  | '袋'
  | '盒'
  | '包'
  | '瓶'
  | '斤';
```

The unit selected during ingredient entry is the primary unit for that inventory item. Display, deduction, and zero quantity checks all use the primary unit.

Automatic conversion only supports deterministic conversions:

- `kg <-> g`
- `L <-> ml`
- `斤 <-> g`, using `1 斤 = 500g`

Other units are not estimated automatically. If units do not match, the meal item may still be a candidate, but the user must be warned before confirming deduction.

### 5.5 Recipe

```ts
type Recipe = {
  id: string;
  name: string;
  recipeType: 'dish' | 'staple' | 'readyToEat' | 'combo';
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
```

User created recipes are required for the demo. Required fields:

- Name
- Type
- Meal types
- Default servings, with 1 serving as the default
- Ingredient list
- Quantity for each ingredient
- Unit for each ingredient
- Whether each ingredient is required, defaulting to required

Optional fields:

- Carbs
- Fat
- Fiber
- Protein

Steps, time, difficulty, and cookware are kept as optional extension fields. The demo UI does not show them, and the planner does not depend on them.

### 5.6 RecipeIngredient

```ts
type RecipeIngredient = {
  name: string;
  canonicalName: string;
  quantity: number;
  unit: Unit;
  required: boolean;
};
```

### 5.7 MealPlan

```ts
type MealPlan = {
  id: string;
  date: string;
  meals: Meal[];
  createdAt: string;
  updatedAt: string;
};
```

Dates use the user's local time. The user can manually view and edit yesterday's menu, but random generation only applies to the current day.

### 5.8 Meal

```ts
type Meal = {
  mealType: 'breakfast' | 'lunch' | 'dinner';
  items: PlannedMealItem[];
};
```

A meal is a combination and may contain multiple items. The demo generates one meal at a time rather than forcing a full day generation.

### 5.9 PlannedMealItem

```ts
type PlannedMealItem = {
  id: string;
  recipeSnapshot: Recipe;
  plannedServings: number;
  plannedConsumption: ConsumptionItem[];
  status: 'planned' | 'completed';
  reasons: string[];
  warnings: string[];
  locked: boolean;
};
```

The planner stores a recipe snapshot at generation time. A confirmed item has `status = 'completed'` and `locked = true`, so it cannot be replaced by random generation. Unconfirmed items can be replaced.

### 5.10 ConsumptionItem

```ts
type ConsumptionItem = {
  ingredientItemId: string;
  ingredientName: string;
  canonicalName: string;
  quantity: number;
  unit: Unit;
  requiresConfirmation: boolean;
};
```

### 5.11 InventoryTransaction

```ts
type InventoryTransaction = {
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
```

Confirming a meal item writes a negative deduction transaction. Canceling confirmation writes a positive restoration transaction. Manual inventory edits directly change the current quantity and record `manualAdjustment`; they do not rewrite history.

### 5.12 NutritionTag

```ts
type NutritionTag =
  | 'carb'
  | 'fat'
  | 'fiber'
  | 'protein'
  | 'vegetable'
  | 'fruit'
  | 'dairy';
```

The demo only performs lightweight checks, such as whether a meal has protein, vegetables, or staples. The full product can add exact nutrition fields without changing the existing model shape.

## 6. Core flows

### 6.1 Add ingredient

1. The user opens the Inventory page.
2. The user adds an ingredient through a form.
3. The user enters name, category, quantity, unit, and location.
4. The user may enter an expiration date.
5. If the expiration date is blank, the system estimates it from the category default shelf life.
6. The system normalizes ingredient aliases.
7. The system saves data to localStorage.

The demo does not include AI natural language entry or complex quick parsing.

### 6.2 Create recipe

1. The user opens the Recipes page.
2. The user creates a recipe.
3. The user enters name, type, meal types, default servings, and required ingredients.
4. The user may select lightweight nutrition tags.
5. After saving, the recipe participates in future generation.

### 6.3 Randomly generate a meal

1. The user chooses breakfast, lunch, or dinner on the Today page.
2. The system reads today's generated and confirmed items.
3. The system reads current inventory.
4. The system filters candidates for the selected meal type.
5. The system removes infeasible candidates.
6. The system scores the remaining candidates.
7. The system randomly selects from high scoring candidates.
8. The system saves the result as today's plan without deducting inventory.

Breakfast, lunch, and dinner use different meal type tags. Breakfast items are not recommended for lunch by default unless they are marked as any meal or lunch compatible.

### 6.4 Confirm meal item

1. The user confirms a planned meal item.
2. The system deducts inventory from `plannedConsumption`.
3. The system writes an `InventoryTransaction`.
4. The item status becomes `completed`.
5. The item is locked and cannot be replaced by random generation.

### 6.5 Cancel confirmation

1. The user cancels a confirmed item.
2. The system confirms that the item has an existing deduction transaction.
3. The system restores inventory from the original deduction record.
4. The system writes a reverse `InventoryTransaction`.
5. The item status returns to `planned`.
6. The item is unlocked and can be replaced by random generation.

### 6.6 Manually edit inventory

1. The user edits inventory quantity.
2. The system directly updates the current quantity.
3. The system records `manualAdjustment`.
4. The system does not recalculate historical deductions.

### 6.7 Export data

1. The user opens Settings.
2. The user clicks export data.
3. The system serializes `AppData` as JSON.
4. The browser downloads a file, for example `my-fridge-backup-2026-07-27.json`.

### 6.8 Import data

1. The user opens Settings.
2. The user clicks import data.
3. The user selects a JSON file.
4. The system warns that import will overwrite current local data.
5. After user confirmation, the system parses the JSON.
6. The system validates `schemaVersion` and required fields.
7. If validation succeeds, the system overwrites localStorage.
8. If validation fails, the system shows an error and leaves current data unchanged.

Import does not merge data.

## 7. Planner

### 7.1 Strategy

The planner uses:

```text
filtering + rule based scoring + weighted random selection
```

The result must be explainable, but the UI does not show detailed scores.

### 7.2 Filtering rules

Candidates must satisfy:

- Meal type matches.
- Required ingredients exist.
- Required ingredient quantities are enough, or unit mismatch can be flagged for confirmation.
- Expired ingredients are excluded by default.
- Confirmed items cannot be overwritten.

Seasonings are not inventory constraints.

### 7.3 Scoring rules

Scoring considers:

- Ingredients expiring within the next 2 days get high priority.
- Ingredients without user provided expiration dates use default shelf life estimates.
- Similar ingredients follow FIFO where possible.
- The closer an ingredient is to expiration, the higher its priority.
- The same meal item should not repeat on the same day if avoidable.
- The same ingredient type should not repeat too much on the same day if avoidable.
- Items that add missing protein, vegetables, or staples get a score boost.

### 7.4 Weighted random selection

The system does not always choose the highest scoring item. It randomly selects from high scoring candidates, keeping variety while still favoring items that are expiring soon, feasible, and structurally better.

### 7.5 Basic meal fallback

If complete dishes are not available, the system can generate basic meal items:

- Rice
- Congee
- Noodles
- Boiled egg
- Milk
- Bread
- Banana
- Apple
- Yogurt

Basic meal items also use the `Recipe` model.

### 7.6 Insufficiency checks

The demo does not use calories to decide insufficiency.

There are two kinds of insufficiency:

- Feasibility insufficiency: there are no feasible candidates.
- Structure insufficiency: the system generated items, but the meal lacks protein, vegetables, or staples.

Structure insufficiency does not block generation. It only shows a hint.

If one meal has no feasible candidates, the system can keep the rest of the day's plan and explain why that meal could not be generated. The demo does not require a complete three meal day to be generated at once.

Example hints:

- Inventory is limited. This meal lacks protein.
- This meal is light on vegetables.
- Only basic meal items are available.

### 7.7 Recommendation reasons

Each meal item shows at most 1-2 short reasons.

Examples:

- Uses tofu that expires soon.
- Adds protein.
- Inventory is limited, so a basic meal was generated.

Detailed scores are not shown.

## 8. Local storage and migration

The demo uses localStorage.

Data key:

```text
my-fridge-app-data
```

The data structure must include:

```ts
schemaVersion: 1
```

When the schema changes, migration functions upgrade stored data.

The demo must support JSON export and import. Import overwrites current data and does not merge. The user must see an overwrite warning before import.

Import must parse and validate the file before writing to localStorage. Parse failures, unsupported versions, and missing required fields must leave the current data unchanged.

Exported data includes:

```ts
type ExportedAppData = AppData & {
  exportedAt: string;
};
```

## 9. Errors and empty states

### 9.1 Empty inventory

Ask the user to add ingredients first.

### 9.2 Empty recipes

Ask the user to use sample recipes or create a recipe.

### 9.3 Meal cannot be generated

Show one of these fixed failure reasons:

- Missing ingredient
- Quantity too low
- Unit needs confirmation
- Meal type mismatch
- Not enough recipes

### 9.4 Import failed

Error types:

- File is not JSON
- `schemaVersion` is unsupported
- Required fields are missing
- User canceled import

Failed import must not overwrite current data.

### 9.5 Import overwrite confirmation

Before import, show:

```text
导入会覆盖当前本地数据。是否继续？
```

### 9.6 Expiring soon boundary

Expiring soon is calculated from the user's local date. If the effective expiry date falls on today, tomorrow, or the day after tomorrow, the ingredient is treated as expiring within the next 2 days and receives high priority.

## 10. Sample data

The demo must include:

- 15-20 built in recipes or basic meal items
- 20-30 sample inventory ingredients
- 1 default settings set

Sample recipes should cover:

- Breakfast combinations
- Basic staples
- Ready to eat items
- Quick lunches
- Home style dinners
- Inventory clearing dishes

Sample inventory should cover:

- Ingredients expiring soon
- Short shelf life ingredients
- Long shelf life ingredients
- Different units
- Different nutrition tags

Settings should provide an entry point to restore sample data.

## 11. Testing strategy

Prioritize tests for plain TypeScript core logic.

Required tests:

- Default shelf life estimation
- Expired ingredients are excluded by default
- Ingredients expiring within 2 days get priority
- Alias matching
- Primary unit deduction
- `kg/g`, `L/ml`, and `斤/g` conversion
- Unit mismatch is marked as requiring confirmation
- Confirmed items cannot be overwritten by random generation
- Canceling confirmation restores inventory
- Same day repetition is avoided where possible
- Exported JSON includes full `AppData`
- Invalid import JSON does not overwrite existing data

UI can be verified manually for the demo.

## 12. Demo difficulty

For a first time software developer, this demo is moderately difficult, but it can be built in small stages.

The main difficulty is not the screens. It is the rules and state:

- Ingredient data must save correctly.
- Recipes and inventory must match.
- Random generation must stay reasonable.
- Confirm and cancel must deduct and restore inventory correctly.
- Import must not overwrite good data with bad data.

Recommended build order:

1. Static pages and sample data
2. Inventory form and localStorage
3. Recipe form
4. Simplest random generation
5. Scoring, expiration priority, and repetition control
6. Confirm deduction and cancel restoration
7. Import/export and PWA manifest

Each stage can be verified on its own. The demo does not need to be built all at once.

## 13. Preparation before implementation

The main architecture decisions are complete. Before implementation, prepare:

- Built in sample recipe list
- Default shelf life table
- Ingredient alias table
- Default nutrition tags
- UI visual style
