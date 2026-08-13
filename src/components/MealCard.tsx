import { Check, Moon, Plus, RefreshCw, RotateCcw, Sparkles, Sun, Sunrise, Trash2 } from 'lucide-react';
import type { Meal } from '../domain/types';
import { formatPlannerMessage, formatQuantity, joinPlannerMessages } from '../i18n/formatters';
import type { Translation } from '../i18n/translations';

type MealCardProps = {
  mealType: 'breakfast' | 'lunch' | 'dinner';
  meal?: Meal;
  failureReason?: string;
  confirmationFailures?: Record<string, string>;
  onAddRecipe: () => void;
  onGenerate: () => void;
  onConfirm: (itemId: string) => void;
  onCancel: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  t: Translation;
};

const mealIcons = {
  breakfast: Sunrise,
  lunch: Sun,
  dinner: Moon,
};

export function MealCard({
  mealType,
  meal,
  failureReason,
  confirmationFailures = {},
  onAddRecipe,
  onGenerate,
  onConfirm,
  onCancel,
  onRemove,
  t,
}: MealCardProps) {
  const items = meal?.items ?? [];
  const MealIcon = mealIcons[mealType];

  return (
    <article className={`mealCard mealCard-${mealType}`}>
      <div className="itemHeader mealCardHeader">
        <div className="mealCardTitleGroup">
          <span className="lineGlyph mealGlyph" aria-hidden="true">
            <MealIcon size={22} />
          </span>
          <div>
            <h2>{t.meal[mealType]}</h2>
            <p>{items.length > 0 ? t.meal.itemCount(items.length) : t.meal.notGenerated}</p>
          </div>
        </div>
        <div className="mealCardActions">
          <button className="secondaryButton" type="button" onClick={onAddRecipe}>
            <Plus aria-hidden="true" size={16} />
            {t.recipes.addRecipe}
          </button>
          <button className="secondaryButton" type="button" onClick={onGenerate}>
            <RefreshCw aria-hidden="true" size={16} />
            {t.meal.generate}
          </button>
        </div>
      </div>

      {failureReason && <p className="warningText">{failureReason}</p>}

      {items.length === 0 ? (
        <div className="emptyShelfSlot">
          <p className="emptyText">{t.meal.empty}</p>
        </div>
      ) : (
        <div className="mealItemList">
          {items.map((item) => (
            <section className={item.status === 'completed' ? 'mealItem mealItemDone' : 'mealItem'} key={item.id}>
              <div className="itemHeader">
                <div className="mealItemMain">
                  <span className="lineGlyph mealItemGlyph" aria-hidden="true">
                    <Sparkles size={18} />
                  </span>
                  <div>
                    <div className="mealItemTitleLine">
                      <h3>{item.recipeSnapshot.name}</h3>
                      <span className={item.status === 'completed' ? 'mealStatusPill mealStatusDone' : 'mealStatusPill'}>
                        {t.meal.status[item.status]}
                      </span>
                    </div>
                    <p>
                      {item.plannedConsumption
                        .map((consumption) => `${consumption.ingredientName} ${formatQuantity(consumption.quantity, consumption.unit, t)}`)
                        .join(' / ')}
                    </p>
                  </div>
                </div>
                {item.status === 'planned' && (
                  <button
                    aria-label={t.meal.removeRecipeLabel(item.recipeSnapshot.name)}
                    className="dangerIconButton"
                    type="button"
                    onClick={() => onRemove(item.id)}
                  >
                    <Trash2 aria-hidden="true" size={16} />
                  </button>
                )}
              </div>

              {item.reasons.length > 0 && (
                <ul className="reasonList">
                  {item.reasons.slice(0, 2).map((reason) => (
                    <li key={reason}>{formatPlannerMessage(reason, t)}</li>
                  ))}
                </ul>
              )}

              {item.warnings.length > 0 && <p className="warningText">{joinPlannerMessages(item.warnings.slice(0, 2), t)}</p>}

              {confirmationFailures[item.id] && <p className="warningText">{confirmationFailures[item.id]}</p>}

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
