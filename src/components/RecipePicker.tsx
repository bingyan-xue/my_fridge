import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getRecipeInventoryWarnings } from '../domain/planner';
import type { IngredientItem, MealType, NutritionTag, Recipe } from '../domain/types';
import { formatQuantity } from '../i18n/formatters';
import type { Translation } from '../i18n/translations';

type RecipePickerProps = {
  ingredients: IngredientItem[];
  mealType: Exclude<MealType, 'any'>;
  onClose: () => void;
  onSelect: (recipe: Recipe) => void;
  recipes: Recipe[];
  t: Translation;
  today: string;
};

const nutritionOrder: NutritionTag[] = ['carb', 'protein', 'fat', 'fiber', 'vegetable', 'fruit', 'dairy'];

function warningLabel(warning: string, t: Translation): string {
  if (warning === 'missingIngredient') {
    return t.today.picker.warning.missingIngredient;
  }
  if (warning === 'insufficientQuantity') {
    return t.today.picker.warning.insufficientQuantity;
  }
  if (warning === 'unitNeedsConfirmation') {
    return t.today.picker.warning.unitNeedsConfirmation;
  }
  return warning;
}

function pickerText(t: Translation) {
  return t.today.picker;
}

export function RecipePicker({ ingredients, mealType, onClose, onSelect, recipes, t, today }: RecipePickerProps) {
  const copy = pickerText(t);
  const [query, setQuery] = useState('');
  const [selectedNutritionTags, setSelectedNutritionTags] = useState<NutritionTag[]>([]);

  const filteredRecipes = useMemo(
    () =>
      recipes.filter((recipe) => {
        const matchesQuery = recipe.name.toLowerCase().includes(query.trim().toLowerCase());
        const matchesMealType = recipe.mealTypes.includes(mealType) || recipe.mealTypes.includes('any');
        const matchesNutrition =
          selectedNutritionTags.length === 0 || selectedNutritionTags.every((tag) => recipe.nutritionTags.includes(tag));
        return matchesQuery && matchesMealType && matchesNutrition;
      }),
    [mealType, query, recipes, selectedNutritionTags],
  );

  function toggleNutritionTag(tag: NutritionTag) {
    setSelectedNutritionTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]));
  }

  return (
    <div className="modalBackdrop">
      <section aria-label={copy.title} className="recipePickerDialog" role="dialog">
        <div className="itemHeader">
          <div>
            <h2>{copy.title}</h2>
            <p>{t.meal[mealType]}</p>
          </div>
          <button aria-label={copy.close} className="secondaryIconButton" type="button" onClick={onClose}>
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        <label className="fieldGroup compactFieldGroup">
          <span>{copy.search}</span>
          <div className="searchField">
            <Search aria-hidden="true" size={16} />
            <input aria-label={copy.search} value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
        </label>

        <div className="nutritionChipRow" role="group">
          {nutritionOrder.map((tag) => (
            <button
              className={selectedNutritionTags.includes(tag) ? `nutritionChip nutrition-${tag} nutritionChipActive` : `nutritionChip nutrition-${tag}`}
              data-testid="nutrition-filter"
              key={tag}
              type="button"
              onClick={() => toggleNutritionTag(tag)}
            >
              {t.labels.nutrition[tag]}
            </button>
          ))}
        </div>

        <div className="pickerResultList">
          {filteredRecipes.length === 0 ? (
            <p className="emptyText">{copy.noResults}</p>
          ) : (
            filteredRecipes.map((recipe) => {
              const warnings = getRecipeInventoryWarnings(recipe, ingredients, today);
              return (
                <article className="pickerRecipeItem" key={recipe.id}>
                  <div>
                    <h3>{recipe.name}</h3>
                    <p className="ingredientSummary">
                      {recipe.ingredients
                        .filter((ingredient) => ingredient.required)
                        .map((ingredient) => `${ingredient.name} ${formatQuantity(ingredient.quantity, ingredient.unit, t)}`)
                        .join(' / ')}
                    </p>
                  </div>
                  {warnings.length > 0 && (
                    <p className="warningText">{warnings.map((warning) => warningLabel(warning, t)).join(t.format.messageSeparator)}</p>
                  )}
                  <button className="primaryButton" type="button" onClick={() => onSelect(recipe)}>
                    {copy.addRecipe(recipe.name)}
                  </button>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
