import { Trash2 } from 'lucide-react';
import type { Recipe } from '../domain/types';
import type { Translation } from '../i18n/translations';

type RecipeListProps = {
  recipes: Recipe[];
  onDelete: (id: string) => void;
  t: Translation;
};

export function RecipeList({ recipes, onDelete, t }: RecipeListProps) {
  if (recipes.length === 0) {
    return <p className="emptyText">{t.recipes.list.empty}</p>;
  }

  return (
    <div className="itemList">
      {recipes.map((recipe) => (
        <article className="listItem" key={recipe.id}>
          <div className="itemHeader">
            <div>
              <h2>{recipe.name}</h2>
              <p>
                {t.labels.recipeType[recipe.recipeType]} · {recipe.mealTypes.map((mealType) => t.labels.mealType[mealType]).join(' / ')} ·{' '}
                {recipe.source === 'builtIn' ? t.recipes.list.builtIn : t.recipes.list.userCreated}
              </p>
            </div>
            {recipe.source === 'userCreated' && (
              <button className="iconButton" type="button" aria-label={t.recipes.list.deleteLabel(recipe.name)} onClick={() => onDelete(recipe.id)}>
                <Trash2 aria-hidden="true" size={18} />
              </button>
            )}
          </div>
          <p className="ingredientSummary">
            {recipe.ingredients
              .filter((ingredient) => ingredient.required)
              .map((ingredient) => `${ingredient.name} ${ingredient.quantity}${ingredient.unit}`)
              .join(' / ')}
          </p>
        </article>
      ))}
    </div>
  );
}
