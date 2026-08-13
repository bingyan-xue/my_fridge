import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { RecipeForm } from '../components/RecipeForm';
import { RecipeList } from '../components/RecipeList';
import { createUserRecipe, deleteRecipe, updateRecipeFromInput, upsertRecipe } from '../domain/recipes';
import type { AppData } from '../domain/types';
import type { Translation } from '../i18n/translations';

type RecipesPageProps = {
  appData: AppData;
  onChange: (data: AppData) => void;
  t: Translation;
};

export function RecipesPage({ appData, onChange, t }: RecipesPageProps) {
  const [editingRecipeId, setEditingRecipeId] = useState<string | undefined>();
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  function updateRecipes(recipes: AppData['recipes']) {
    onChange({ ...appData, recipes });
  }

  function deleteRecipeAndRememberBuiltIn(id: string) {
    const recipe = appData.recipes.find((item) => item.id === id);
    const nextData: AppData = {
      ...appData,
      recipes: deleteRecipe(appData.recipes, id),
      settings:
        recipe?.source === 'builtIn'
          ? {
              ...appData.settings,
              deletedBuiltInRecipeIds: Array.from(new Set([...(appData.settings.deletedBuiltInRecipeIds ?? []), id])),
            }
          : appData.settings,
    };
    if (editingRecipeId === id) {
      setEditingRecipeId(undefined);
    }
    onChange(nextData);
  }

  return (
    <section className="stackPage">
      <h1>{t.recipes.title}</h1>
      <p>{t.recipes.description}</p>
      <button className="formToggleButton" type="button" aria-expanded={isAddFormOpen} onClick={() => setIsAddFormOpen((current) => !current)}>
        {isAddFormOpen ? <X aria-hidden="true" size={18} /> : <Plus aria-hidden="true" size={18} />}
        {isAddFormOpen ? t.common.cancel : t.recipes.addRecipe}
      </button>
      {isAddFormOpen && (
        <RecipeForm
          t={t}
          onSubmit={(input) => {
            const now = new Date().toISOString();
            updateRecipes(upsertRecipe(appData.recipes, createUserRecipe(input, now)));
            setIsAddFormOpen(false);
          }}
        />
      )}
      <RecipeList
        editingRecipeId={editingRecipeId}
        recipes={appData.recipes}
        t={t}
        onCancelEdit={() => setEditingRecipeId(undefined)}
        onEdit={(id) => setEditingRecipeId(id)}
        onSubmitEdit={(recipe, input) => {
          updateRecipes(upsertRecipe(appData.recipes, updateRecipeFromInput(recipe, input, new Date().toISOString())));
          setEditingRecipeId(undefined);
        }}
        onDelete={deleteRecipeAndRememberBuiltIn}
      />
    </section>
  );
}
