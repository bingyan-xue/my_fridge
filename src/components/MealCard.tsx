import { Check, RefreshCw, RotateCcw } from 'lucide-react';
import type { Meal } from '../domain/types';

type MealCardProps = {
  mealType: 'breakfast' | 'lunch' | 'dinner';
  meal?: Meal;
  failureReason?: string;
  onGenerate: () => void;
  onConfirm: (itemId: string) => void;
  onCancel: (itemId: string) => void;
};

const mealLabels = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
};

export function MealCard({ mealType, meal, failureReason, onGenerate, onConfirm, onCancel }: MealCardProps) {
  const items = meal?.items ?? [];

  return (
    <article className="mealCard">
      <div className="itemHeader">
        <div>
          <h2>{mealLabels[mealType]}</h2>
          <p>{items.length > 0 ? `${items.length} 个餐项` : '还没有生成'}</p>
        </div>
        <button className="secondaryButton" type="button" onClick={onGenerate}>
          <RefreshCw aria-hidden="true" size={16} />
          随机
        </button>
      </div>

      {failureReason && <p className="warningText">{failureReason}</p>}

      {items.length === 0 ? (
        <p className="emptyText">可以先随机生成这一餐。</p>
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
                  取消
                </button>
              ) : (
                <button className="primaryButton" type="button" onClick={() => onConfirm(item.id)}>
                  <Check aria-hidden="true" size={16} />
                  确认
                </button>
              )}
            </section>
          ))}
        </div>
      )}
    </article>
  );
}
