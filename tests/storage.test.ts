import { beforeEach, describe, expect, it } from 'vitest';
import { createSampleAppData } from '../src/domain/sampleData';
import {
  APP_DATA_KEY,
  loadAppData,
  parseImportedData,
  resetToSampleData,
  saveAppData,
  serializeForExport,
} from '../src/storage/appStorage';

describe('appStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads sample data when localStorage is empty', () => {
    const data = loadAppData();

    expect(data.schemaVersion).toBe(1);
    expect(data.ingredients.length).toBeGreaterThanOrEqual(20);
    expect(data.recipes.length).toBeGreaterThanOrEqual(15);
  });

  it('saves and loads app data', () => {
    const data = createSampleAppData();
    const changed = { ...data, ingredients: data.ingredients.slice(0, 1) };

    saveAppData(changed);

    expect(loadAppData().ingredients).toHaveLength(1);
  });

  it('exports schemaVersion and exportedAt', () => {
    const json = serializeForExport(createSampleAppData(), '2026-07-27T12:00:00.000Z');
    const parsed = JSON.parse(json);

    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.exportedAt).toBe('2026-07-27T12:00:00.000Z');
  });

  it('rejects invalid JSON without writing localStorage', () => {
    localStorage.setItem(APP_DATA_KEY, JSON.stringify(createSampleAppData()));

    expect(() => parseImportedData('{bad')).toThrow('文件不是 JSON');
    expect(loadAppData().schemaVersion).toBe(1);
  });

  it('rejects unsupported schemaVersion', () => {
    expect(() => parseImportedData(JSON.stringify({ schemaVersion: 99 }))).toThrow('schemaVersion 不支持');
  });

  it('rejects missing required fields', () => {
    expect(() => parseImportedData(JSON.stringify({ schemaVersion: 1 }))).toThrow('缺少必要字段');
  });

  it('resets sample data into localStorage', () => {
    const data = resetToSampleData();

    expect(data.ingredients.length).toBeGreaterThanOrEqual(20);
    expect(localStorage.getItem(APP_DATA_KEY)).toContain('"schemaVersion":1');
  });
});
