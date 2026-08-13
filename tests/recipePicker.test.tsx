import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RecipePicker } from '../src/components/RecipePicker';
import type { IngredientItem, Recipe } from '../src/domain/types';
import { translations } from '../src/i18n/translations';

const today = '2026-08-12';

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
  updatedAt: `${today}T00:00:00.000Z`,
};

const boiledEgg: Recipe = {
  id: 'recipe-egg',
  name: 'Boiled Egg',
  recipeType: 'readyToEat',
  source: 'builtIn',
  mealTypes: ['breakfast'],
  servings: 1,
  ingredients: [{ name: 'Egg', canonicalName: 'Egg', quantity: 50, unit: 'g', required: true }],
  nutritionTags: ['protein', 'fat'],
  createdAt: `${today}T00:00:00.000Z`,
  updatedAt: `${today}T00:00:00.000Z`,
};

const rice: Recipe = {
  id: 'recipe-rice',
  name: 'Rice',
  recipeType: 'staple',
  source: 'builtIn',
  mealTypes: ['any'],
  servings: 1,
  ingredients: [{ name: 'Rice', canonicalName: 'Rice', quantity: 100, unit: 'g', required: true }],
  nutritionTags: ['carb'],
  createdAt: `${today}T00:00:00.000Z`,
  updatedAt: `${today}T00:00:00.000Z`,
};

const lunchOnlyRecipe: Recipe = {
  id: 'recipe-lunch',
  name: 'Lunch Bowl',
  recipeType: 'combo',
  source: 'builtIn',
  mealTypes: ['lunch'],
  servings: 1,
  ingredients: [{ name: 'Egg', canonicalName: 'Egg', quantity: 50, unit: 'g', required: true }],
  nutritionTags: ['protein', 'vegetable'],
  createdAt: `${today}T00:00:00.000Z`,
  updatedAt: `${today}T00:00:00.000Z`,
};

function renderPicker(options: Partial<React.ComponentProps<typeof RecipePicker>> = {}) {
  return render(
    <RecipePicker
      ingredients={[egg]}
      mealType="breakfast"
      onClose={vi.fn()}
      onSelect={vi.fn()}
      recipes={[boiledEgg, rice, lunchOnlyRecipe]}
      t={translations.en}
      today={today}
      {...options}
    />,
  );
}

describe('RecipePicker', () => {
  it('filters recipes by search text', () => {
    renderPicker();

    fireEvent.change(screen.getByLabelText('Search recipes'), { target: { value: 'rice' } });

    expect(screen.getByText('Rice')).toBeInTheDocument();
    expect(screen.queryByText('Boiled Egg')).not.toBeInTheDocument();
  });

  it('orders nutrition filters with carbs protein and fat first', () => {
    renderPicker();

    const labels = screen.getAllByTestId('nutrition-filter').map((button) => button.textContent);

    expect(labels.slice(0, 3)).toEqual(['Carb', 'Protein', 'Fat']);
  });

  it('uses the entry meal type without showing a repeated meal type filter', () => {
    renderPicker({ mealType: 'lunch' });

    expect(screen.queryByLabelText('Meal type')).not.toBeInTheDocument();
    expect(screen.getByText('Lunch Bowl')).toBeInTheDocument();
    expect(screen.getByText('Rice')).toBeInTheDocument();
    expect(screen.queryByText('Boiled Egg')).not.toBeInTheDocument();
  });

  it('allows selecting a recipe with inventory warnings', () => {
    const onSelect = vi.fn();
    renderPicker({ ingredients: [], onSelect });

    expect(screen.getAllByText('Missing ingredients').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: /Add Boiled Egg/ }));

    expect(onSelect).toHaveBeenCalledWith(boiledEgg);
  });
});
