import { Plus } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { ingredientCategories } from '../domain/sampleData';
import type { IngredientFormInput } from '../domain/inventory';
import type { IngredientItem, NutritionTag, Unit } from '../domain/types';

type IngredientFormProps = {
  onSubmit: (input: IngredientFormInput) => void;
};

const units: Unit[] = ['个', '根', '把', 'g', 'kg', 'ml', 'L', '袋', '盒', '包', '瓶', '斤'];
const storageLocations: Array<{ value: IngredientItem['storageLocation']; label: string }> = [
  { value: 'fridge', label: '冷藏' },
  { value: 'freezer', label: '冷冻' },
  { value: 'pantry', label: '常温' },
  { value: 'other', label: '其他' },
];
const nutritionTags: Array<{ value: NutritionTag; label: string }> = [
  { value: 'carb', label: '主食' },
  { value: 'protein', label: '蛋白质' },
  { value: 'vegetable', label: '蔬菜' },
  { value: 'fruit', label: '水果' },
  { value: 'dairy', label: '奶制品' },
  { value: 'fiber', label: '纤维' },
  { value: 'fat', label: '脂质' },
];

const defaultInput: IngredientFormInput = {
  name: '',
  category: 'vegetables',
  quantity: 1,
  unit: '个',
  storageLocation: 'fridge',
  expiryDate: '',
  nutritionTags: ['vegetable', 'fiber'],
};

export function IngredientForm({ onSubmit }: IngredientFormProps) {
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
        <label htmlFor="ingredient-name">食材名称</label>
        <input
          id="ingredient-name"
          value={input.name}
          onChange={(event) => update('name', event.target.value)}
          placeholder="例如 鸡蛋"
        />
      </div>

      <div className="formGrid">
        <div className="fieldGroup">
          <label htmlFor="ingredient-category">类别</label>
          <select id="ingredient-category" value={input.category} onChange={(event) => updateCategory(event.target.value)}>
            {ingredientCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="fieldGroup">
          <label htmlFor="ingredient-storage">位置</label>
          <select
            id="ingredient-storage"
            value={input.storageLocation}
            onChange={(event) => update('storageLocation', event.target.value as IngredientItem['storageLocation'])}
          >
            {storageLocations.map((location) => (
              <option key={location.value} value={location.value}>
                {location.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="formGrid">
        <div className="fieldGroup">
          <label htmlFor="ingredient-quantity">数量</label>
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
          <label htmlFor="ingredient-unit">单位</label>
          <select id="ingredient-unit" value={input.unit} onChange={(event) => update('unit', event.target.value as Unit)}>
            {units.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="fieldGroup">
        <label htmlFor="ingredient-expiry">过期日期</label>
        <input id="ingredient-expiry" type="date" value={input.expiryDate} onChange={(event) => update('expiryDate', event.target.value)} />
      </div>

      <fieldset className="tagFieldset">
        <legend>营养标签</legend>
        <div className="tagGrid">
          {nutritionTags.map((tag) => (
            <label key={tag.value} className="checkTag">
              <input
                checked={input.nutritionTags.includes(tag.value)}
                type="checkbox"
                onChange={() => toggleNutritionTag(tag.value)}
              />
              <span>{tag.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <button className="primaryButton" type="submit">
        <Plus aria-hidden="true" size={18} />
        添加食材
      </button>
    </form>
  );
}
