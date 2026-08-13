import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { IngredientList } from '../src/components/IngredientList';
import { MealCard } from '../src/components/MealCard';
import { RecipeList } from '../src/components/RecipeList';
import type { IngredientItem, Meal, Recipe } from '../src/domain/types';
import { translations } from '../src/i18n/translations';

const egg: IngredientItem = {
  id: 'ing-egg',
  name: 'Egg',
  canonicalName: 'Egg',
  category: 'eggs',
  quantity: 6,
  unit: '个',
  storageLocation: 'fridge',
  addedAt: '2026-08-12',
  expirySource: 'default',
  estimatedExpiryDate: '2026-09-02',
  nutritionTags: ['protein'],
  updatedAt: '2026-08-12T00:00:00.000Z',
};

const eggRecipe: Recipe = {
  id: 'recipe-egg',
  name: 'Boiled Egg',
  recipeType: 'readyToEat',
  source: 'builtIn',
  mealTypes: ['breakfast'],
  servings: 1,
  ingredients: [{ name: 'Egg', canonicalName: 'Egg', quantity: 1, unit: '个', required: true }],
  nutritionTags: ['protein'],
  createdAt: '2026-08-12T00:00:00.000Z',
  updatedAt: '2026-08-12T00:00:00.000Z',
};

const breakfast: Meal = {
  mealType: 'breakfast',
  items: [
    {
      id: 'planned-egg',
      recipeSnapshot: eggRecipe,
      plannedServings: 1,
      plannedConsumption: [
        {
          ingredientItemId: 'ing-egg',
          ingredientName: 'Egg',
          canonicalName: 'Egg',
          quantity: 1,
          unit: '个',
          requiresConfirmation: false,
        },
      ],
      status: 'planned',
      reasons: ['补了蛋白质', '生成基础餐'],
      warnings: ['这餐蔬果偏少'],
      locked: false,
    },
  ],
};

describe('localized display text', () => {
  it('formats inventory units in English without exposing Chinese unit values', () => {
    const { container } = render(
      <IngredientList
        ingredients={[egg]}
        today="2026-08-12"
        onDelete={vi.fn()}
        onExpiryDateChange={vi.fn()}
        onQuantityChange={vi.fn()}
        t={translations.en}
      />,
    );

    expect(container.textContent).toContain('pcs');
    expect(container.textContent).not.toContain('个');
  });

  it('formats recipe ingredient units in English without exposing Chinese unit values', () => {
    const { container } = render(
      <RecipeList recipes={[eggRecipe]} onCancelEdit={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} onSubmitEdit={vi.fn()} t={translations.en} />,
    );

    expect(container.textContent).toContain('Egg 1 pcs');
    expect(container.textContent).not.toContain('1个');
  });

  it('formats meal consumption, reasons, and warnings in English', () => {
    const { container } = render(
      <MealCard
        meal={breakfast}
        mealType="breakfast"
        onAddRecipe={vi.fn()}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
        onGenerate={vi.fn()}
        t={translations.en}
      />,
    );

    expect(screen.getByText('Egg 1 pcs')).toBeInTheDocument();
    expect(screen.getByText('Adds protein')).toBeInTheDocument();
    expect(screen.getByText('Basic meal')).toBeInTheDocument();
    expect(screen.getByText('Low on fruit or vegetables')).toBeInTheDocument();
    expect(container.textContent).not.toContain('补了蛋白质');
    expect(container.textContent).not.toContain('这餐蔬果偏少');
    expect(container.textContent).not.toContain('个');
  });

  it('keeps Chinese units and planner text in the Simplified Chinese interface', () => {
    const { container } = render(
      <MealCard
        meal={breakfast}
        mealType="breakfast"
        onAddRecipe={vi.fn()}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
        onGenerate={vi.fn()}
        t={translations['zh-CN']}
      />,
    );

    expect(container.textContent).toContain('Egg 1个');
    expect(container.textContent).toContain('补了蛋白质');
    expect(container.textContent).toContain('这餐蔬果偏少');
  });
});
