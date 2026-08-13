import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('GitHub Pages deployment config', () => {
  it('builds asset URLs under the repository project path', () => {
    const viteConfig = readFileSync('vite.config.ts', 'utf8');

    expect(viteConfig).toContain("base: '/my_fridge/'");
  });

  it('uses the Vite base URL for HTML entry assets', () => {
    const indexHtml = readFileSync('index.html', 'utf8');

    expect(indexHtml).toContain('href="%BASE_URL%manifest.webmanifest"');
    expect(indexHtml).toContain('src="/src/main.tsx"');
  });

  it('keeps manifest paths relative so they work from the project page', () => {
    const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8')) as {
      start_url: string;
      icons: Array<{ src: string }>;
    };

    expect(manifest.start_url).toBe('.');
    expect(manifest.icons.every((icon) => !icon.src.startsWith('/'))).toBe(true);
  });
});
