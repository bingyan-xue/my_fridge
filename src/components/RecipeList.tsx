import { Pencil, Trash2 } from 'lucide-react';
import { RecipeForm } from './RecipeForm';
import type { RecipeFormInput } from '../domain/recipes';
import type { Recipe } from '../domain/types';
import { formatQuantity } from '../i18n/formatters';
import type { Translation } from '../i18n/translations';

type RecipeListProps = {
  editingRecipeId?: string;
  recipes: Recipe[];
  onCancelEdit: () => void;
  onEdit: (id: string) => void;
  onSubmitEdit: (recipe: Recipe, input: RecipeFormInput) => void;
  onDelete: (id: string) => void;
  t: Translation;
};

export function RecipeList({ editingRecipeId, recipes, onCancelEdit, onEdit, onSubmitEdit, onDelete, t }: RecipeListProps) {
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
            <div className="itemActions">
              <button className="secondaryIconButton" type="button" aria-label={t.recipes.list.editLabel(recipe.name)} onClick={() => onEdit(recipe.id)}>
                <Pencil aria-hidden="true" size={18} />
              </button>
              <button className="iconButton" type="button" aria-label={t.recipes.list.deleteLabel(recipe.name)} onClick={() => onDelete(recipe.id)}>
                <Trash2 aria-hidden="true" size={18} />
              </button>
            </div>
          </div>
          <p className="ingredientSummary">
            {recipe.ingredients
              .filter((ingredient) => ingredient.required)
            .map((ingredient) => `${ingredient.name} ${formatQuantity(ingredient.quantity, ingredient.unit, t)}`)
            .join(' / ')}
          </p>
          {editingRecipeId === recipe.id && (
            <RecipeForm editingRecipe={recipe} onCancelEdit={onCancelEdit} onSubmit={(input) => onSubmitEdit(recipe, input)} t={t} />
          )}
        </article>
      ))}
    </div>
  );
}
