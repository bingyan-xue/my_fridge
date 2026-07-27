import { RecipeForm } from '../components/RecipeForm';
import { RecipeList } from '../components/RecipeList';
import { createUserRecipe, deleteRecipe, upsertRecipe } from '../domain/recipes';
import type { AppData } from '../domain/types';

type RecipesPageProps = {
  appData: AppData;
  onChange: (data: AppData) => void;
};

export function RecipesPage({ appData, onChange }: RecipesPageProps) {
  function updateRecipes(recipes: AppData['recipes']) {
    onChange({ ...appData, recipes });
  }

  return (
    <section className="stackPage">
      <h1>菜谱</h1>
      <p>管理内置菜谱和自建菜谱。</p>
      <RecipeForm
        onSubmit={(input) => {
          updateRecipes(upsertRecipe(appData.recipes, createUserRecipe(input, new Date().toISOString())));
        }}
      />
      <RecipeList
        recipes={appData.recipes}
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
