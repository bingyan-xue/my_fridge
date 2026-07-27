import { Trash2 } from 'lucide-react';
import type { Recipe } from '../domain/types';

type RecipeListProps = {
  recipes: Recipe[];
  onDelete: (id: string) => void;
};

const recipeTypeLabels: Record<Recipe['recipeType'], string> = {
  dish: '菜',
  staple: '主食',
  readyToEat: '即食',
  combo: '组合餐',
};

const mealTypeLabels = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  any: '任意',
};

export function RecipeList({ recipes, onDelete }: RecipeListProps) {
  if (recipes.length === 0) {
    return <p className="emptyText">还没有菜谱。</p>;
  }

  return (
    <div className="itemList">
      {recipes.map((recipe) => (
        <article className="listItem" key={recipe.id}>
          <div className="itemHeader">
            <div>
              <h2>{recipe.name}</h2>
              <p>
                {recipeTypeLabels[recipe.recipeType]} · {recipe.mealTypes.map((mealType) => mealTypeLabels[mealType]).join('、')} ·{' '}
                {recipe.source === 'builtIn' ? '内置' : '自建'}
              </p>
            </div>
            {recipe.source === 'userCreated' && (
              <button className="iconButton" type="button" aria-label={`删除${recipe.name}`} onClick={() => onDelete(recipe.id)}>
                <Trash2 aria-hidden="true" size={18} />
              </button>
            )}
          </div>
          <p className="ingredientSummary">
            {recipe.ingredients
              .filter((ingredient) => ingredient.required)
              .map((ingredient) => `${ingredient.name} ${ingredient.quantity}${ingredient.unit}`)
              .join('、')}
          </p>
        </article>
      ))}
    </div>
  );
}
