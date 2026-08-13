import { CalendarClock, Tag, Trash2 } from 'lucide-react';
import { getEffectiveExpiryDate, getExpiryStatus } from '../domain/expiry';
import type { IngredientItem } from '../domain/types';
import type { Translation } from '../i18n/translations';

type IngredientListProps = {
  ingredients: IngredientItem[];
  today: string;
  onQuantityChange: (id: string, quantity: number) => void;
  onExpiryDateChange: (id: string, expiryDate: string) => void;
  onDelete: (id: string) => void;
  t: Translation;
};

export function IngredientList({ ingredients, today, onQuantityChange, onExpiryDateChange, onDelete, t }: IngredientListProps) {
  if (ingredients.length === 0) {
    return <p className="emptyText">{t.inventory.list.empty}</p>;
  }

  return (
    <div className="itemList">
      {ingredients.map((item) => {
        const status = getExpiryStatus(item, today);
        const expiryDate = getEffectiveExpiryDate(item);
        return (
          <article className={`listItem inventoryItem freshness-${status}`} key={item.id}>
            <div className="itemHeader">
              <div className="itemTitleGroup">
                <span className="lineGlyph ingredientGlyph" aria-hidden="true">
                  <Tag size={20} />
                </span>
                <div>
                  <h2>{item.name}</h2>
                  <p>
                    {t.labels.storage[item.storageLocation]} · {expiryDate ? t.inventory.list.expiresOn(expiryDate) : t.inventory.list.expiryMissing}
                  </p>
                </div>
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
              <span className="unitText">{t.labels.unit[item.unit]}</span>
              <button className="iconButton" type="button" aria-label={t.inventory.list.deleteLabel(item.name)} onClick={() => onDelete(item.id)}>
                <Trash2 aria-hidden="true" size={18} />
              </button>
            </div>

            <label className="fieldGroup expiryField">
              <CalendarClock aria-hidden="true" size={16} />
              <span>{t.inventory.list.expiryDateLabel(item.name)}</span>
              <input type="date" value={expiryDate ?? ''} onChange={(event) => onExpiryDateChange(item.id, event.target.value)} />
            </label>
          </article>
        );
      })}
    </div>
  );
}
