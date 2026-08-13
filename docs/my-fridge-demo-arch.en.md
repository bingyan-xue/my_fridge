# My Fridge Demo architecture

> Maintenance rule: this file is the English companion to `docs/my-fridge-demo-arch.md`. The Chinese version is the source of truth. Any future architecture change must update both files; if the two versions disagree, follow the Chinese version.

## 1. Background and goal

My Fridge Demo is a mobile first local PWA. It tests one core idea: after a user records the food they have at home, the system can use inventory, shelf life, and simple nutrition rules to generate meal plans for the current day.

The demo serves a single user and runs locally first. It does not aim to cover the full product. It only needs to prove this loop:

1. The user enters ingredients through a form.
2. The system estimates expiration dates from default shelf life rules.
3. The user can randomly generate breakfast, lunch, or dinner.
4. The user can also manually select an existing recipe and add it to a meal on the Today page.
5. Generated or manually added results are only plans. They do not deduct inventory.
6. The system rechecks inventory before confirmation and deducts inventory only if enough inventory is available.
7. If the user cancels that confirmation, the system restores the deducted inventory.
8. The user can export and import local data for backup and device transfer.

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

Handles meal generation and planning:

- Generate by meal type
- Filter infeasible items
- Rule based scoring
- Weighted random selection
- Convert a selected recipe into a planned meal item
- Check inventory availability for a planned meal item
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

The Today page adds a `RecipePicker` style component or an equivalent component for manual recipe selection. It handles search, filters, and selection. It does not mutate inventory directly.

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

Random generation and manual recipe selection should use the same helper to create `PlannedMealItem` objects, so inventory usage is calculated in one place.

When a manually added recipe has insufficient inventory, the item may still enter the plan, but `warnings` must record missing ingredients, insufficient quantity, or units that need confirmation. The warning does not block saving the plan, but it blocks later inventory deduction.

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

### 6.4 Manually add a recipe to a meal

1. The user clicks “Add recipe” on breakfast, lunch, or dinner on the Today page.
2. The UI opens a recipe picker.
3. The user can search by recipe name.
4. The user can filter by meal type, defaulting to the current meal type.
5. The user can filter by nutrition tags. Tag order is `carb`, `protein`, `fat` first, then `fiber`, `vegetable`, `fruit`, and `dairy`.
6. The system calculates inventory availability for recipes in the list.
7. Recipes with enough inventory appear normally.
8. Recipes with missing ingredients, insufficient quantity, or units that cannot be confirmed automatically may still appear and may still be added, but they must show warnings.
9. After the user chooses a recipe, the system converts it into a `PlannedMealItem` and appends it to the current meal’s `items`.
10. Manual addition only saves a plan. It does not deduct inventory.

Manual addition uses the same `plannedConsumption` calculation as random generation. The difference is that random generation filters out infeasible candidates, while manual addition allows infeasible candidates into the plan with warnings.

### 6.5 Confirm meal item

1. The user confirms a planned meal item.
2. The system rechecks `plannedConsumption` against the latest inventory.
3. If inventory is insufficient, an ingredient was deleted, or units need confirmation, the system does not deduct inventory and shows an error.
4. If inventory is sufficient, the system deducts inventory from `plannedConsumption`.
5. The system writes an `InventoryTransaction`.
6. The item status becomes `completed`.
7. The item is locked and cannot be replaced by random generation.

### 6.6 Cancel confirmation

1. The user cancels a confirmed item.
2. The system confirms that the item has an existing deduction transaction.
3. The system restores inventory from the original deduction record.
4. The system writes a reverse `InventoryTransaction`.
5. The item status returns to `planned`.
6. The item is unlocked and can be replaced by random generation.

### 6.7 Manually edit inventory

1. The user edits inventory quantity.
2. The system directly updates the current quantity.
3. The system records `manualAdjustment`.
4. The system does not recalculate historical deductions.

### 6.8 Export data

1. The user opens Settings.
2. The user clicks export data.
3. The system serializes `AppData` as JSON.
4. The browser downloads a file, for example `my-fridge-backup-2026-07-27.json`.

### 6.9 Import data

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

Random generation candidates must satisfy:

- Meal type matches.
- Required ingredients exist.
- Required ingredient quantities are enough, or unit mismatch can be flagged for confirmation.
- Expired ingredients are excluded by default.
- Confirmed items cannot be overwritten.

Seasonings are not inventory constraints.

Manual recipe addition does not use the same hard filter. During manual addition:

- Recipes that do not match the current meal type are hidden by default, but the user may switch the filter to another meal type or all meal types.
- Recipes with missing ingredients, insufficient quantity, or units that cannot be confirmed automatically can still be added to the plan.
- Insufficiency details must be written to `warnings` and shown in the UI.
- When the user later confirms deduction, the system must validate again. If validation fails, it must not write inventory changes or transaction records.

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

### 7.8 Manual recipe picker filters

The manual picker runs on the Today page. It is not the global recipe management page.

Filter dimensions:

- Search text: matches recipe name.
- Meal type: defaults to the current meal type and can switch to breakfast, lunch, dinner, or all.
- Nutrition tags: supports multi-select.

Nutrition tags use this fixed display order:

1. `carb`
2. `protein`
3. `fat`
4. `fiber`
5. `vegetable`
6. `fruit`
7. `dairy`

This order reflects the demo’s lightweight nutrition focus: users should quickly see staple foods, protein, and fat first, then secondary tags.

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

### 9.4 Manual recipe addition has insufficient inventory

When manually adding a recipe, the app may allow the recipe into the plan but must show warnings for:

- Missing ingredients
- Insufficient quantity
- Units that need confirmation

When the user confirms the meal item, if the problem still exists, the system must block confirmation, avoid inventory deduction, and avoid writing an `InventoryTransaction`.

### 9.5 Meal item confirmation failed

Confirmation failure types:

- Inventory quantity is insufficient
- An ingredient was deleted
- Units cannot be deducted automatically, and the user needs to adjust inventory or recipe units first

On failure, the item stays `planned` and inventory remains unchanged.

### 9.6 Import failed

Error types:

- File is not JSON
- `schemaVersion` is unsupported
- Required fields are missing
- User canceled import

Failed import must not overwrite current data.

### 9.7 Import overwrite confirmation

Before import, show:

```text
导入会覆盖当前本地数据。是否继续？
```

### 9.8 Expiring soon boundary

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
- Manual recipe addition appends to the selected meal instead of overwriting existing items
- Manually added recipes with insufficient inventory keep warnings
- Meal items with insufficient inventory cannot be confirmed or deducted
- The manual recipe picker supports meal type filtering, nutrition tag filtering, and search
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
