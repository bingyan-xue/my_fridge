import { describe, expect, it } from 'vitest';
import { normalizeIngredientName } from '../src/domain/aliases';

describe('normalizeIngredientName', () => {
  it('maps common Chinese aliases to English canonical names', () => {
    expect(normalizeIngredientName('番茄')).toBe('Tomato');
    expect(normalizeIngredientName('西红柿')).toBe('Tomato');
    expect(normalizeIngredientName('马铃薯')).toBe('Potato');
    expect(normalizeIngredientName('青菜')).toBe('Leafy Greens');
  });

  it('maps common English aliases case-insensitively', () => {
    expect(normalizeIngredientName('tomatoes')).toBe('Tomato');
    expect(normalizeIngredientName('EGGS')).toBe('Egg');
    expect(normalizeIngredientName(' chicken ')).toBe('Chicken Breast');
  });

  it('trims whitespace and keeps unknown names', () => {
    expect(normalizeIngredientName('  quinoa  ')).toBe('quinoa');
  });
});
