import { Plus, X } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import type { RecipeFormInput } from '../domain/recipes';
import type { MealType, NutritionTag, Recipe, Unit } from '../domain/types';

type RecipeFormProps = {
  onSubmit: (input: RecipeFormInput) => void;
};

const units: Unit[] = ['个', '根', '把', 'g', 'kg', 'ml', 'L', '袋', '盒', '包', '瓶', '斤'];
const recipeTypes: Array<{ value: Recipe['recipeType']; label: string }> = [
  { value: 'dish', label: '菜' },
  { value: 'staple', label: '主食' },
  { value: 'readyToEat', label: '即食' },
  { value: 'combo', label: '组合餐' },
];
const mealTypes: Array<{ value: MealType; label: string }> = [
  { value: 'breakfast', label: '早餐' },
  { value: 'lunch', label: '午餐' },
  { value: 'dinner', label: '晚餐' },
  { value: 'any', label: '任意' },
];
const nutritionTags: Array<{ value: NutritionTag; label: string }> = [
  { value: 'carb', label: '主食' },
  { value: 'protein', label: '蛋白质' },
  { value: 'vegetable', label: '蔬菜' },
  { value: 'fiber', label: '纤维' },
  { value: 'fat', label: '脂质' },
  { value: 'fruit', label: '水果' },
  { value: 'dairy', label: '奶制品' },
];

const defaultIngredient = { name: '', quantity: 1, unit: '个' as Unit, required: true };
const defaultInput: RecipeFormInput = {
  name: '',
  recipeType: 'dish',
  mealTypes: ['lunch', 'dinner'],
  servings: 1,
  ingredients: [defaultIngredient],
  nutritionTags: ['protein'],
};

export function RecipeForm({ onSubmit }: RecipeFormProps) {
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
        <label htmlFor="recipe-name">菜谱名称</label>
        <input id="recipe-name" value={input.name} onChange={(event) => update('name', event.target.value)} placeholder="例如 西红柿炒蛋" />
      </div>

      <div className="formGrid">
        <div className="fieldGroup">
          <label htmlFor="recipe-type">类型</label>
          <select id="recipe-type" value={input.recipeType} onChange={(event) => update('recipeType', event.target.value as Recipe['recipeType'])}>
            {recipeTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div className="fieldGroup">
          <label htmlFor="recipe-servings">份数</label>
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
        <legend>适用餐次</legend>
        <div className="tagGrid">
          {mealTypes.map((mealType) => (
            <label key={mealType.value} className="checkTag">
              <input checked={input.mealTypes.includes(mealType.value)} type="checkbox" onChange={() => toggleMealType(mealType.value)} />
              <span>{mealType.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="tagFieldset">
        <legend>所需食材</legend>
        <div className="recipeIngredientRows">
          {input.ingredients.map((ingredient, index) => (
            <div className="recipeIngredientRow" key={index}>
              <input
                aria-label={`食材${index + 1}名称`}
                value={ingredient.name}
                onChange={(event) => updateIngredient(index, { name: event.target.value })}
                placeholder="食材"
              />
              <input
                aria-label={`食材${index + 1}数量`}
                min="0"
                step="0.1"
                type="number"
                value={ingredient.quantity}
                onChange={(event) => updateIngredient(index, { quantity: Number(event.target.value) })}
              />
              <select
                aria-label={`食材${index + 1}单位`}
                value={ingredient.unit}
                onChange={(event) => updateIngredient(index, { unit: event.target.value as Unit })}
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              <label className="compactCheck">
                <input
                  checked={ingredient.required}
                  type="checkbox"
                  onChange={(event) => updateIngredient(index, { required: event.target.checked })}
                />
                必需
              </label>
              <button className="iconButton" disabled={input.ingredients.length === 1} type="button" aria-label="删除食材行" onClick={() => removeIngredient(index)}>
                <X aria-hidden="true" size={16} />
              </button>
            </div>
          ))}
        </div>
        <button className="secondaryButton" type="button" onClick={() => update('ingredients', [...input.ingredients, defaultIngredient])}>
          <Plus aria-hidden="true" size={16} />
          添加食材行
        </button>
      </fieldset>

      <fieldset className="tagFieldset">
        <legend>营养标签</legend>
        <div className="tagGrid">
          {nutritionTags.map((tag) => (
            <label key={tag.value} className="checkTag">
              <input checked={input.nutritionTags.includes(tag.value)} type="checkbox" onChange={() => toggleNutritionTag(tag.value)} />
              <span>{tag.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <button className="primaryButton" type="submit">
        <Plus aria-hidden="true" size={18} />
        保存菜谱
      </button>
    </form>
  );
}
