import type { Unit } from '../domain/types';
import type { Translation } from './translations';

const expiringSoonPrefix = '用了快过期的';

export function formatQuantity(quantity: number, unit: Unit, t: Translation): string {
  const unitLabel = t.labels.unit[unit];
  return `${quantity}${t.format.quantityUnitSeparator}${unitLabel}`;
}

export function formatPlannerMessage(message: string, t: Translation): string {
  if (message === '补了蛋白质') {
    return t.plannerMessage.addsProtein;
  }
  if (message === '生成基础餐') {
    return t.plannerMessage.basicMeal;
  }
  if (message === '这餐蛋白质偏少') {
    return t.plannerMessage.lowProtein;
  }
  if (message === '这餐蔬果偏少') {
    return t.plannerMessage.lowFruitOrVegetables;
  }
  if (message.startsWith(expiringSoonPrefix)) {
    return t.plannerMessage.usesExpiringSoon(message.slice(expiringSoonPrefix.length));
  }

  return message;
}

export function joinPlannerMessages(messages: string[], t: Translation): string {
  return messages.map((message) => formatPlannerMessage(message, t)).join(t.format.messageSeparator);
}
