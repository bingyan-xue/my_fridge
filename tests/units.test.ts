import { describe, expect, it } from 'vitest';
import { convertQuantity } from '../src/domain/units';

describe('convertQuantity', () => {
  it('converts kg to g', () => {
    expect(convertQuantity(1.5, 'kg', 'g')).toBe(1500);
  });

  it('converts g to kg', () => {
    expect(convertQuantity(750, 'g', 'kg')).toBe(0.75);
  });

  it('converts L to ml', () => {
    expect(convertQuantity(2, 'L', 'ml')).toBe(2000);
  });

  it('converts jin to g using 1 jin = 500g', () => {
    expect(convertQuantity(2, '斤', 'g')).toBe(1000);
  });

  it('returns null for non-deterministic conversion', () => {
    expect(convertQuantity(1, '个', 'g')).toBeNull();
  });
});
