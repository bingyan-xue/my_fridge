import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TodayPage } from '../src/pages/TodayPage';
import type { AppData, IngredientItem, Meal, Recipe } from '../src/domain/types';
import { translations } from '../src/i18n/translations';

const today = '2026-08-12';
const timestamp = `${today}T00:00:00.000Z`;

const egg: IngredientItem = {
  id: 'ing-egg',
  name: 'Egg',
  canonicalName: 'Egg',
  category: 'eggs',
  quantity: 300,
  unit: 'g',
  storageLocation: 'fridge',
  addedAt: today,
  expirySource: 'default',
  estimatedExpiryDate: '2026-09-02',
  nutritionTags: ['protein'],
  updatedAt: timestamp,
};

const existingRecipe: Recipe = {
  id: 'recipe-toast',
  name: 'Toast',
  recipeType: 'staple',
  source: 'builtIn',
  mealTypes: ['breakfast'],
  servings: 1,
  ingredients: [{ name: 'Bread', canonicalName: 'Bread', quantity: 50, unit: 'g', required: true }],
  nutritionTags: ['carb'],
  createdAt: timestamp,
  updatedAt: timestamp,
};

const eggRecipe: Recipe = {
  id: 'recipe-egg',
  name: 'Boiled Egg',
  recipeType: 'readyToEat',
  source: 'builtIn',
  mealTypes: ['breakfast'],
  servings: 1,
  ingredients: [{ name: 'Egg', canonicalName: 'Egg', quantity: 50, unit: 'g', required: true }],
  nutritionTags: ['protein', 'fat'],
  createdAt: timestamp,
  updatedAt: timestamp,
};

const breakfast: Meal = {
  mealType: 'breakfast',
  items: [
    {
      id: 'planned-toast',
      recipeSnapshot: existingRecipe,
      plannedServings: 1,
      plannedConsumption: [],
      status: 'planned',
      reasons: [],
      warnings: [],
      locked: false,
    },
  ],
};

function appDataWithBreakfastPlan(): AppData {
  return {
    schemaVersion: 1,
    ingredients: [egg],
    recipes: [eggRecipe, existingRecipe],
    mealPlans: [
      {
        id: 'plan-today',
        date: today,
        meals: [breakfast, { mealType: 'lunch', items: [] }, { mealType: 'dinner', items: [] }],
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    inventoryTransactions: [],
    settings: { updatedAt: timestamp },
  };
}

describe('Today manual recipe addition', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(`${today}T12:00:00.000`));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('opens the recipe picker from a meal card', () => {
    render(<TodayPage appData={appDataWithBreakfastPlan()} onChange={vi.fn()} t={translations.en} />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Add recipe' })[0]);

    expect(screen.getByRole('dialog', { name: 'Add recipe' })).toBeInTheDocument();
    expect(screen.getByLabelText('Search recipes')).toBeInTheDocument();
  });

  it('shows a compact fridge-plan summary for today', () => {
    render(<TodayPage appData={appDataWithBreakfastPlan()} onChange={vi.fn()} t={translations.en} />);

    expect(screen.getByText('3 meals')).toBeInTheDocument();
    expect(screen.getByText('1 planned')).toBeInTheDocument();
    expect(screen.getByText('0 done')).toBeInTheDocument();
  });

  it('adds a selected recipe to the selected meal without replacing existing items', () => {
    const onChange = vi.fn();
    render(<TodayPage appData={appDataWithBreakfastPlan()} onChange={onChange} t={translations.en} />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Add recipe' })[0]);
    fireEvent.click(screen.getByRole('button', { name: /Add Boiled Egg/ }));

    const next = onChange.mock.calls[0][0] as AppData;
    const nextBreakfast = next.mealPlans[0].meals.find((meal) => meal.mealType === 'breakfast');

    expect(nextBreakfast?.items).toHaveLength(2);
    expect(nextBreakfast?.items.map((item) => item.recipeSnapshot.name)).toEqual(['Toast', 'Boiled Egg']);
  });

  it('keeps inventory unchanged and shows a message when confirming insufficient inventory', () => {
    const onChange = vi.fn();
    const data = appDataWithBreakfastPlan();
    const plannedEgg = {
      id: 'planned-egg',
      recipeSnapshot: eggRecipe,
      plannedServings: 1,
      plannedConsumption: [
        {
          ingredientItemId: 'ing-egg',
          ingredientName: 'Egg',
          canonicalName: 'Egg',
          quantity: 50,
          unit: 'g' as const,
          requiresConfirmation: false,
        },
      ],
      status: 'planned' as const,
      reasons: [],
      warnings: ['insufficientQuantity'],
      locked: false,
    };
    const insufficientData: AppData = {
      ...data,
      ingredients: [{ ...egg, quantity: 0 }],
      mealPlans: [
        {
          ...data.mealPlans[0],
          meals: [{ mealType: 'breakfast', items: [plannedEgg] }, { mealType: 'lunch', items: [] }, { mealType: 'dinner', items: [] }],
        },
      ],
    };

    render(<TodayPage appData={insufficientData} onChange={onChange} t={translations.en} />);

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText('Inventory is not enough. Update inventory before confirming.')).toBeInTheDocument();
  });

  it('removes a planned recipe from a meal without writing inventory transactions', () => {
    const onChange = vi.fn();
    render(<TodayPage appData={appDataWithBreakfastPlan()} onChange={onChange} t={translations.en} />);

    fireEvent.click(screen.getByRole('button', { name: 'Remove Toast' }));

    const next = onChange.mock.calls[0][0] as AppData;
    const nextBreakfast = next.mealPlans[0].meals.find((meal) => meal.mealType === 'breakfast');

    expect(nextBreakfast?.items).toHaveLength(0);
    expect(next.inventoryTransactions).toHaveLength(0);
  });

  it('does not show remove for a completed recipe until it is canceled', () => {
    const onChange = vi.fn();
    const completedData: AppData = {
      ...appDataWithBreakfastPlan(),
      mealPlans: [
        {
          ...appDataWithBreakfastPlan().mealPlans[0],
          meals: [
            {
              mealType: 'breakfast',
              items: [
                {
                  ...breakfast.items[0],
                  status: 'completed',
                  locked: true,
                },
              ],
            },
            { mealType: 'lunch', items: [] },
            { mealType: 'dinner', items: [] },
          ],
        },
      ],
      inventoryTransactions: [
        {
          id: 'tx-toast',
          ingredientItemId: 'ing-egg',
          mealPlanId: 'plan-today',
          plannedMealItemId: 'planned-toast',
          quantityDelta: -50,
          unit: 'g',
          reason: 'mealCompleted',
          createdAt: timestamp,
        },
      ],
    };

    const { rerender } = render(<TodayPage appData={completedData} onChange={onChange} t={translations.en} />);

    expect(screen.queryByRole('button', { name: 'Remove Toast' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    const canceledData = onChange.mock.calls[0][0] as AppData;

    rerender(<TodayPage appData={canceledData} onChange={onChange} t={translations.en} />);

    expect(screen.getByRole('button', { name: 'Remove Toast' })).toBeInTheDocument();
  });

  it('labels planned and completed meal items', () => {
    const completedData: AppData = {
      ...appDataWithBreakfastPlan(),
      mealPlans: [
        {
          ...appDataWithBreakfastPlan().mealPlans[0],
          meals: [
            {
              mealType: 'breakfast',
              items: [
                breakfast.items[0],
                {
                  ...breakfast.items[0],
                  id: 'completed-toast',
                  status: 'completed',
                  locked: true,
                },
              ],
            },
            { mealType: 'lunch', items: [] },
            { mealType: 'dinner', items: [] },
          ],
        },
      ],
    };

    render(<TodayPage appData={completedData} onChange={vi.fn()} t={translations.en} />);

    expect(screen.getByText('Planned')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });
});
