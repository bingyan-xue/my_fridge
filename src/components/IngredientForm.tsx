import { Plus } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { ingredientCategories } from '../domain/sampleData';
import type { IngredientFormInput } from '../domain/inventory';
import type { IngredientItem, NutritionTag, Unit } from '../domain/types';
import type { Translation } from '../i18n/translations';

type IngredientFormProps = {
  onSubmit: (input: IngredientFormInput) => void;
  t: Translation;
};

const units: Unit[] = ['个', '根', '把', 'g', 'kg', 'ml', 'L', '袋', '盒', '包', '瓶', '斤'];
const storageLocations: Array<IngredientItem['storageLocation']> = ['fridge', 'freezer', 'pantry', 'other'];
const nutritionTags: NutritionTag[] = ['carb', 'protein', 'vegetable', 'fruit', 'dairy', 'fiber', 'fat'];

const defaultInput: IngredientFormInput = {
  name: '',
  category: 'vegetables',
  quantity: 1,
  unit: '个',
  storageLocation: 'fridge',
  expiryDate: '',
  nutritionTags: ['vegetable', 'fiber'],
};

export function IngredientForm({ onSubmit, t }: IngredientFormProps) {
  const [input, setInput] = useState<IngredientFormInput>(defaultInput);

  function update<K extends keyof IngredientFormInput>(key: K, value: IngredientFormInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function updateCategory(category: string) {
    const selected = ingredientCategories.find((item) => item.id === category);
    setInput((current) => ({
      ...current,
      category,
      nutritionTags: selected?.defaultNutritionTags ?? current.nutritionTags,
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.name.trim() || input.quantity <= 0) {
      return;
    }
    onSubmit(input);
    setInput(defaultInput);
  }

  return (
    <form className="formBlock" onSubmit={handleSubmit}>
      <div className="fieldGroup">
        <label htmlFor="ingredient-name">{t.inventory.form.name}</label>
        <input
          id="ingredient-name"
          value={input.name}
          onChange={(event) => update('name', event.target.value)}
          placeholder={t.inventory.form.namePlaceholder}
        />
      </div>

      <div className="formGrid">
        <div className="fieldGroup">
          <label htmlFor="ingredient-category">{t.inventory.form.category}</label>
          <select id="ingredient-category" value={input.category} onChange={(event) => updateCategory(event.target.value)}>
            {ingredientCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {t.labels.category[category.id as keyof typeof t.labels.category] ?? category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="fieldGroup">
          <label htmlFor="ingredient-storage">{t.inventory.form.storage}</label>
          <select
            id="ingredient-storage"
            value={input.storageLocation}
            onChange={(event) => update('storageLocation', event.target.value as IngredientItem['storageLocation'])}
          >
            {storageLocations.map((location) => (
              <option key={location} value={location}>
                {t.labels.storage[location]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="formGrid">
        <div className="fieldGroup">
          <label htmlFor="ingredient-quantity">{t.inventory.form.quantity}</label>
          <input
            id="ingredient-quantity"
            min="0"
            step="0.1"
            type="number"
            value={input.quantity}
            onChange={(event) => update('quantity', Number(event.target.value))}
          />
        </div>

        <div className="fieldGroup">
          <label htmlFor="ingredient-unit">{t.inventory.form.unit}</label>
          <select id="ingredient-unit" value={input.unit} onChange={(event) => update('unit', event.target.value as Unit)}>
            {units.map((unit) => (
              <option key={unit} value={unit}>
                {t.labels.unit[unit]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="fieldGroup">
        <label htmlFor="ingredient-expiry">{t.inventory.form.expiryDate}</label>
        <input id="ingredient-expiry" type="date" value={input.expiryDate} onChange={(event) => update('expiryDate', event.target.value)} />
      </div>

      <fieldset className="tagFieldset">
        <legend>{t.inventory.form.nutritionTags}</legend>
        <div className="tagGrid">
          {nutritionTags.map((tag) => (
            <label key={tag} className="checkTag">
              <input
                checked={input.nutritionTags.includes(tag)}
                type="checkbox"
                onChange={() => toggleNutritionTag(tag)}
              />
              <span>{t.labels.nutrition[tag]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <button className="primaryButton" type="submit">
        <Plus aria-hidden="true" size={18} />
        {t.inventory.form.submit}
      </button>
    </form>
  );
}
