import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { IngredientForm } from '../components/IngredientForm';
import { IngredientList } from '../components/IngredientList';
import { getExpiryStatus } from '../domain/expiry';
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
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const freshnessCounts = appData.ingredients.reduce(
    (counts, ingredient) => {
      counts[getExpiryStatus(ingredient, today)] += 1;
      return counts;
    },
    { expired: 0, expiringSoon: 0, normal: 0, unknown: 0 },
  );

  function updateIngredients(ingredients: AppData['ingredients']) {
    onChange({ ...appData, ingredients });
  }

  return (
    <section className="stackPage">
      <h1>{t.inventory.title}</h1>
      <p>{t.inventory.description}</p>
      <section className="inventorySummary" aria-label={t.inventory.summary.ariaLabel}>
        <div className="summaryTile freshness-expired">
          <strong>{freshnessCounts.expired}</strong>
          <span>{t.labels.expiryStatus.expired}</span>
        </div>
        <div className="summaryTile freshness-expiringSoon">
          <strong>{freshnessCounts.expiringSoon}</strong>
          <span>{t.labels.expiryStatus.expiringSoon}</span>
        </div>
        <div className="summaryTile freshness-normal">
          <strong>{freshnessCounts.normal}</strong>
          <span>{t.labels.expiryStatus.normal}</span>
        </div>
        <div className="summaryTile freshness-unknown">
          <strong>{freshnessCounts.unknown}</strong>
          <span>{t.labels.expiryStatus.unknown}</span>
        </div>
      </section>
      <button className="formToggleButton" type="button" aria-expanded={isAddFormOpen} onClick={() => setIsAddFormOpen((current) => !current)}>
        {isAddFormOpen ? <X aria-hidden="true" size={18} /> : <Plus aria-hidden="true" size={18} />}
        {isAddFormOpen ? t.common.cancel : t.inventory.form.submit}
      </button>
      {isAddFormOpen && (
        <IngredientForm
          t={t}
          onSubmit={(input) => {
            updateIngredients(upsertIngredient(appData.ingredients, createIngredientDraft(input, today)));
            setIsAddFormOpen(false);
          }}
        />
      )}
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
