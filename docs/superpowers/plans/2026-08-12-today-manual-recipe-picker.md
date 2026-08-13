# Today Manual Recipe Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Today-page manual recipe picker so users can search and filter recipes, append a recipe to a meal, see inventory warnings, and avoid inventory deduction when stock is insufficient.

**Architecture:** Keep inventory and recipe matching rules in TypeScript domain helpers, not inside React components. Random generation and manual addition should share the same `Recipe -> PlannedMealItem` creation path. The Today UI opens a focused picker from a meal card and appends selected recipes to `Meal.items`.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, localStorage.

## Global Constraints

- Default interface language remains English, with Simplified Chinese translations maintained in `src/i18n/translations.ts`.
- Adding a recipe to a meal is only a plan and must not deduct inventory.
- Random generation must continue filtering out recipes with missing required ingredients.
- Manual recipe addition may add recipes with missing ingredients, insufficient quantity, or unit warnings, but the warning must be visible.
- Confirmation must recheck current inventory and must not deduct inventory or write transactions if inventory is insufficient.
- Nutrition filter order is `carb`, `protein`, `fat`, `fiber`, `vegetable`, `fruit`, `dairy`.
- Preserve the current line-fridge UI direction and avoid a long inline picker that stretches the Today page.

---

### Task 1: Planner Helpers for Manual Meal Items

**Files:**
- Modify: `src/domain/planner.ts`
- Test: `tests/planner.test.ts`

**Interfaces:**
- Produces: `buildPlannedMealItem(recipe: Recipe, ingredients: IngredientItem[], today: string, options?: { allowInsufficientInventory?: boolean }): PlannedMealItem | null`
- Produces: `getRecipeInventoryWarnings(recipe: Recipe, ingredients: IngredientItem[], today: string): string[]`
- Existing `generateMeal()` continues to return `GenerateMealResult`.

- [ ] **Step 1: Write failing planner tests**

Add tests to `tests/planner.test.ts`:

```ts
it('builds a planned meal item from a selected recipe', () => {
  const result = buildPlannedMealItem(boiledEgg, [egg], today);

  expect(result?.recipeSnapshot.id).toBe('recipe-egg');
  expect(result?.plannedConsumption[0]).toMatchObject({
    ingredientItemId: 'ing-egg',
    canonicalName: '楦¤泲',
    quantity: 1,
    unit: '涓?,
    requiresConfirmation: false,
  });
  expect(result?.status).toBe('planned');
  expect(result?.locked).toBe(false);
});

it('allows manually selected recipes with insufficient inventory and keeps warnings', () => {
  const lowEgg = { ...egg, quantity: 0 };
  const result = buildPlannedMealItem(boiledEgg, [lowEgg], today, { allowInsufficientInventory: true });

  expect(result).not.toBeNull();
  expect(result?.warnings.length).toBeGreaterThan(0);
  expect(result?.plannedConsumption[0].quantity).toBe(1);
});

it('keeps random generation from selecting recipes with insufficient inventory', () => {
  const lowEgg = { ...egg, quantity: 0 };
  const result = generateMeal({ mealType: 'breakfast', today, ingredients: [lowEgg], recipes: [boiledEgg] });

  expect(result.status).toBe('failed');
});
```

- [ ] **Step 2: Run planner tests to verify failure**

Run: `npm.cmd test -- tests/planner.test.ts`

Expected: FAIL because `buildPlannedMealItem` is not exported.

- [ ] **Step 3: Implement planner helpers**

In `src/domain/planner.ts`:

- export `buildPlannedMealItem`
- export `getRecipeInventoryWarnings`
- reuse existing `buildConsumption`, `recipeIsFeasible`, and `scoreRecipe` behavior where possible
- keep `generateMeal()` behavior unchanged except replacing local item construction with `buildPlannedMealItem(...)`

- [ ] **Step 4: Run planner tests to verify pass**

Run: `npm.cmd test -- tests/planner.test.ts`

Expected: PASS.

---

### Task 2: Block Confirmation When Inventory Is Insufficient

**Files:**
- Modify: `src/domain/inventory.ts`
- Test: `tests/inventory.test.ts`

**Interfaces:**
- Produces: `canCompletePlannedMealItem(data: AppData, mealPlanId: string, itemId: string): { ok: true } | { ok: false; reason: 'missingIngredient' | 'insufficientQuantity' | 'unitNeedsConfirmation' }`
- Updates: `completePlannedMealItem(...)` returns unchanged `AppData` when `canCompletePlannedMealItem(...).ok === false`.

- [ ] **Step 1: Write failing inventory tests**

Add tests to `tests/inventory.test.ts`:

```ts
it('does not complete a meal item when inventory quantity is insufficient', () => {
  const data = createMealCompletionData();
  const lowInventory = {
    ...data,
    ingredients: data.ingredients.map((ingredient) => (ingredient.id === 'ing-egg' ? { ...ingredient, quantity: 0 } : ingredient)),
  };

  const result = completePlannedMealItem(lowInventory, 'plan-1', 'planned-egg', '2026-07-27T08:00:00.000Z');

  expect(result.ingredients.find((ingredient) => ingredient.id === 'ing-egg')?.quantity).toBe(0);
  expect(result.inventoryTransactions).toHaveLength(0);
  expect(result.mealPlans[0].meals[0].items[0].status).toBe('planned');
});
```

- [ ] **Step 2: Run inventory tests to verify failure**

Run: `npm.cmd test -- tests/inventory.test.ts`

Expected: FAIL because current completion deducts without rechecking quantity.

- [ ] **Step 3: Implement confirmation guard**

In `src/domain/inventory.ts`:

- add `canCompletePlannedMealItem`
- check every `plannedConsumption` item against latest inventory
- fail if the inventory item is missing
- fail if `requiresConfirmation` is true
- fail if the inventory unit does not match the consumption unit
- fail if `quantity < consumption.quantity`
- return unchanged data from `completePlannedMealItem` when the guard fails

- [ ] **Step 4: Run inventory tests to verify pass**

Run: `npm.cmd test -- tests/inventory.test.ts`

Expected: PASS.

---

### Task 3: RecipePicker Component

**Files:**
- Create: `src/components/RecipePicker.tsx`
- Test: `tests/recipePicker.test.tsx`
- Modify: `src/i18n/translations.ts`

**Interfaces:**
- Consumes: `Recipe`, `IngredientItem`, `MealType`, `Translation`
- Consumes: `getRecipeInventoryWarnings(recipe, ingredients, today)`
- Produces: `RecipePicker({ recipes, ingredients, mealType, today, t, onSelect, onClose })`

- [ ] **Step 1: Write failing picker tests**

Create `tests/recipePicker.test.tsx` with tests for:

```ts
it('filters recipes by search text', () => {
  renderPicker();
  fireEvent.change(screen.getByLabelText('Search recipes'), { target: { value: 'rice' } });
  expect(screen.getByText('Rice')).toBeInTheDocument();
  expect(screen.queryByText('Boiled Egg')).not.toBeInTheDocument();
});

it('orders nutrition filters with carbs protein and fat first', () => {
  renderPicker();
  const labels = screen.getAllByTestId('nutrition-filter').map((button) => button.textContent);
  expect(labels.slice(0, 3)).toEqual(['Carbs', 'Protein', 'Fat']);
});

it('allows selecting a recipe with inventory warnings', () => {
  const onSelect = vi.fn();
  renderPicker({ onSelect, ingredients: [] });
  expect(screen.getByText('Missing ingredients')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Add Boiled Egg/ }));
  expect(onSelect).toHaveBeenCalled();
});
```

- [ ] **Step 2: Run picker tests to verify failure**

Run: `npm.cmd test -- tests/recipePicker.test.tsx`

Expected: FAIL because `RecipePicker` does not exist.

- [ ] **Step 3: Implement RecipePicker**

Create `src/components/RecipePicker.tsx`:

- modal overlay with dialog role
- search input
- meal type select
- nutrition tag button row ordered by the required tag order
- recipe result list
- warning text when `getRecipeInventoryWarnings(...)` returns warnings
- select button per result
- close button

Add translation keys in `src/i18n/translations.ts` for:

- add recipe
- search recipes
- filter meal type
- all meal types
- missing ingredients
- insufficient inventory
- unit needs confirmation
- close picker

- [ ] **Step 4: Run picker tests to verify pass**

Run: `npm.cmd test -- tests/recipePicker.test.tsx`

Expected: PASS.

---

### Task 4: Wire Manual Addition Into Today

**Files:**
- Modify: `src/pages/TodayPage.tsx`
- Modify: `src/components/MealCard.tsx`
- Modify: `src/styles.css`
- Test: `tests/todayManualRecipe.test.tsx`

**Interfaces:**
- Consumes: `buildPlannedMealItem`
- Consumes: `RecipePicker`
- `MealCard` gains `onAddRecipe: () => void`

- [ ] **Step 1: Write failing Today integration tests**

Create `tests/todayManualRecipe.test.tsx`:

```ts
it('adds a selected recipe to the selected meal without replacing existing items', () => {
  const onChange = vi.fn();
  render(<TodayPage appData={sampleDataWithBreakfastPlan} onChange={onChange} t={translations.en} />);

  fireEvent.click(screen.getAllByRole('button', { name: 'Add recipe' })[0]);
  fireEvent.click(screen.getByRole('button', { name: /Add Boiled Egg/ }));

  const next = onChange.mock.calls[0][0];
  const breakfast = next.mealPlans[0].meals.find((meal) => meal.mealType === 'breakfast');
  expect(breakfast.items).toHaveLength(2);
});

it('shows picker filters from Today', () => {
  render(<TodayPage appData={sampleData} onChange={vi.fn()} t={translations.en} />);
  fireEvent.click(screen.getAllByRole('button', { name: 'Add recipe' })[0]);
  expect(screen.getByRole('dialog', { name: 'Add recipe' })).toBeInTheDocument();
  expect(screen.getByLabelText('Search recipes')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run Today manual tests to verify failure**

Run: `npm.cmd test -- tests/todayManualRecipe.test.tsx`

Expected: FAIL because `MealCard` and `TodayPage` do not expose manual add behavior.

- [ ] **Step 3: Implement Today wiring**

In `MealCard`:

- add an `Add recipe` button near the regenerate button
- call `onAddRecipe`

In `TodayPage`:

- track selected picker meal type in state
- open `RecipePicker` for that meal type
- on select, create or reuse today’s `MealPlan`
- append `buildPlannedMealItem(recipe, appData.ingredients, today, { allowInsufficientInventory: true })`
- close picker after selection

In `styles.css`:

- add modal and picker styles consistent with line-fridge theme
- keep controls mobile-friendly and avoid nested cards

- [ ] **Step 4: Run Today manual tests to verify pass**

Run: `npm.cmd test -- tests/todayManualRecipe.test.tsx`

Expected: PASS.

---

### Task 5: User-Facing Confirmation Failure Feedback

**Files:**
- Modify: `src/pages/TodayPage.tsx`
- Modify: `src/components/MealCard.tsx`
- Modify: `src/i18n/translations.ts`
- Test: `tests/todayManualRecipe.test.tsx`

**Interfaces:**
- Consumes: `canCompletePlannedMealItem`
- Today page displays a localized warning when confirmation is blocked.

- [ ] **Step 1: Write failing feedback test**

Add to `tests/todayManualRecipe.test.tsx`:

```ts
it('keeps inventory unchanged and shows a message when confirming insufficient inventory', () => {
  const onChange = vi.fn();
  render(<TodayPage appData={planWithInsufficientInventory} onChange={onChange} t={translations.en} />);

  fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getByText('Inventory is not enough. Update inventory before confirming.')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm.cmd test -- tests/todayManualRecipe.test.tsx`

Expected: FAIL because Today does not show confirmation failure feedback.

- [ ] **Step 3: Implement feedback**

In `TodayPage`:

- call `canCompletePlannedMealItem` before `completePlannedMealItem`
- if it fails, set a per-item or per-meal failure message and return
- if it passes, call `completePlannedMealItem`

In translations:

- English: `Inventory is not enough. Update inventory before confirming.`
- Chinese: `库存不足。请先修改库存，再确认。`

- [ ] **Step 4: Run feedback tests to verify pass**

Run: `npm.cmd test -- tests/todayManualRecipe.test.tsx`

Expected: PASS.

---

### Task 6: Full Verification and Project State

**Files:**
- Modify: `docs/project_state.md`

**Interfaces:**
- No new runtime interfaces.

- [ ] **Step 1: Run targeted tests**

Run:

```bash
npm.cmd test -- tests/planner.test.ts tests/inventory.test.ts tests/recipePicker.test.tsx tests/todayManualRecipe.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run full tests**

Run: `npm.cmd test`

Expected: PASS.

- [ ] **Step 3: Run production build**

Run: `npm.cmd run build`

Expected: PASS.

- [ ] **Step 4: Update project state**

Update `docs/project_state.md` with:

- Today manual recipe picker implemented
- one meal may contain multiple manually selected items
- manual picker supports search, meal type filters, and nutrition tag filters
- insufficient inventory warnings are shown
- insufficient inventory blocks confirmation and does not deduct inventory
- latest verification commands and results

- [ ] **Step 5: Review diff**

Run: `git diff --stat`

Expected: changes are limited to docs, planner/inventory helpers, Today UI, picker component, translations, tests, and styles.
