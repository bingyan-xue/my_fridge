import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createSampleAppData } from '../src/domain/sampleData';
import { InventoryPage } from '../src/pages/InventoryPage';
import { RecipesPage } from '../src/pages/RecipesPage';
import { translations } from '../src/i18n/translations';

describe('editing pages', () => {
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
