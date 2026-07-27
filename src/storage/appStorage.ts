import { createSampleAppData } from '../domain/sampleData';
import type { AppData } from '../domain/types';

export const APP_DATA_KEY = 'my-fridge-app-data';

function assertAppData(value: unknown): asserts value is AppData {
  if (!value || typeof value !== 'object') {
    throw new Error('缺少必要字段');
  }

  const data = value as Partial<AppData>;
  if (data.schemaVersion !== 1) {
    throw new Error('schemaVersion 不支持');
  }

  if (
    !Array.isArray(data.ingredients) ||
    !Array.isArray(data.recipes) ||
    !Array.isArray(data.mealPlans) ||
    !Array.isArray(data.inventoryTransactions) ||
    !data.settings
  ) {
    throw new Error('缺少必要字段');
  }
}

export function saveAppData(data: AppData): void {
  localStorage.setItem(APP_DATA_KEY, JSON.stringify(data));
}

export function loadAppData(): AppData {
  const raw = localStorage.getItem(APP_DATA_KEY);
  if (!raw) {
    return resetToSampleData();
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    assertAppData(parsed);
    return parsed;
  } catch {
    return resetToSampleData();
  }
}

export function resetToSampleData(): AppData {
  const sample = createSampleAppData();
  saveAppData(sample);
  return sample;
}

export function serializeForExport(data: AppData, exportedAt: string): string {
  return JSON.stringify({ ...data, exportedAt }, null, 2);
}

export function parseImportedData(jsonText: string): AppData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('文件不是 JSON');
  }

  assertAppData(parsed);
  return parsed;
}
