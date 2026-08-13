# My Fridge Demo PRD

## 0. Document Language Rules

### 0.1 PRD Maintenance

This English PRD follows the Chinese PRD.

The Chinese PRD is the source of truth for product decisions, scope, priorities, and acceptance criteria. This English version keeps the same meaning for design, development, naming, UI copy, GitHub documentation, and international collaboration.

### 0.2 Recommended Documentation Structure

During the Demo stage, documentation should stay simple:

- Chinese PRD as the primary working document.
- English PRD as a synchronized version for design, development, naming, and public documentation.
- When the Chinese PRD changes, the English PRD should be updated accordingly.
- Once the Demo PRD is stable, the English version can be edited into a public GitHub document.

### 0.3 Product Language Strategy

The product must support English and Simplified Chinese. Users can switch the app language inside the product.

Implementation order for the Demo:

1. Build the English UI first.
2. Keep user-facing copy in a translatable structure from the first version.
3. Add the Simplified Chinese UI after the English version works.
4. Add new UI copy to translation resources instead of hardcoding it in components.

## 1. Product Overview and Goals

### 1.1 Product Positioning

My Fridge Demo is a mobile-first local web app / PWA prototype. It is an inventory-driven cooking assistant.

After users record what ingredients they have at home, the system generates breakfast, lunch, and dinner from current inventory, expiration dates, cooking constraints, and lightweight health rules. It prioritizes ingredients already at home, especially ingredients close to expiration.

The Demo is not a full kitchen management system. It tests one idea: if meal recommendations start from “what I already have at home,” users may decide what to cook faster and use more of their existing ingredients.

### 1.2 Product Form

- Stage 1 product form: mobile-first local web app / PWA.
- Data model: single user, local storage.
- Main usage context: phone use in the kitchen, after grocery shopping, before cooking, or in front of the fridge.
- Language support: English and Simplified Chinese, with user-controlled language switching.
- Long-term direction: after the Demo works, the product can move toward a native mobile app.

### 1.3 Demo Goals

- Complete the main loop: add ingredients, generate meals, swap a meal, mark a meal as cooked, and deduct inventory.
- Validate whether inventory-driven meal generation reduces everyday cooking decisions.
- Validate whether users can directly add an existing recipe to a meal when they already know what they want to eat, while keeping the inventory deduction loop intact.
- Validate whether prioritizing soon-to-expire ingredients helps reduce food waste.
- Validate whether users are willing to maintain a lightweight home inventory.
- Leave room for future mobile app features such as sync, recognition, shopping support, and household collaboration.

### 1.4 Product Priorities

1. Everyday home cooking.
2. Eating reasonably well while using existing inventory.
3. Random meal generation when users do not know what to eat.
4. Household meal planning.

The Demo covers the first three priorities at a basic level. It does not include household planning.

## 2. Target Users and Use Cases

### 2.1 Target Users

The primary users are people who cook at home and need a simple way to manage fridge and pantry inventory. This includes individual users and the person in a household who usually plans meals.

Typical characteristics:

- They often have leftover or unused ingredients at home.
- They forget what is already in the fridge or pantry after grocery shopping.
- They often struggle with deciding what to cook.
- They want to reduce food waste.
- They care about eating reasonably well but do not want to track calories, protein, fat, or other detailed nutrition data.
- They mainly use the product on a phone, often in the kitchen, grocery store, market, or in front of the fridge.

### 2.2 Use Cases

#### Use Case 1: Record Inventory After Shopping

After grocery shopping, the user opens My Fridge and adds new ingredients through quick entry or a structured form. They can record quantity, unit, storage location, and expiration date.

#### Use Case 2: Generate Today’s Meals Before Cooking

The user opens the Today page, and the system generates breakfast, lunch, and dinner based on current inventory.

#### Use Case 3: Manually Plan One Meal Before Cooking

When the user already knows what they want to eat, they can directly select an existing recipe and add it to breakfast, lunch, or dinner on the Today page. They can filter recipes by meal type, nutrition tags, and search text. Recipes with insufficient inventory can still be added to the plan, but the app must show missing ingredient or insufficient quantity warnings.

#### Use Case 4: Swap One Meal

If one suggested meal does not fit, the user can swap only that meal while keeping the rest unchanged.

#### Use Case 5: Deduct Inventory After Cooking

After cooking a meal, the user marks it as cooked. The system deducts the expected ingredient usage from inventory.

#### Use Case 6: Handle Soon-to-Expire Ingredients

The system identifies ingredients close to expiration and prioritizes them during meal generation.

## 3. MVP Scope and Non-Goals

### 3.1 MVP Scope

The Demo includes:

- Four main pages: Today, Inventory, Recipes, and Settings.
- Mobile-first layout and bottom navigation.
- English and Simplified Chinese language switching.
- Manual quick ingredient entry.
- Structured ingredient form entry.
- Ingredient name, quantity, unit, storage location, and expiration date.
- Built-in structured home-style recipes.
- At least 40 built-in recipes in Demo V1 to support a reasonable generation success rate.
- User-created recipes.
- Today’s breakfast, lunch, and dinner generated from existing inventory.
- Manual recipe selection on the Today page to add an existing recipe to a specific meal.
- A meal may contain multiple meal items, such as a staple, a protein dish, and a vegetable dish.
- Manual recipe selection supports search, meal type filtering, and nutrition tag filtering.
- Per-meal “swap” action.
- Marking a meal as cooked and deducting inventory.
- Lightweight health rule prompts.
- Local data persistence.

### 3.2 MVP Non-Goals

The Demo does not include:

- Cloud accounts.
- Cross-device sync.
- Multi-user or household member preferences.
- Photo-based ingredient recognition.
- Receipt recognition.
- AI-generated new recipes.
- Shopping lists.
- “Buy missing ingredients” recommendations.
- Strict calorie calculation.
- Macro nutrition calculation.
- Social features.
- External recipe platform integrations.

### 3.3 Compatibility Principles for a Future Mobile App

Although the Demo is a PWA, the design should leave room for a future native mobile app:

- The page structure should work well with mobile bottom navigation.
- Frequent actions should be comfortable on a phone and reasonably usable with one hand.
- Data objects should include fields such as `id`, `createdAt`, and `updatedAt` to support future sync.
- UI copy should use a translatable structure from the beginning.
- Local storage implementation details should not be exposed to users.
- The Demo should not introduce account, household, recognition, or shopping flows that belong to later versions.

## 4. Core User Journeys

### 4.1 First-Time Use

1. The user opens the app.
2. The system shows an empty inventory state and prompts the user to add ingredients.
3. The user adds ingredients through quick entry or a structured form.
4. The user may configure basic cooking constraints and diet goals in Settings.
5. The user opens the Today page.
6. The system generates meals for the day.
7. The user accepts the meal plan, swaps individual meals, or manually adds an existing recipe to a meal.

### 4.2 Daily Cooking

1. The user opens the Today page.
2. The user reviews breakfast, lunch, and dinner.
3. The user taps “Swap” for any meal that does not fit, or taps “Add recipe” to manually add a recipe they want to eat.
4. After cooking a meal item, the user taps “Cooked.”
5. The system shows the expected ingredient usage.
6. The user confirms, and inventory is deducted.
7. The meal item status updates to completed.

### 4.3 Inventory Maintenance

1. The user opens the Inventory page.
2. The user reviews all ingredients and their expiration status.
3. The user adds, edits, or deletes ingredients.
4. The user handles soon-to-expire or expired ingredients.
5. The user returns to Today to regenerate or update the meal plan.

### 4.4 User-Created Recipes

1. The user opens the Recipes page.
2. The user creates a frequently cooked recipe.
3. The user enters recipe name, meal type, ingredients, quantities, cooking time, difficulty, cookware, and tags.
4. After saving, the recipe becomes part of the generation candidate pool.

## 5. Functional Requirements

## 5.1 Today Module

### Module Goal

Help users see what to eat today, randomly swap meals, manually add recipes, and confirm ingredient usage.

### Requirements

#### Today’s Three Meals

The page displays breakfast, lunch, and dinner.

Each meal may contain one or more meal items. Each meal item shows:

- Recipe name.
- Meal type.
- Estimated cooking time.
- Difficulty.
- Main inventory ingredients used.
- Whether soon-to-expire ingredients are used.
- Health prompts.
- Status: planned, cooked, or skipped.

#### Multiple Meal Items in One Meal

A meal is not forced to equal one recipe. Lunch and dinner may contain multiple items, such as “rice + tomato eggs + greens.” Breakfast may also contain multiple basic items or combination items.

In Demo V1, each meal item is confirmed and canceled independently. Confirming one item deducts only that item’s ingredients. Canceling that item restores only the deduction created by that item.

#### Generate Today’s Meals

The user can generate today’s meal plan.

Generation requirements:

- Use only existing inventory.
- Do not recommend recipes that are missing required ingredients.
- Prioritize soon-to-expire ingredients.
- Try to satisfy cooking constraints.
- Try to maintain a rough balance of staple foods, protein, and vegetables.
- Choose randomly from feasible candidates so the result does not feel fixed.

#### Manually Add a Recipe to a Meal

The user can tap “Add recipe” on breakfast, lunch, or dinner and manually choose an existing recipe to add to that meal.

Picker requirements:

- Use a modal or equivalent focused interface so the Today page does not become too long.
- Support recipe name search.
- Support meal type filtering.
- Support nutrition tag filtering.
- Nutrition tags should be ordered with carbs, protein, and fat first. Fiber, vegetables, fruit, dairy, and other tags may appear after them.
- Recipe results should show main ingredients and inventory availability hints.

Inventory handling:

- Recipes with enough inventory can be added normally.
- Recipes with missing ingredients, insufficient quantity, or units that cannot be confirmed automatically may still be added to the plan.
- Insufficient recipes must show warnings in the picker and after they are added to the meal.
- Adding a recipe to the plan does not deduct inventory.
- When the user taps “Cooked,” if inventory is still insufficient, the app must block confirmation and tell the user to update inventory first.

#### Swap One Meal

The user can tap “Swap” on any meal.

Requirements:

- Only the selected meal changes.
- Other meals remain unchanged.
- The new meal must still satisfy inventory and settings constraints.
- The system should avoid returning the same recipe when possible.
- If no replacement is available, explain why.

#### Mark as Cooked and Deduct Inventory

When the user taps “Cooked,” the system shows an expected deduction summary.

The summary includes:

- Ingredient name.
- Deduction quantity.
- Current inventory.
- Remaining inventory after deduction.

After user confirmation:

- Inventory is deducted.
- Meal status is updated.
- If inventory is insufficient, confirmation is blocked, inventory is not deducted, and the user is prompted to update inventory first.
- If an ingredient reaches zero, it may be marked as used up.

## 5.2 Inventory Module

### Module Goal

Help users quickly record and maintain ingredients at home.

### Requirements

#### Quick Entry

Users can add ingredients with simple text.

Examples:

- Eggs 6
- Tomatoes 3
- Beef 500g
- Milk 1 bottle expires tomorrow

The first version only needs basic parsing. Unrecognized information can stay empty and be edited later.

#### Structured Form Entry

Fields include:

- Ingredient name.
- Category.
- Quantity.
- Unit.
- Storage location.
- Expiration date.
- Notes.

#### Unit Handling Rules

Demo V1 does not need complex unit conversion, but it should support basic unit normalization and same-type unit matching.

Requirements:

- Support common weight units: g, kg.
- Support common volume units: ml, L.
- Support common count/package units: item, piece, egg, bottle, bag, box.
- Same-type units may use basic conversion, such as kg to g and L to ml.
- Different unit types should not be converted automatically. For example, “1 tomato” should not be automatically converted into grams.
- When recipe units and inventory units cannot be matched, the system should ask the user to confirm or adjust manually.

#### Inventory List

The list shows all ingredients and supports viewing by status or storage location.

Each item shows:

- Ingredient name.
- Quantity and unit.
- Storage location.
- Expiration date.
- Status: normal, expiring soon, expired, or unknown.

#### Edit and Delete

Users can edit ingredient information or delete ingredients that are no longer needed.

#### Expiration Status Rules

- Expired: expiration date is earlier than today.
- Expiring soon: expiration date is within the next 2 days.
- Normal: expiration date is more than 2 days away.
- Unknown: no expiration date is provided; it does not participate in expiration-priority ranking.

## 5.3 Recipes Module

### Module Goal

Provide structured recipes for the generation engine.

### Recipe Sources

The MVP includes:

- Built-in structured home-style recipes.
- User-created recipes.

The MVP does not include AI-generated recipes.

### Built-In Recipe Count

Demo V1 should include at least 40 built-in recipes.

Suggested coverage:

- At least 8 breakfast recipes or breakfast combinations.
- At least 25 lunch/dinner home-style recipes.
- Basic coverage for quick meals, lunchbox-friendly meals, and lighter/less-oil meals.

### Breakfast Combination Recommendations

Breakfast may use combination-style recommendations. It does not need to be limited to cooked recipes.

Examples:

- Milk + eggs + toast.
- Yogurt + fruit + oats.
- Congee + egg + side dish.

Product rules:

- Breakfast combinations should be structured candidates in the generation pool.
- Breakfast combinations still need to satisfy inventory matching and health rules.
- Breakfast combinations do not need full cooking steps, but they must include expected ingredient usage.

### Recipe List

Each recipe item shows:

- Recipe name.
- Applicable meal types.
- Main ingredients.
- Cooking time.
- Difficulty.
- Tags.
- Source: built-in or user-created.

### Recipe Detail

The detail page shows:

- Recipe name.
- Short description.
- Applicable meal types.
- Required ingredients and quantities.
- Optional ingredients.
- Seasonings.
- Estimated cooking time.
- Difficulty.
- Required cookware.
- Whether it is lunchbox-friendly.
- Tags.
- Short cooking steps.
- Health notes.

### User-Created Recipes

Users can create, edit, and delete their own recipes.

Required fields:

- Recipe name.
- Applicable meal type.
- At least one main ingredient.
- Ingredient quantities.
- Estimated cooking time.
- Difficulty.

## 5.4 Generation Engine Module

### Module Goal

Generate a daily meal plan from inventory, recipes, and user settings.

### Inputs

- Current inventory.
- Ingredient expiration status.
- Recipe library.
- User settings.
- Current date.
- Existing meal plan.
- Recent swap history.

### Outputs

- Today’s breakfast, lunch, and dinner.
- Recipe for each meal.
- Expected ingredient usage for each meal.
- Health prompts.
- Recommendation reasons.
- Generation failure reasons.

### Generation Priority

Priority from highest to lowest:

1. Use only existing inventory.
2. Prioritize soon-to-expire ingredients.
3. Satisfy cooking constraints.
4. Satisfy basic health rules.
5. Consider taste preferences.
6. Keep results varied and somewhat random.

## 5.5 Settings Module

### Module Goal

Allow users to configure lightweight constraints that affect meal generation.

### Settings

#### Cooking Constraints

Highest priority.

Includes:

- Maximum cooking time per meal.
- Acceptable difficulty.
- Available cookware.
- Whether lunchbox-friendly meals are required.
- Budget preference.
- Whether repeated ingredients are acceptable.
- Whether leftovers are acceptable.

#### Diet Goals

Second priority.

Demo V1 should keep at most the following 7 lightweight diet goal tags and should not expand beyond them.

Includes:

- Light.
- Less oil.
- Less salt.
- Fat loss.
- High protein.
- More vegetables.
- Less staple food.

#### Taste Preferences

Lowest priority.

Includes:

- Spicy.
- Not spicy.
- Home-style Chinese cooking.
- Simple and quick.
- Disliked ingredients.
- Frequently used ingredients.

#### Local Data Management

May include:

- Clear today’s meal plan.
- Clear inventory.
- Reset settings.
- Import/export local data in a later iteration.

#### Language Settings

Users can switch the interface language in Settings.

Demo supported languages:

- English.
- Simplified Chinese.

Requirements:

- Build the English interface first.
- Simplified Chinese copy is maintained as a translation of the same copy resources.
- After switching language, navigation, buttons, titles, empty states, error messages, form fields, and health prompts should update consistently.
- The selected language should be saved locally.
- User-created ingredient names, recipes, and notes do not need automatic translation.
- Built-in recipes may gradually support bilingual names and descriptions.

## 6. Data Object Drafts

### 6.1 IngredientItem

```text
IngredientItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  storageLocation: "fridge" | "freezer" | "pantry" | "other"
  expiryDate?: string
  addedAt: string
  updatedAt: string
  notes?: string
  status: "normal" | "expiringSoon" | "expired" | "unknown"
}
```

Notes:

- Represents one ingredient item in inventory.
- `quantity` and `unit` are used for inventory deduction.
- `status` can be calculated from `expiryDate`.
- The first version does not require complex unit conversion, but common units should be standardized where possible.

### 6.2 Recipe

```text
Recipe {
  id: string
  name: string
  source: "builtIn" | "userCreated"
  mealTypes: Array<"breakfast" | "lunch" | "dinner">
  ingredients: RecipeIngredient[]
  optionalIngredients?: RecipeIngredient[]
  seasonings?: string[]
  cookware?: string[]
  estimatedMinutes: number
  difficulty: "easy" | "medium" | "hard"
  tags: string[]
  isLunchboxFriendly?: boolean
  steps?: string[]
  healthNotes?: string[]
  createdAt: string
  updatedAt: string
}
```

```text
RecipeIngredient {
  name: string
  quantity: number
  unit: string
  role: "staple" | "protein" | "vegetable" | "other"
  required: boolean
}
```

### 6.3 MealPlan

```text
MealPlan {
  id: string
  date: string
  meals: Meal[]
  createdAt: string
  updatedAt: string
}
```

```text
Meal {
  mealType: "breakfast" | "lunch" | "dinner"
  items: PlannedMealItem[]
}
```

```text
PlannedMealItem {
  id: string
  recipeSnapshot: Recipe
  plannedServings: number
  plannedConsumption: ConsumptionItem[]
  status: "planned" | "completed"
  reasons: string[]
  warnings: string[]
  locked: boolean
}
```

```text
ConsumptionItem {
  ingredientItemId: string
  ingredientName: string
  canonicalName: string
  quantity: number
  unit: string
  requiresConfirmation: boolean
}
```

Notes:

- `Meal.items` supports multiple meal items in one meal.
- Random generation and manual recipe selection should both create `PlannedMealItem` objects.
- `recipeSnapshot` stores the recipe as it was when the item was planned, so later recipe edits do not unexpectedly change planned meals.
- Completed meal items are locked and should not be overwritten by random swaps.

### 6.4 UserSettings

```text
UserSettings {
  cookingConstraints: CookingConstraints
  dietGoals: string[]
  tastePreferences: string[]
  dislikedIngredients: string[]
  language: "en" | "zh-CN"
  updatedAt: string
}
```

```text
CookingConstraints {
  maxMinutesPerMeal?: number
  maxDifficulty?: "easy" | "medium" | "hard"
  availableCookware: string[]
  lunchboxRequired?: boolean
  budgetMode?: "low" | "normal"
  allowRepeatedIngredients?: boolean
  allowLeftovers?: boolean
}
```

### 6.5 Copy and Translation Resources

The Demo should treat visible interface copy as product data.

#### Copy Scope

The following copy should be managed through translation resources:

- Bottom navigation.
- Page titles.
- Buttons.
- Form fields.
- Filters and tags.
- Empty states.
- Error messages.
- Health prompts.
- Meal generation reasons.
- Setting names and descriptions.

#### Language Priority

Product implementation order:

1. English copy first.
2. Simplified Chinese translation follows.
3. Both languages should preserve the same meaning.

PRD maintenance order:

1. Chinese requirements first.
2. English PRD follows the Chinese PRD.
3. The English PRD should not change the Chinese scope.

#### Content Boundaries

- Built-in system copy must support English and Simplified Chinese.
- Built-in recipes should eventually support bilingual names, descriptions, and steps.
- User-entered ingredient names, user-created recipes, and notes do not need automatic translation.
- The first version does not need to translate user-generated content based on app language.

## 7. Recipe Matching and Random Generation Rules

### 7.1 Basic Principle

The generation logic should produce meals that are doable, reasonable, and varied. It does not need a mathematically optimal plan.

The first version should use rule-based matching and should not generate new recipes with AI.

### 7.2 Candidate Recipe Filtering

Each meal type filters its own candidate recipes.

A recipe can enter the candidate pool only if:

- It applies to the current meal type.
- All required ingredients exist in inventory.
- Required ingredient quantities are sufficient.
- It satisfies the maximum cooking time constraint.
- It satisfies the difficulty constraint.
- Required cookware is available, or the recipe has no special cookware requirement.
- If lunchbox mode is enabled, lunch should prioritize lunchbox-friendly recipes.

### 7.3 Candidate Weighting

Candidate recipes are weighted by:

- More soon-to-expire ingredients used means higher weight.
- Expired ingredients are excluded by default.
- Better fit with cooking constraints means higher weight.
- Better fit with diet goals means higher weight.
- Taste preferences may add weight, but should not override inventory usage or cooking constraints.
- Recently recommended recipes should receive lower weight.
- Recipes that overly repeat the same ingredients as other meals today should receive lower weight.

### 7.4 Random Selection

The system selects randomly from higher-weight candidates.

Rules:

- Do not always choose the top-ranked recipe.
- Keep some variation.
- When swapping a meal, exclude the current recipe where possible.
- If the candidate pool is empty, show the specific reason.
- If the system cannot generate all three meals, it may generate partial meals and explain what is missing.

### 7.5 Daily Meal Combination Rules

The daily plan should try to:

- Avoid repeating the exact same recipe.
- Avoid using the same main dish for both lunch and dinner.
- Cover staple food, protein, and vegetables where possible.
- Prioritize soon-to-expire ingredients.
- Allow repetition when inventory is limited, but tell the user why.

## 8. Health Rules Layer

### 8.1 Positioning

The health rules layer provides lightweight, explainable balance prompts.

The MVP does not calculate calories or macros, and it does not provide medical nutrition advice.

### 8.2 Basic Balance Rules

The system checks whether the day includes:

- Staple food.
- Protein.
- Vegetables.

Each meal should ideally include:

- A main energy source.
- A protein source.
- A vegetable or fruit source.

### 8.3 Health Prompts

Example prompts:

- Vegetables are a bit low today.
- This meal has limited protein.
- Two meals in a row are heavy on staple foods.
- This recipe can be cooked with less oil.
- This meal would pair well with vegetables.
- Soon-to-expire ingredients have been prioritized.

### 8.4 Diet Goal Handling

Diet goals work as filters or weighting factors.

Examples:

- Light: prioritize less oily, less fried, and less heavily seasoned recipes.
- Less oil: reduce the weight of fried recipes and prompt users to use less oil.
- Fat loss: prioritize higher-protein and vegetable-forward combinations.
- High protein: increase the weight of recipes with eggs, meat, fish, seafood, tofu, beans, or similar protein sources.
- More vegetables: increase the weight of recipes using vegetable ingredients.

## 9. Error and Empty States

### 9.1 Empty Inventory

Description:

- The user has not added any ingredients.

Handling:

- Show an empty state.
- Prompt the user to add ingredients.
- Provide entry points for quick entry and form entry.

Example copy:

> No ingredients yet. Add a few items you already have at home, and My Fridge can help plan what to eat today.

### 9.2 Insufficient Inventory

Description:

- Current inventory cannot match recipes for a meal.

Handling:

- Random generation does not recommend recipes with missing required ingredients.
- Manual recipe addition may still add recipes with missing ingredients to the plan, but it must show warnings and block confirmation if inventory is still insufficient.
- Show which meal failed.
- Explain the reason.
- Prompt the user to add inventory or create a recipe that works with current ingredients.

Example copy:

> Your current inventory cannot make this meal yet. Add more ingredients or create a recipe that uses what you already have.

### 9.3 Insufficient Recipes

Description:

- The recipe library does not contain enough usable recipes.

Handling:

- Tell the user that usable recipes are limited.
- Prompt the user to add recipes.
- Suggest relaxing cooking time, difficulty, or cookware constraints.

Example copy:

> There are not enough usable recipes for dinner. Add a few recipes you often cook, or loosen your settings.

### 9.4 Soon-to-Expire Ingredients

Description:

- Ingredients will expire within the next 2 days.

Handling:

- Highlight them in Inventory.
- Prioritize them during meal generation.
- Explain the recommendation reason on Today.

Example copy:

> 3 ingredients are expiring soon. Today’s meals will prioritize them.

### 9.5 Expired Ingredients

Description:

- Expiration date is earlier than today.

Handling:

- Exclude expired ingredients from recommendations by default.
- Prompt the user to check them.
- Allow the user to delete or update the date.

Example copy:

> Some ingredients are expired and will not be recommended by default. Please review or update them.

### 9.6 Cannot Swap Meal

Description:

- There is no other feasible recipe for the current meal.

Handling:

- Keep the current meal.
- Explain why no replacement is available.

Example copy:

> There are no other suitable options for this meal right now. Add inventory, loosen settings, or add more recipes.

### 9.7 Inventory Deduction Failed

Description:

- Inventory quantity is insufficient, an ingredient was deleted, or units do not match.

Handling:

- Show the problematic ingredient.
- Allow the user to adjust the deduction quantity.
- Allow the user to cancel the deduction.

Example copy:

> Some ingredients do not have enough inventory to deduct. Please adjust the amounts before confirming.

## 10. Success Metrics

### 10.1 Core Behavior Metrics

- Percentage of first-time users who add ingredients.
- Percentage of users who successfully generate today’s three meals.
- Number of “Swap” actions per meal.
- Number of cooked meals with inventory deduction.
- Percentage of soon-to-expire ingredients included in generated meals.
- Completion rate from ingredient entry to ingredient consumption.

### 10.2 Retention Metrics

- Next-day return rate.
- Number of active days within 7 days.
- Weekly meal generation count.
- Average number of inventory items.
- Average number of user-created recipes.

### 10.3 Quality Metrics

- Meal generation failure rate.
- Failure rate caused by insufficient recipes.
- Failure rate caused by insufficient inventory.
- Number of consecutive swaps by the same user.
- Percentage of generated meals marked as cooked.

### 10.4 Qualitative Metrics

- Users feel it is easier to decide what to eat.
- Users feel soon-to-expire ingredients are easier to use.
- Users are willing to maintain inventory.
- Users find ingredient entry acceptable.
- Users trust the recommendations.

## 11. Demo Roadmap

### Demo V1: Core Loop

Goal: validate the core value of inventory-driven meal generation.

Includes:

- Local data storage.
- Single-user experience.
- Manual inventory entry.
- Structured recipe library.
- Today’s three-meal generation.
- Manual addition of an existing recipe to a meal on Today.
- Per-meal swap.
- Inventory deduction after cooking.
- Health rules layer.

### Demo V1.1: Better Entry Experience

- Quick add for common ingredients.
- Recently added ingredients.
- Ingredient templates.
- Better quick-entry parsing.
- Common unit improvements.
- Quick expiration date options.

### Demo V1.2: Better Recipe Experience

- More built-in home-style recipes.
- Recipe search and filtering.
- Recipe favorites.
- Duplicate and edit user-created recipes.
- Simple ingredient substitution rules.

### Post-Demo Product Direction

The following items are not required for the Demo. They belong to later product work after the core workflow is proven:

- Native mobile app.
- Cloud account and cross-device sync.
- Photo-based ingredient recognition.
- Receipt recognition.
- Low-inventory reminders.
- Shopping list.
- Missing-ingredient purchase suggestions.
- Shared household inventory.
- Multi-member preferences.
- AI-assisted rewriting of existing recipes or recipe variations.
- More detailed nutrition analysis.
- Longer-term meal planning.

## 12. Open Questions

1. Should users be able to manually mark expired ingredients as still usable?
2. Should inventory deduction require confirmation every time a meal is marked as cooked?
3. Should the app record meal history to avoid short-term repetition?
4. Should the built-in recipes primarily focus on Chinese home cooking, or include broader home-style meals from the beginning?
5. Should leftovers be treated as a special inventory object?
6. Does the Demo need local data import/export?
7. Should Today show “why this was recommended” for each meal?
8. Should users be able to temporarily exclude an ingredient, such as “I do not want eggs today”?
9. Should the Demo default language be English, or should it follow the browser language?
10. During the Demo stage, should built-in recipes have full bilingual steps, or only bilingual names, tags, and key prompts?

## 13. Demo Acceptance Criteria

### 13.1 Basic Usability

- Users can add, edit, and delete inventory ingredients.
- Users can view inventory status and expiration status.
- Users can view built-in recipes and user-created recipes.
- The system includes at least 40 built-in recipes.
- Users can generate today’s three meals.
- Users can manually select an existing recipe and add it to breakfast, lunch, or dinner on the Today page.
- The Today manual recipe picker supports search, meal type filtering, and nutrition tag filtering.
- A meal can contain multiple meal items.
- Users can swap any individual meal.
- Users can mark a meal as cooked and deduct inventory.
- Local data still exists after the user closes and reopens the app.
- Users can switch the interface between English and Simplified Chinese.
- Breakfast can generate structured combination-style recommendations.

### 13.2 Recommendation Quality

- Random generation does not recommend recipes missing required ingredients.
- The system shows warnings when the user manually adds a recipe with insufficient inventory.
- Meal items with insufficient inventory cannot be confirmed or deducted.
- The system prioritizes soon-to-expire ingredients.
- The system respects cooking time, difficulty, cookware, and lunchbox constraints.
- The system can explain why generation failed.
- The system provides lightweight prompts when health rules are not fully satisfied.
- Built-in interface copy has consistent meaning in both supported languages.
- The system can handle basic same-type unit conversion and asks users to confirm when units cannot be matched.

### 13.3 Scope Control

- The Demo does not require an account system.
- The Demo does not require cloud sync.
- The Demo does not require AI-generated recipes.
- The Demo does not require a shopping list.
- The Demo does not require photo or receipt recognition.
- The Demo does not require strict nutrition calculation.
- The Demo does not require multi-person household preferences.
- The Demo does not require automatic translation of user-entered content.
