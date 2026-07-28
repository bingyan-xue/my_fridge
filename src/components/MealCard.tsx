import { Check, RefreshCw, RotateCcw } from 'lucide-react';
import type { Meal } from '../domain/types';
import type { Translation } from '../i18n/translations';

type MealCardProps = {
  mealType: 'breakfast' | 'lunch' | 'dinner';
  meal?: Meal;
  failureReason?: string;
  onGenerate: () => void;
  onConfirm: (itemId: string) => void;
  onCancel: (itemId: string) => void;
  t: Translation;
};

export function MealCard({ mealType, meal, failureReason, onGenerate, onConfirm, onCancel, t }: MealCardProps) {
  const items = meal?.items ?? [];

  return (
    <article className="mealCard">
      <div className="itemHeader">
        <div>
          <h2>{t.meal[mealType]}</h2>
          <p>{items.length > 0 ? t.meal.itemCount(items.length) : t.meal.notGenerated}</p>
        </div>
        <button className="secondaryButton" type="button" onClick={onGenerate}>
          <RefreshCw aria-hidden="true" size={16} />
          {t.meal.generate}
        </button>
      </div>

      {failureReason && <p className="warningText">{failureReason}</p>}

      {items.length === 0 ? (
        <p className="emptyText">{t.meal.empty}</p>
      ) : (
        <div className="mealItemList">
          {items.map((item) => (
            <section className={item.status === 'completed' ? 'mealItem mealItemDone' : 'mealItem'} key={item.id}>
              <div>
                <h3>{item.recipeSnapshot.name}</h3>
                <p>
                  {item.plannedConsumption.map((consumption) => `${consumption.ingredientName} ${consumption.quantity}${consumption.unit}`).join('、')}
                </p>
              </div>

              {item.reasons.length > 0 && (
                <ul className="reasonList">
                  {item.reasons.slice(0, 2).map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              )}

              {item.warnings.length > 0 && <p className="warningText">{item.warnings.slice(0, 2).join('；')}</p>}

              {item.status === 'completed' ? (
                <button className="secondaryButton" type="button" onClick={() => onCancel(item.id)}>
                  <RotateCcw aria-hidden="true" size={16} />
                  {t.meal.cancel}
                </button>
              ) : (
                <button className="primaryButton" type="button" onClick={() => onConfirm(item.id)}>
                  <Check aria-hidden="true" size={16} />
                  {t.meal.confirm}
                </button>
              )}
            </section>
          ))}
        </div>
      )}
    </article>
  );
}
