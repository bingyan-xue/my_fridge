import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createSampleAppData } from '../src/domain/sampleData';
import { InventoryPage } from '../src/pages/InventoryPage';
import { RecipesPage } from '../src/pages/RecipesPage';
import { translations } from '../src/i18n/translations';

describe('editing pages', () => {
  it('summarizes inventory freshness before the item list', () => {
    const appData = createSampleAppData();
    const onChange = vi.fn();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-12T12:00:00.000Z'));
    const ingredients = appData.ingredients.slice(0, 4).map((ingredient, index) => ({
      ...ingredient,
      expiryDate: index === 0 ? '2026-08-10' : index === 1 ? '2026-08-13' : index === 2 ? '2026-08-20' : undefined,
      estimatedExpiryDate: undefined,
    }));

    render(<InventoryPage appData={{ ...appData, ingredients }} onChange={onChange} t={translations.en} />);

    const summary = screen.getByRole('region', { name: 'Inventory freshness summary' });
    expect(within(summary).getAllByText('1')).toHaveLength(4);
    expect(within(summary).getByText('Expired')).toBeInTheDocument();
    expect(within(summary).getByText('Expiring soon')).toBeInTheDocument();
    expect(within(summary).getByText('Good')).toBeInTheDocument();
    expect(within(summary).getByText('Unknown')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('keeps the add ingredient form collapsed until requested', () => {
    const appData = createSampleAppData();
    const onChange = vi.fn();

    render(<InventoryPage appData={appData} onChange={onChange} t={translations.en} />);

    expect(screen.queryByLabelText('Ingredient name')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add ingredient' }));

    expect(screen.getByLabelText('Ingredient name')).toBeInTheDocument();
  });

  it('keeps the add recipe form collapsed until requested', () => {
    const appData = createSampleAppData();
    const onChange = vi.fn();

    render(<RecipesPage appData={appData} onChange={onChange} t={translations.en} />);

    expect(screen.queryByLabelText('Recipe name')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add recipe' }));

    expect(screen.getByLabelText('Recipe name')).toBeInTheDocument();
  });

  it('updates an inventory item expiry date from the list', () => {
    const appData = createSampleAppData();
    const onChange = vi.fn();

    render(<InventoryPage appData={appData} onChange={onChange} t={translations.en} />);

    fireEvent.change(screen.getByLabelText('Expiry date for Egg'), { target: { value: '2026-08-20' } });

    const nextData = onChange.mock.calls.at(-1)?.[0];
    expect(nextData.ingredients.find((ingredient) => ingredient.id === 'ing-eggs')).toMatchObject({
      expiryDate: '2026-08-20',
      expirySource: 'user',
      estimatedExpiryDate: undefined,
    });
  });

  it('edits an existing built-in recipe from the recipe page', () => {
    const appData = createSampleAppData();
    const onChange = vi.fn();

    render(<RecipesPage appData={appData} onChange={onChange} t={translations.en} />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit Tomato Eggs' }));
    const tomatoEggsCard = screen.getByRole('heading', { name: 'Tomato Eggs' }).closest('article');
    expect(tomatoEggsCard).not.toBeNull();
    const card = within(tomatoEggsCard as HTMLElement);
    fireEvent.change(card.getByLabelText('Ingredient 1 quantity'), { target: { value: '2' } });
    fireEvent.click(card.getByRole('button', { name: 'Update recipe' }));

    const nextData = onChange.mock.calls.at(-1)?.[0];
    const updatedRecipe = nextData.recipes.find((recipe) => recipe.id === 'recipe-tomato-egg');
    expect(updatedRecipe).toMatchObject({
      id: 'recipe-tomato-egg',
      source: 'builtIn',
    });
    expect(updatedRecipe.ingredients[0]).toMatchObject({
      name: 'Tomato',
      quantity: 2,
      unit: '个',
    });
  });

  it('deletes a built-in recipe and records that deletion in settings', () => {
    const appData = createSampleAppData();
    const onChange = vi.fn();

    render(<RecipesPage appData={appData} onChange={onChange} t={translations.en} />);

    fireEvent.click(screen.getByRole('button', { name: 'Delete Tomato Eggs' }));

    const nextData = onChange.mock.calls.at(-1)?.[0];
    expect(nextData.recipes.some((recipe) => recipe.id === 'recipe-tomato-egg')).toBe(false);
    expect(nextData.settings.deletedBuiltInRecipeIds).toEqual(['recipe-tomato-egg']);
  });
});
