import { describe, expect, it } from 'vitest';
import { normalizeIngredientName } from '../src/domain/aliases';

describe('normalizeIngredientName', () => {
  it('maps common aliases to canonical names', () => {
    expect(normalizeIngredientName('番茄')).toBe('西红柿');
    expect(normalizeIngredientName('马铃薯')).toBe('土豆');
    expect(normalizeIngredientName('青菜')).toBe('叶菜');
  });

  it('trims whitespace and keeps unknown names', () => {
    expect(normalizeIngredientName('  牛肉  ')).toBe('牛肉');
  });
});
