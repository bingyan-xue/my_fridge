import { RecipeForm } from '../components/RecipeForm';
import { RecipeList } from '../components/RecipeList';
import { createUserRecipe, deleteRecipe, upsertRecipe } from '../domain/recipes';
import type { AppData } from '../domain/types';
import type { Translation } from '../i18n/translations';

type RecipesPageProps = {
  appData: AppData;
  onChange: (data: AppData) => void;
  t: Translation;
};

export function RecipesPage({ appData, onChange, t }: RecipesPageProps) {
  function updateRecipes(recipes: AppData['recipes']) {
    onChange({ ...appData, recipes });
  }

  return (
    <section className="stackPage">
      <h1>{t.recipes.title}</h1>
      <p>{t.recipes.description}</p>
      <RecipeForm
        t={t}
        onSubmit={(input) => {
          updateRecipes(upsertRecipe(appData.recipes, createUserRecipe(input, new Date().toISOString())));
        }}
      />
      <RecipeList
        recipes={appData.recipes}
        t={t}
        onDelete={(id) => {
          const recipe = appData.recipes.find((item) => item.id === id);
          if (recipe?.source === 'userCreated') {
            updateRecipes(deleteRecipe(appData.recipes, id));
          }
        }}
      />
    </section>
  );
}
