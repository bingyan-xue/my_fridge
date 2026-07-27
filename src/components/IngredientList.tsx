import { Trash2 } from 'lucide-react';
import { getEffectiveExpiryDate, getExpiryStatus } from '../domain/expiry';
import type { IngredientItem } from '../domain/types';

type IngredientListProps = {
  ingredients: IngredientItem[];
  today: string;
  onQuantityChange: (id: string, quantity: number) => void;
  onDelete: (id: string) => void;
};

const storageLabels: Record<IngredientItem['storageLocation'], string> = {
  fridge: '冷藏',
  freezer: '冷冻',
  pantry: '常温',
  other: '其他',
};

const statusLabels = {
  expired: '已过期',
  expiringSoon: '快过期',
  normal: '正常',
  unknown: '未知',
};

export function IngredientList({ ingredients, today, onQuantityChange, onDelete }: IngredientListProps) {
  if (ingredients.length === 0) {
    return <p className="emptyText">还没有库存食材。</p>;
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
                  {storageLabels[item.storageLocation]} · {expiryDate ? `${expiryDate} 过期` : '未设置过期日'}
                </p>
              </div>
              <span className={`statusPill status-${status}`}>{statusLabels[status]}</span>
            </div>

            <div className="quantityRow">
              <label>
                <span>数量</span>
                <input
                  min="0"
                  step="0.1"
                  type="number"
                  value={item.quantity}
                  onChange={(event) => onQuantityChange(item.id, Number(event.target.value))}
                />
              </label>
              <span className="unitText">{item.unit}</span>
              <button className="iconButton" type="button" aria-label={`删除${item.name}`} onClick={() => onDelete(item.id)}>
                <Trash2 aria-hidden="true" size={18} />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
