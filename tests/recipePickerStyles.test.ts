import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const styles = readFileSync('src/styles.css', 'utf8');

function cssBlock(selector: string): string {
  const match = styles.match(new RegExp(`${selector.replace('.', '\\.')}\\s*\\{([^}]+)\\}`));
  return match?.[1] ?? '';
}

describe('recipe picker layout styles', () => {
  it('keeps the result list scrollable inside the fixed-height dialog', () => {
    const dialog = cssBlock('.recipePickerDialog');
    const resultList = cssBlock('.pickerResultList');

    expect(dialog).toContain('grid-template-rows: auto auto auto minmax(0, 1fr)');
    expect(dialog).toContain('gap: 10px');
    expect(resultList).toContain('min-height: 0');
    expect(resultList).toContain('overflow-y: auto');
  });
});
