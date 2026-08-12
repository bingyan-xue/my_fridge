import { IngredientForm } from '../components/IngredientForm';
import { IngredientList } from '../components/IngredientList';
import { adjustIngredientQuantity, createIngredientDraft, deleteIngredient, updateIngredientExpiryDate, upsertIngredient } from '../domain/inventory';
import type { AppData } from '../domain/types';
import type { Translation } from '../i18n/translations';

type InventoryPageProps = {
  appData: AppData;
  onChange: (data: AppData) => void;
  t: Translation;
};

function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function InventoryPage({ appData, onChange, t }: InventoryPageProps) {
  const today = getLocalDateString();

  function updateIngredients(ingredients: AppData['ingredients']) {
    onChange({ ...appData, ingredients });
  }

  return (
    <section className="stackPage">
      <h1>{t.inventory.title}</h1>
      <p>{t.inventory.description}</p>
      <IngredientForm
        t={t}
        onSubmit={(input) => {
          updateIngredients(upsertIngredient(appData.ingredients, createIngredientDraft(input, today)));
        }}
      />
      <IngredientList
        ingredients={appData.ingredients}
        t={t}
        today={today}
        onDelete={(id) => updateIngredients(deleteIngredient(appData.ingredients, id))}
        onExpiryDateChange={(id, expiryDate) =>
          updateIngredients(updateIngredientExpiryDate(appData.ingredients, id, expiryDate, new Date().toISOString()))
        }
        onQuantityChange={(id, quantity) => updateIngredients(adjustIngredientQuantity(appData.ingredients, id, quantity, new Date().toISOString()))}
      />
    </section>
  );
}
