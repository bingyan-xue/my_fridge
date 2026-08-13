# Today Manual Recipe Picker Design

## Context

The current Today page can randomly generate one meal item for breakfast, lunch, or dinner. The data model already supports `Meal.items`, so one meal can contain multiple planned items, but the current generation UI does not let users manually add a recipe when they already know what they want to eat.

This design updates the product and architecture direction before implementation. The Chinese PRD and ARCH remain the source of truth; the English documents follow them.

## Product Decision

The Today page will support manual recipe addition for each meal.

The user can tap `Add recipe` on breakfast, lunch, or dinner. The app opens a focused recipe picker. The picker supports:

- recipe name search
- meal type filtering
- nutrition tag filtering

Nutrition tags appear in this order:

1. `carb`
2. `protein`
3. `fat`
4. `fiber`
5. `vegetable`
6. `fruit`
7. `dairy`

The first three tags are shown first because they help users quickly judge staple food, protein, and fat before checking secondary nutrition tags.

## Inventory Rule

Manual planning can be more permissive than random generation.

Random generation should not recommend recipes that are missing required ingredients.

Manual addition may still add a recipe when ingredients are missing, quantities are insufficient, or units cannot be confirmed automatically. In that case:

- the picker must show a warning
- the added meal item must keep a warning
- adding the item must not deduct inventory
- confirming the item must recheck current inventory
- if inventory is still insufficient, confirmation must be blocked
- failed confirmation must not change inventory or write an `InventoryTransaction`

This keeps planning flexible without polluting inventory data.

## Architecture Impact

No major schema change is required.

`Meal.items` already supports multiple meal items. The PRD data draft has been updated to match the current architecture:

- `Meal` contains `items: PlannedMealItem[]`
- `PlannedMealItem` stores `recipeSnapshot`, `plannedConsumption`, `status`, `reasons`, `warnings`, and `locked`
- `ConsumptionItem` stores the inventory item, canonical name, quantity, unit, and whether confirmation is required

Implementation should add or extract a shared helper that converts a `Recipe` into a `PlannedMealItem`. Random generation and manual addition should use the same consumption calculation.

## UI Impact

The Today page needs:

- an `Add recipe` action on each `MealCard`
- a `RecipePicker` component or equivalent focused picker
- search input
- meal type filter
- nutrition tag filter
- recipe result cards with inventory warnings
- a warning state on added meal items
- a user-facing error when confirmation is blocked because inventory is insufficient

The picker should be a modal or equivalent focused layer so the Today page does not become too long on mobile.

## Testing

Implementation should cover:

- manual recipe addition appends to the selected meal
- manual addition does not overwrite existing meal items
- insufficient inventory recipes can be added with warnings
- insufficient inventory blocks confirmation and does not deduct inventory
- the picker filters by meal type
- the picker filters by nutrition tags
- the picker filters by search text
- random generation behavior remains unchanged

## Updated Documents

Updated documents:

- `docs/my-fridge-demo-prd.md`
- `docs/my-fridge-demo-prd.en.md`
- `docs/my-fridge-demo-arch.md`
- `docs/my-fridge-demo-arch.en.md`

Future changes to this feature should keep all four documents synchronized.
