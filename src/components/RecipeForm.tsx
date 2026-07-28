import { Plus, X } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import type { RecipeFormInput } from '../domain/recipes';
import type { MealType, NutritionTag, Recipe, Unit } from '../domain/types';
import type { Translation } from '../i18n/translations';

type RecipeFormProps = {
  onSubmit: (input: RecipeFormInput) => void;
  t: Translation;
};

const units: Unit[] = ['个', '根', '把', 'g', 'kg', 'ml', 'L', '袋', '盒', '包', '瓶', '斤'];
const recipeTypes: Recipe['recipeType'][] = ['dish', 'staple', 'readyToEat', 'combo'];
const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'any'];
const nutritionTags: NutritionTag[] = ['carb', 'protein', 'vegetable', 'fiber', 'fat', 'fruit', 'dairy'];

const defaultIngredient = { name: '', quantity: 1, unit: '个' as Unit, required: true };
const defaultInput: RecipeFormInput = {
  name: '',
  recipeType: 'dish',
  mealTypes: ['lunch', 'dinner'],
  servings: 1,
  ingredients: [defaultIngredient],
  nutritionTags: ['protein'],
};

export function RecipeForm({ onSubmit, t }: RecipeFormProps) {
  const [input, setInput] = useState<RecipeFormInput>(defaultInput);

  function update<K extends keyof RecipeFormInput>(key: K, value: RecipeFormInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function toggleMealType(mealType: MealType) {
    setInput((current) => ({
      ...current,
      mealTypes: current.mealTypes.includes(mealType)
        ? current.mealTypes.filter((item) => item !== mealType)
        : [...current.mealTypes, mealType],
    }));
  }

  function toggleNutritionTag(tag: NutritionTag) {
    setInput((current) => ({
      ...current,
      nutritionTags: current.nutritionTags.includes(tag)
        ? current.nutritionTags.filter((item) => item !== tag)
        : [...current.nutritionTags, tag],
    }));
  }

  function updateIngredient(index: number, patch: Partial<RecipeFormInput['ingredients'][number]>) {
    setInput((current) => ({
      ...current,
      ingredients: current.ingredients.map((ingredient, candidateIndex) =>
        candidateIndex === index ? { ...ingredient, ...patch } : ingredient,
      ),
    }));
  }

  function removeIngredient(index: number) {
    setInput((current) => ({
      ...current,
      ingredients: current.ingredients.filter((_, candidateIndex) => candidateIndex !== index),
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ingredients = input.ingredients.filter((ingredient) => ingredient.name.trim() && ingredient.quantity > 0);
    if (!input.name.trim() || ingredients.length === 0 || input.mealTypes.length === 0) {
      return;
    }
    onSubmit({ ...input, ingredients });
    setInput(defaultInput);
  }

  return (
    <form className="formBlock" onSubmit={handleSubmit}>
      <div className="fieldGroup">
        <label htmlFor="recipe-name">{t.recipes.form.name}</label>
        <input id="recipe-name" value={input.name} onChange={(event) => update('name', event.target.value)} placeholder={t.recipes.form.namePlaceholder} />
      </div>

      <div className="formGrid">
        <div className="fieldGroup">
          <label htmlFor="recipe-type">{t.recipes.form.type}</label>
          <select id="recipe-type" value={input.recipeType} onChange={(event) => update('recipeType', event.target.value as Recipe['recipeType'])}>
            {recipeTypes.map((type) => (
              <option key={type} value={type}>
                {t.labels.recipeType[type]}
              </option>
            ))}
          </select>
        </div>
        <div className="fieldGroup">
          <label htmlFor="recipe-servings">{t.recipes.form.servings}</label>
          <input
            id="recipe-servings"
            min="1"
            step="1"
            type="number"
            value={input.servings}
            onChange={(event) => update('servings', Number(event.target.value))}
          />
        </div>
      </div>

      <fieldset className="tagFieldset">
        <legend>{t.recipes.form.mealTypes}</legend>
        <div className="tagGrid">
          {mealTypes.map((mealType) => (
            <label key={mealType} className="checkTag">
              <input checked={input.mealTypes.includes(mealType)} type="checkbox" onChange={() => toggleMealType(mealType)} />
              <span>{t.labels.mealType[mealType]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="tagFieldset">
        <legend>{t.recipes.form.ingredients}</legend>
        <div className="recipeIngredientRows">
          {input.ingredients.map((ingredient, index) => (
            <div className="recipeIngredientRow" key={index}>
              <input
                aria-label={t.recipes.form.ingredientNameLabel(index + 1)}
                value={ingredient.name}
                onChange={(event) => updateIngredient(index, { name: event.target.value })}
                placeholder={t.recipes.form.ingredientPlaceholder}
              />
              <input
                aria-label={t.recipes.form.ingredientQuantityLabel(index + 1)}
                min="0"
                step="0.1"
                type="number"
                value={ingredient.quantity}
                onChange={(event) => updateIngredient(index, { quantity: Number(event.target.value) })}
              />
              <select
                aria-label={t.recipes.form.ingredientUnitLabel(index + 1)}
                value={ingredient.unit}
                onChange={(event) => updateIngredient(index, { unit: event.target.value as Unit })}
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {t.labels.unit[unit]}
                  </option>
                ))}
              </select>
              <label className="compactCheck">
                <input
                  checked={ingredient.required}
                  type="checkbox"
                  onChange={(event) => updateIngredient(index, { required: event.target.checked })}
                />
                {t.recipes.form.required}
              </label>
              <button className="iconButton" disabled={input.ingredients.length === 1} type="button" aria-label={t.recipes.form.deleteIngredientRow} onClick={() => removeIngredient(index)}>
                <X aria-hidden="true" size={16} />
              </button>
            </div>
          ))}
        </div>
        <button className="secondaryButton" type="button" onClick={() => update('ingredients', [...input.ingredients, defaultIngredient])}>
          <Plus aria-hidden="true" size={16} />
          {t.recipes.form.addIngredientRow}
        </button>
      </fieldset>

      <fieldset className="tagFieldset">
        <legend>{t.recipes.form.nutritionTags}</legend>
        <div className="tagGrid">
          {nutritionTags.map((tag) => (
            <label key={tag} className="checkTag">
              <input checked={input.nutritionTags.includes(tag)} type="checkbox" onChange={() => toggleNutritionTag(tag)} />
              <span>{t.labels.nutrition[tag]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <button className="primaryButton" type="submit">
        <Plus aria-hidden="true" size={18} />
        {t.recipes.form.submit}
      </button>
    </form>
  );
}
