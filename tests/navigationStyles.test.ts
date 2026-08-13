import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const styles = readFileSync('src/styles.css', 'utf8');

function cssBlock(selector: string): string {
  const match = styles.match(new RegExp(`${selector.replaceAll('.', '\\.')}\\s*\\{([^}]+)\\}`));
  return match?.[1] ?? '';
}

describe('bottom navigation styles', () => {
  it('keeps Today visually prominent even when it is not selected', () => {
    const todayButton = cssBlock('.navButtonToday');
    const activeTodayButton = cssBlock('.navButtonToday.navButtonActive');

    expect(todayButton).toContain('background: rgba(28, 107, 120, 0.12)');
    expect(todayButton).toContain('color: var(--deep-teal)');
    expect(activeTodayButton).toContain('background: var(--deep-teal)');
    expect(activeTodayButton).toContain('color: #f8fbfc');
  });
});
