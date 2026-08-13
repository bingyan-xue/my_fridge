# Today Fridge Shelf UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Today page feel more polished while preserving the existing minimalist line-fridge visual direction.

**Architecture:** Keep all meal planning behavior unchanged. Add a Today summary strip in `TodayPage`, pass the meal type into existing `MealCard` styling, and render lightweight planned/done status labels inside meal items.

**Tech Stack:** React, TypeScript, CSS, lucide-react, Vitest, Testing Library.

## Global Constraints

- Do not change planner, inventory deduction, cancel, remove, or recipe picker behavior.
- Keep the design mobile-first and compatible with the current bottom navigation.
- Keep cards at 8px radius or less.
- Preserve bilingual structure for any new visible text.

---

### Task 1: Today Summary And Status Labels

**Files:**
- Modify: `src/pages/TodayPage.tsx`
- Modify: `src/components/MealCard.tsx`
- Modify: `src/i18n/translations.ts`
- Test: `tests/todayManualRecipe.test.tsx`

**Interfaces:**
- `TodayPage` computes totals from today's meal plan: planned meal item count, completed meal item count, and meal count.
- `MealCard` renders a meal type class and a status label for each item.

- [ ] **Step 1: Write failing tests**

Add tests expecting Today to show `3 meals`, `1 planned`, `0 done`, and expecting planned/completed item labels.

- [ ] **Step 2: Run red test**

Run: `npm.cmd test -- tests/todayManualRecipe.test.tsx`

- [ ] **Step 3: Implement minimal component and translation changes**

Add `today.summary` and `meal.status` translation fields; render summary strip and item labels.

- [ ] **Step 4: Run green test**

Run: `npm.cmd test -- tests/todayManualRecipe.test.tsx`

### Task 2: Fridge Shelf Visual Styling

**Files:**
- Modify: `src/styles.css`
- Test: `tests/todayManualRecipe.test.tsx`

**Interfaces:**
- `MealCard` uses classes `mealCard-breakfast`, `mealCard-lunch`, `mealCard-dinner`.
- Empty meals render a shelf-slot class while preserving existing empty text.

- [ ] **Step 1: Add/adjust tests for class hooks where useful**

Use Testing Library to verify status text and summary text; avoid brittle color assertions.

- [ ] **Step 2: Implement CSS**

Add a compact Today top panel, meal color side rails, shelf-slot empty state, quieter icon buttons, and item status pills.

- [ ] **Step 3: Run full verification**

Run:

```bash
npm.cmd test
npm.cmd run build
```
