import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const styles = readFileSync('src/styles.css', 'utf8');

function cssBlock(selector: string): string {
  const match = styles.match(new RegExp(`${selector.replace('.', '\\.')}\\s*\\{([^}]+)\\}`));
  return match?.[1] ?? '';
}

describe('top settings layout', () => {
  it('keeps the top settings button above page content', () => {
    const settingsButton = cssBlock('.settingsTopButton');

    expect(settingsButton).toContain('z-index: 2');
  });

  it('keeps the Today heading area unframed like the other main pages', () => {
    const todayHeader = cssBlock('.todayHeaderPanel');
    const summaryRail = cssBlock('.todaySummaryRail');

    expect(todayHeader).toBe('');
    expect(summaryRail).not.toContain('z-index');
  });
});
