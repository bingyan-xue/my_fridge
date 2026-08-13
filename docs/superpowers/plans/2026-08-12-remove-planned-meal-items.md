# Remove Planned Meal Items Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to remove a Today meal item when it has not currently deducted inventory.

**Architecture:** Treat `PlannedMealItem.status` as the source of truth. Items with `status: 'planned'` can be removed from the meal plan; items with `status: 'completed'` cannot be removed and must first use Cancel to restore inventory.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, localStorage-backed app state.

## Global Constraints

- Do not delete completed meal items directly because they have active inventory transactions.
- Do not write inventory transactions when deleting a planned item.
- Keep the control bilingual and icon-first.

---

### Task 1: Remove Planned Meal Item

**Files:**
- Modify: `src/domain/inventory.ts`
- Modify: `src/components/MealCard.tsx`
- Modify: `src/pages/TodayPage.tsx`
- Modify: `src/i18n/translations.ts`
- Test: `tests/todayManualRecipe.test.tsx`

**Interfaces:**
- Produces: `removePlannedMealItem(data: AppData, mealPlanId: string, itemId: string, now: string): AppData`
- Produces: `MealCard` prop `onRemove: (itemId: string) => void`

- [ ] **Step 1: Write failing tests**

Add tests that:
- remove a `planned` item from Today without changing inventory transactions.
- hide the remove button for a `completed` item.
- show the remove button again after Cancel returns a completed item to `planned`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- tests/todayManualRecipe.test.tsx`

- [ ] **Step 3: Write minimal implementation**

Add `removePlannedMealItem`, wire `TodayPage.handleRemove`, and render an icon button for `planned` items only.

- [ ] **Step 4: Run verification**

Run:

```bash
npm.cmd test
npm.cmd run build
```
