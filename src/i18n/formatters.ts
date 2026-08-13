import type { Unit } from '../domain/types';
import type { Translation } from './translations';

const expiringSoonPrefix = '\u7528\u4e86\u5feb\u8fc7\u671f\u7684';

function isEnglish(t: Translation): boolean {
  return t.nav.today === 'Today';
}

export function formatQuantity(quantity: number, unit: Unit, t: Translation): string {
  const unitLabel = t.labels.unit[unit];
  return `${quantity}${t.format.quantityUnitSeparator}${unitLabel}`;
}

export function formatPlannerMessage(message: string, t: Translation): string {
  if (message === '\u8865\u4e86\u86cb\u767d\u8d28') {
    return t.plannerMessage.addsProtein;
  }
  if (message === '\u751f\u6210\u57fa\u7840\u9910') {
    return t.plannerMessage.basicMeal;
  }
  if (message === '\u8fd9\u9910\u86cb\u767d\u8d28\u504f\u5c11') {
    return t.plannerMessage.lowProtein;
  }
  if (message === '\u8fd9\u9910\u852c\u679c\u504f\u5c11') {
    return t.plannerMessage.lowFruitOrVegetables;
  }
  if (message.startsWith(expiringSoonPrefix)) {
    return t.plannerMessage.usesExpiringSoon(message.slice(expiringSoonPrefix.length));
  }
  if (message === 'missingIngredient') {
    return isEnglish(t) ? 'Missing ingredients' : '\u7f3a\u5c11\u98df\u6750';
  }
  if (message === 'insufficientQuantity') {
    return isEnglish(t) ? 'Not enough quantity' : '\u6570\u91cf\u4e0d\u8db3';
  }
  if (message === 'unitNeedsConfirmation') {
    return isEnglish(t) ? 'Unit needs review' : '\u5355\u4f4d\u9700\u8981\u786e\u8ba4';
  }

  return message;
}

export function joinPlannerMessages(messages: string[], t: Translation): string {
  return messages.map((message) => formatPlannerMessage(message, t)).join(t.format.messageSeparator);
}
