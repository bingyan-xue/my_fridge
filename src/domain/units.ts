import type { Unit } from './types';

const conversionRates: Partial<Record<Unit, Partial<Record<Unit, number>>>> = {
  kg: { g: 1000, 斤: 2 },
  g: { kg: 0.001, 斤: 1 / 500 },
  L: { ml: 1000 },
  ml: { L: 0.001 },
  斤: { g: 500, kg: 0.5 },
};

export function convertQuantity(quantity: number, from: Unit, to: Unit): number | null {
  if (from === to) {
    return quantity;
  }

  const rate = conversionRates[from]?.[to];
  return typeof rate === 'number' ? quantity * rate : null;
}

export function unitsAreCompatible(from: Unit, to: Unit): boolean {
  return convertQuantity(1, from, to) !== null;
}
