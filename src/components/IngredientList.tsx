import { Trash2 } from 'lucide-react';
import { getEffectiveExpiryDate, getExpiryStatus } from '../domain/expiry';
import type { IngredientItem } from '../domain/types';
import type { Translation } from '../i18n/translations';

type IngredientListProps = {
  ingredients: IngredientItem[];
  today: string;
  onQuantityChange: (id: string, quantity: number) => void;
  onDelete: (id: string) => void;
  t: Translation;
};

export function IngredientList({ ingredients, today, onQuantityChange, onDelete, t }: IngredientListProps) {
  if (ingredients.length === 0) {
    return <p className="emptyText">{t.inventory.list.empty}</p>;
  }

  return (
    <div className="itemList">
      {ingredients.map((item) => {
        const status = getExpiryStatus(item, today);
        const expiryDate = getEffectiveExpiryDate(item);
        return (
          <article className="listItem" key={item.id}>
            <div className="itemHeader">
              <div>
                <h2>{item.name}</h2>
                <p>
                  {t.labels.storage[item.storageLocation]} · {expiryDate ? t.inventory.list.expiresOn(expiryDate) : t.inventory.list.expiryMissing}
                </p>
              </div>
              <span className={`statusPill status-${status}`}>{t.labels.expiryStatus[status]}</span>
            </div>

            <div className="quantityRow">
              <label>
                <span>{t.common.quantity}</span>
                <input
                  min="0"
                  step="0.1"
                  type="number"
                  value={item.quantity}
                  onChange={(event) => onQuantityChange(item.id, Number(event.target.value))}
                />
              </label>
              <span className="unitText">{item.unit}</span>
              <button className="iconButton" type="button" aria-label={t.inventory.list.deleteLabel(item.name)} onClick={() => onDelete(item.id)}>
                <Trash2 aria-hidden="true" size={18} />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
