import { IngredientForm } from '../components/IngredientForm';
import { IngredientList } from '../components/IngredientList';
import { adjustIngredientQuantity, createIngredientDraft, deleteIngredient, upsertIngredient } from '../domain/inventory';
import type { AppData } from '../domain/types';

type InventoryPageProps = {
  appData: AppData;
  onChange: (data: AppData) => void;
};

function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function InventoryPage({ appData, onChange }: InventoryPageProps) {
  const today = getLocalDateString();

  function updateIngredients(ingredients: AppData['ingredients']) {
    onChange({ ...appData, ingredients });
  }

  return (
    <section className="stackPage">
      <h1>库存</h1>
      <p>记录家里已有的食材。</p>
      <IngredientForm
        onSubmit={(input) => {
          updateIngredients(upsertIngredient(appData.ingredients, createIngredientDraft(input, today)));
        }}
      />
      <IngredientList
        ingredients={appData.ingredients}
        today={today}
        onDelete={(id) => updateIngredients(deleteIngredient(appData.ingredients, id))}
        onQuantityChange={(id, quantity) => updateIngredients(adjustIngredientQuantity(appData.ingredients, id, quantity, new Date().toISOString()))}
      />
    </section>
  );
}
