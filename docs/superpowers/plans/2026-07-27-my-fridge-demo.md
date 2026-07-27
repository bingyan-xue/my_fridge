# My Fridge Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the My Fridge Demo as a mobile-first local PWA that can store ingredients, manage user-created recipes, generate one meal at a time from inventory, confirm/cancel inventory deductions, and import/export local data.

**Architecture:** Use React for UI, TypeScript for domain logic, Vite for the dev/build pipeline, and localStorage for persistence. Keep `inventory`, `recipes`, `planner`, `aliases`, and `storage` as plain TypeScript modules so future native app or WeChat Mini Program work can reuse the core logic.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, localStorage, Web App Manifest.

## Global Constraints

- Source of truth: follow `docs/my-fridge-demo-arch.md`; if PRD and ARCH disagree, ARCH wins.
- Chinese ARCH is primary; English ARCH must stay synchronized when architecture changes.
- Demo is a single-user local PWA.
- Demo uses `localStorage` with data key `my-fridge-app-data`.
- Stored data must include `schemaVersion: 1`.
- Demo must include JSON export and import.
- Import overwrites current local data and does not merge.
- Import must parse and validate before writing to localStorage.
- Demo must warn before import: `导入会覆盖当前本地数据。是否继续？`
- Demo does not include accounts, cloud sync, AI entry, AI recipe generation, photo recognition, receipt recognition, shopping lists, exact calorie calculation, seasoning inventory, or multi-person collaboration.
- Ingredient entry uses forms; no AI natural-language parser in Demo.
- User-selected unit is the primary unit for display, deduction, and zero checks.
- Automatic unit conversion only supports `kg <-> g`, `L <-> ml`, and `斤 <-> g` with `1 斤 = 500g`.
- Expiring soon uses the user's local date. Today, tomorrow, and the day after tomorrow count as within the next 2 days.
- Generated meals are plans only. Inventory changes only after the user confirms a meal item.
- Canceling confirmation restores inventory only when a deduction transaction exists.
- Confirmed meal items are locked and must not be overwritten by random generation.
- A meal is a combination and may contain multiple meal items.
- Demo generates one meal at a time.
- Demo uses lightweight nutrition tags, not exact nutrient quantities.
- Each recommendation reason shows at most 1-2 short reasons.
- Demo must include 15-20 built-in recipes or basic meal items, 20-30 sample inventory ingredients, and one default settings set.

---

## File Structure

Create this project structure:

```text
.
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── public/
│   ├── manifest.webmanifest
│   └── icons/
│       ├── icon-192.svg
│       └── icon-512.svg
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── styles.css
│   ├── domain/
│   │   ├── types.ts
│   │   ├── units.ts
│   │   ├── expiry.ts
│   │   ├── aliases.ts
│   │   ├── inventory.ts
│   │   ├── recipes.ts
│   │   ├── planner.ts
│   │   └── sampleData.ts
│   ├── storage/
│   │   └── appStorage.ts
│   ├── components/
│   │   ├── BottomNav.tsx
│   │   ├── MealCard.tsx
│   │   ├── IngredientForm.tsx
│   │   ├── IngredientList.tsx
│   │   ├── RecipeForm.tsx
│   │   └── RecipeList.tsx
│   ├── pages/
│   │   ├── TodayPage.tsx
│   │   ├── InventoryPage.tsx
│   │   ├── RecipesPage.tsx
│   │   └── SettingsPage.tsx
│   └── test/
│       └── setup.ts
└── tests/
    ├── units.test.ts
    ├── expiry.test.ts
    ├── aliases.test.ts
    ├── inventory.test.ts
    ├── storage.test.ts
    └── planner.test.ts
```

Responsibilities:

- `src/domain/types.ts`: shared TypeScript model definitions.
- `src/domain/units.ts`: deterministic unit conversion and unit compatibility.
- `src/domain/expiry.ts`: default shelf life and expiry status rules.
- `src/domain/aliases.ts`: ingredient alias normalization.
- `src/domain/inventory.ts`: inventory mutation, deduction, restoration, and manual adjustment.
- `src/domain/recipes.ts`: recipe helpers and recipe validation.
- `src/domain/planner.ts`: filtering, scoring, weighted random selection, and meal generation.
- `src/domain/sampleData.ts`: built-in categories, aliases, recipes, sample inventory, and default settings.
- `src/storage/appStorage.ts`: localStorage persistence, schema validation, import, and export.
- `src/pages/*`: page-level UI.
- `src/components/*`: reusable UI components.

---

### Task 1: Project scaffold and mobile shell

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `public/manifest.webmanifest`
- Create: `public/icons/icon-192.svg`
- Create: `public/icons/icon-512.svg`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src/components/BottomNav.tsx`
- Create: `src/pages/TodayPage.tsx`
- Create: `src/pages/InventoryPage.tsx`
- Create: `src/pages/RecipesPage.tsx`
- Create: `src/pages/SettingsPage.tsx`
- Create: `src/test/setup.ts`

**Interfaces:**
- Produces: a Vite React app with page navigation state:

```ts
type PageId = 'today' | 'inventory' | 'recipes' | 'settings';
```

- Later tasks consume `PageId` through `App.tsx` and add real page behavior.

- [ ] **Step 1: Initialize git if missing**

Run:

```bash
git status --short
```

Expected if no repo exists: command fails with `not a git repository`.

If no repo exists, run:

```bash
git init
git add docs
git commit -m "docs: add product and architecture docs"
```

Expected: initial commit containing existing docs.

- [ ] **Step 2: Create package and Vite config**

Create `package.json` with:

```json
{
  "name": "my-fridge-demo",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc -b && vite build",
    "preview": "vite preview --host 127.0.0.1",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "tsc -b --pretty false"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.4.0",
    "typescript": "^5.5.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.468.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/react": "^15.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "jsdom": "^24.1.0",
    "vitest": "^2.0.0"
  }
}
```

Create `vite.config.ts` with:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

- [ ] **Step 3: Install dependencies**

Run:

```bash
npm install
```

Expected: `node_modules` and `package-lock.json` are created.

If network permissions block dependency download, rerun with approval according to the Codex sandbox instructions.

- [ ] **Step 4: Create TypeScript config**

Create `tsconfig.json` with:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Create `tsconfig.node.json` with:

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Create app shell**

Create `src/App.tsx` with:

```tsx
import { useState } from 'react';
import { BottomNav, type PageId } from './components/BottomNav';
import { TodayPage } from './pages/TodayPage';
import { InventoryPage } from './pages/InventoryPage';
import { RecipesPage } from './pages/RecipesPage';
import { SettingsPage } from './pages/SettingsPage';
import './styles.css';

export function App() {
  const [page, setPage] = useState<PageId>('today');

  return (
    <div className="appShell">
      <main className="pageFrame">
        {page === 'today' && <TodayPage />}
        {page === 'inventory' && <InventoryPage />}
        {page === 'recipes' && <RecipesPage />}
        {page === 'settings' && <SettingsPage />}
      </main>
      <BottomNav activePage={page} onChange={setPage} />
    </div>
  );
}
```

Create `src/components/BottomNav.tsx` with:

```tsx
import { BookOpen, CalendarDays, Refrigerator, Settings } from 'lucide-react';

export type PageId = 'today' | 'inventory' | 'recipes' | 'settings';

type BottomNavProps = {
  activePage: PageId;
  onChange: (page: PageId) => void;
};

const navItems: Array<{ id: PageId; label: string; icon: typeof CalendarDays }> = [
  { id: 'today', label: '今日', icon: CalendarDays },
  { id: 'inventory', label: '库存', icon: Refrigerator },
  { id: 'recipes', label: '菜谱', icon: BookOpen },
  { id: 'settings', label: '设置', icon: Settings },
];

export function BottomNav({ activePage, onChange }: BottomNavProps) {
  return (
    <nav className="bottomNav" aria-label="主导航">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            className={item.id === activePage ? 'navButton navButtonActive' : 'navButton'}
            type="button"
            onClick={() => onChange(item.id)}
          >
            <Icon aria-hidden="true" size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
```

Create initial pages with exact text:

```tsx
export function TodayPage() {
  return <section><h1>今日</h1><p>随机生成早餐、午餐或晚餐。</p></section>;
}
```

Repeat for `InventoryPage`, `RecipesPage`, and `SettingsPage` with headings `库存`, `菜谱`, `设置`.

- [ ] **Step 6: Create manifest**

Create `public/manifest.webmanifest` with:

```json
{
  "name": "My Fridge Demo",
  "short_name": "My Fridge",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f7f4ee",
  "theme_color": "#3f7d58",
  "icons": [
    { "src": "/icons/icon-192.svg", "sizes": "192x192", "type": "image/svg+xml" },
    { "src": "/icons/icon-512.svg", "sizes": "512x512", "type": "image/svg+xml" }
  ]
}
```

Link it from `index.html`:

```html
<link rel="manifest" href="/manifest.webmanifest" />
```

- [ ] **Step 7: Verify scaffold**

Run:

```bash
npm run lint
npm test
npm run build
```

Expected: all commands pass. `npm test` may report no tests yet only if Vitest exits successfully.

- [ ] **Step 8: Commit**

Run:

```bash
git add .
git commit -m "feat: scaffold my fridge pwa shell"
```

---

### Task 2: Domain types, units, expiry, aliases, and sample data

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/units.ts`
- Create: `src/domain/expiry.ts`
- Create: `src/domain/aliases.ts`
- Create: `src/domain/sampleData.ts`
- Test: `tests/units.test.ts`
- Test: `tests/expiry.test.ts`
- Test: `tests/aliases.test.ts`

**Interfaces:**
- Produces:

```ts
export type Unit = '个' | '根' | '把' | 'g' | 'kg' | 'ml' | 'L' | '袋' | '盒' | '包' | '瓶' | '斤';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'any';
export type NutritionTag = 'carb' | 'fat' | 'fiber' | 'protein' | 'vegetable' | 'fruit' | 'dairy';
export function convertQuantity(quantity: number, from: Unit, to: Unit): number | null;
export function normalizeIngredientName(name: string): string;
export function getEffectiveExpiryDate(item: IngredientItem): string | undefined;
export function getExpiryStatus(item: IngredientItem, today: string): ExpiryStatus;
```

- Later tasks consume these interfaces in inventory, recipes, planner, storage, and UI.

- [ ] **Step 1: Write unit tests first**

Create `tests/units.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { convertQuantity } from '../src/domain/units';

describe('convertQuantity', () => {
  it('converts kg to g', () => {
    expect(convertQuantity(1.5, 'kg', 'g')).toBe(1500);
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
```

Create `tests/expiry.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { applyDefaultExpiry, getExpiryStatus } from '../src/domain/expiry';
import type { IngredientItem } from '../src/domain/types';

const baseItem: IngredientItem = {
  id: 'ing-1',
  name: '青菜',
  canonicalName: '叶菜',
  category: 'leafy-greens',
  quantity: 1,
  unit: '把',
  storageLocation: 'fridge',
  addedAt: '2026-07-27',
  expirySource: 'default',
  nutritionTags: ['fiber', 'vegetable'],
  updatedAt: '2026-07-27',
};

describe('expiry rules', () => {
  it('applies category default shelf life when user date is missing', () => {
    const result = applyDefaultExpiry(baseItem, { 'leafy-greens': 7 });
    expect(result.estimatedExpiryDate).toBe('2026-08-03');
    expect(result.expirySource).toBe('default');
  });

  it('treats today, tomorrow, and the day after tomorrow as expiring soon', () => {
    expect(getExpiryStatus({ ...baseItem, expiryDate: '2026-07-27' }, '2026-07-27')).toBe('expiringSoon');
    expect(getExpiryStatus({ ...baseItem, expiryDate: '2026-07-28' }, '2026-07-27')).toBe('expiringSoon');
    expect(getExpiryStatus({ ...baseItem, expiryDate: '2026-07-29' }, '2026-07-27')).toBe('expiringSoon');
  });

  it('marks dates before today as expired', () => {
    expect(getExpiryStatus({ ...baseItem, expiryDate: '2026-07-26' }, '2026-07-27')).toBe('expired');
  });
});
```

Create `tests/aliases.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm test -- tests/units.test.ts tests/expiry.test.ts tests/aliases.test.ts
```

Expected: tests fail because domain modules do not exist.

- [ ] **Step 3: Create domain types**

Create `src/domain/types.ts` with the types from ARCH:

```ts
export type Unit = '个' | '根' | '把' | 'g' | 'kg' | 'ml' | 'L' | '袋' | '盒' | '包' | '瓶' | '斤';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'any';
export type NutritionTag = 'carb' | 'fat' | 'fiber' | 'protein' | 'vegetable' | 'fruit' | 'dairy';
export type RecipeType = 'dish' | 'staple' | 'readyToEat' | 'combo';
export type ExpiryStatus = 'normal' | 'expiringSoon' | 'expired' | 'unknown';
export type IngredientCategoryId = string;

export type IngredientItem = {
  id: string;
  name: string;
  canonicalName: string;
  category: IngredientCategoryId;
  quantity: number;
  unit: Unit;
  storageLocation: 'fridge' | 'freezer' | 'pantry' | 'other';
  addedAt: string;
  expiryDate?: string;
  estimatedExpiryDate?: string;
  expirySource: 'user' | 'default';
  nutritionTags: NutritionTag[];
  updatedAt: string;
};

export type IngredientCategory = {
  id: IngredientCategoryId;
  name: string;
  defaultShelfLifeDays: number;
  defaultNutritionTags: NutritionTag[];
};

export type RecipeIngredient = {
  name: string;
  canonicalName: string;
  quantity: number;
  unit: Unit;
  required: boolean;
};

export type Recipe = {
  id: string;
  name: string;
  recipeType: RecipeType;
  source: 'builtIn' | 'userCreated';
  mealTypes: MealType[];
  servings: number;
  ingredients: RecipeIngredient[];
  nutritionTags: NutritionTag[];
  optionalMeta?: {
    difficulty?: 'easy' | 'medium' | 'hard';
    estimatedMinutes?: number;
    cookware?: string[];
    steps?: string[];
  };
  createdAt: string;
  updatedAt: string;
};

export type ConsumptionItem = {
  ingredientItemId: string;
  ingredientName: string;
  canonicalName: string;
  quantity: number;
  unit: Unit;
  requiresConfirmation: boolean;
};

export type PlannedMealItem = {
  id: string;
  recipeSnapshot: Recipe;
  plannedServings: number;
  plannedConsumption: ConsumptionItem[];
  status: 'planned' | 'completed';
  reasons: string[];
  warnings: string[];
  locked: boolean;
};

export type Meal = {
  mealType: 'breakfast' | 'lunch' | 'dinner';
  items: PlannedMealItem[];
};

export type MealPlan = {
  id: string;
  date: string;
  meals: Meal[];
  createdAt: string;
  updatedAt: string;
};

export type InventoryTransaction = {
  id: string;
  ingredientItemId: string;
  mealPlanId?: string;
  plannedMealItemId?: string;
  quantityDelta: number;
  unit: Unit;
  reason: 'mealCompleted' | 'mealCompletionUndone' | 'manualAdjustment';
  relatedTransactionId?: string;
  createdAt: string;
};

export type UserSettings = {
  updatedAt: string;
};

export type AppData = {
  schemaVersion: 1;
  ingredients: IngredientItem[];
  recipes: Recipe[];
  mealPlans: MealPlan[];
  inventoryTransactions: InventoryTransaction[];
  settings: UserSettings;
};
```

- [ ] **Step 4: Implement unit conversion**

Create `src/domain/units.ts`:

```ts
import type { Unit } from './types';

const conversionRates: Partial<Record<Unit, Partial<Record<Unit, number>>>> = {
  kg: { g: 1000 },
  g: { kg: 0.001, 斤: 1 / 500 },
  L: { ml: 1000 },
  ml: { L: 0.001 },
  斤: { g: 500 },
};

export function convertQuantity(quantity: number, from: Unit, to: Unit): number | null {
  if (from === to) {
    return quantity;
  }
  const rate = conversionRates[from]?.[to];
  return typeof rate === 'number' ? quantity * rate : null;
}
```

- [ ] **Step 5: Implement expiry and aliases**

Create `src/domain/aliases.ts`:

```ts
const aliases: Record<string, string> = {
  番茄: '西红柿',
  西红柿: '西红柿',
  马铃薯: '土豆',
  土豆: '土豆',
  青菜: '叶菜',
  叶菜: '叶菜',
};

export function normalizeIngredientName(name: string): string {
  const trimmed = name.trim();
  return aliases[trimmed] ?? trimmed;
}
```

Create `src/domain/expiry.ts`:

```ts
import type { ExpiryStatus, IngredientItem } from './types';

function addDays(dateString: string, days: number): string {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function diffDays(dateString: string, todayString: string): number {
  const date = new Date(`${dateString}T00:00:00`).getTime();
  const today = new Date(`${todayString}T00:00:00`).getTime();
  return Math.round((date - today) / 86_400_000);
}

export function applyDefaultExpiry(
  item: IngredientItem,
  defaultShelfLifeByCategory: Record<string, number>,
): IngredientItem {
  if (item.expiryDate) {
    return { ...item, expirySource: 'user', estimatedExpiryDate: undefined };
  }
  const shelfLifeDays = defaultShelfLifeByCategory[item.category] ?? 7;
  return {
    ...item,
    estimatedExpiryDate: addDays(item.addedAt, shelfLifeDays),
    expirySource: 'default',
  };
}

export function getEffectiveExpiryDate(item: IngredientItem): string | undefined {
  return item.expiryDate ?? item.estimatedExpiryDate;
}

export function getExpiryStatus(item: IngredientItem, today: string): ExpiryStatus {
  const effectiveDate = getEffectiveExpiryDate(item);
  if (!effectiveDate) {
    return 'unknown';
  }
  const days = diffDays(effectiveDate, today);
  if (days < 0) {
    return 'expired';
  }
  if (days <= 2) {
    return 'expiringSoon';
  }
  return 'normal';
}
```

- [ ] **Step 6: Create sample data**

Create `src/domain/sampleData.ts` with at least these exported constants:

```ts
import type { AppData, IngredientCategory, IngredientItem, Recipe } from './types';

export const ingredientCategories: IngredientCategory[] = [
  { id: 'leafy-greens', name: '叶菜', defaultShelfLifeDays: 7, defaultNutritionTags: ['fiber', 'vegetable'] },
  { id: 'soy-products', name: '豆制品', defaultShelfLifeDays: 5, defaultNutritionTags: ['protein'] },
  { id: 'eggs', name: '蛋类', defaultShelfLifeDays: 21, defaultNutritionTags: ['protein', 'fat'] },
  { id: 'dairy', name: '奶制品', defaultShelfLifeDays: 7, defaultNutritionTags: ['protein', 'dairy'] },
  { id: 'meat', name: '鲜肉', defaultShelfLifeDays: 4, defaultNutritionTags: ['protein', 'fat'] },
  { id: 'staples', name: '米面主食', defaultShelfLifeDays: 365, defaultNutritionTags: ['carb'] },
  { id: 'fruit', name: '水果', defaultShelfLifeDays: 10, defaultNutritionTags: ['fiber', 'fruit'] },
  { id: 'dry-goods', name: '干货坚果', defaultShelfLifeDays: 180, defaultNutritionTags: ['fat'] },
];
```

Add 15-20 recipes or basic meal items and 20-30 sample ingredients. Include these exact built-in recipe names:

```ts
[
  '米饭',
  '粥',
  '水煮蛋',
  '牛奶',
  '面包',
  '香蕉',
  '苹果',
  '酸奶',
  '西红柿炒蛋',
  '清炒叶菜',
  '豆腐青菜汤',
  '鸡蛋面',
  '牛肉炒土豆',
  '豆腐饭',
  '牛奶鸡蛋面包',
  '酸奶水果早餐'
]
```

Export:

```ts
export const sampleRecipes: Recipe[] = [];
export const sampleIngredients: IngredientItem[] = [];
export const createSampleAppData = (): AppData => ({
  schemaVersion: 1,
  ingredients: sampleIngredients,
  recipes: sampleRecipes,
  mealPlans: [],
  inventoryTransactions: [],
  settings: { updatedAt: '2026-07-27T00:00:00.000Z' },
});
```

Fill `sampleRecipes` and `sampleIngredients` with real objects matching `types.ts`.

- [ ] **Step 7: Run tests**

Run:

```bash
npm test -- tests/units.test.ts tests/expiry.test.ts tests/aliases.test.ts
npm run lint
```

Expected: all pass.

- [ ] **Step 8: Commit**

Run:

```bash
git add src/domain tests/units.test.ts tests/expiry.test.ts tests/aliases.test.ts
git commit -m "feat: add domain types and sample data"
```

---

### Task 3: localStorage persistence, import, export, and schema validation

**Files:**
- Create: `src/storage/appStorage.ts`
- Test: `tests/storage.test.ts`

**Interfaces:**
- Consumes: `AppData`, `createSampleAppData`.
- Produces:

```ts
export const APP_DATA_KEY = 'my-fridge-app-data';
export function loadAppData(): AppData;
export function saveAppData(data: AppData): void;
export function resetToSampleData(): AppData;
export function serializeForExport(data: AppData, exportedAt: string): string;
export function parseImportedData(jsonText: string): AppData;
```

- Later UI tasks consume these functions.

- [ ] **Step 1: Write failing storage tests**

Create `tests/storage.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import {
  APP_DATA_KEY,
  loadAppData,
  parseImportedData,
  resetToSampleData,
  saveAppData,
  serializeForExport,
} from '../src/storage/appStorage';
import { createSampleAppData } from '../src/domain/sampleData';

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
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm test -- tests/storage.test.ts
```

Expected: fail because `src/storage/appStorage.ts` does not exist.

- [ ] **Step 3: Implement storage**

Create `src/storage/appStorage.ts`:

```ts
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
    const sample = createSampleAppData();
    saveAppData(sample);
    return sample;
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    assertAppData(parsed);
    return parsed;
  } catch {
    const sample = createSampleAppData();
    saveAppData(sample);
    return sample;
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
```

- [ ] **Step 4: Run tests**

Run:

```bash
npm test -- tests/storage.test.ts
npm run lint
```

Expected: all pass.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/storage tests/storage.test.ts
git commit -m "feat: add local data persistence"
```

---

### Task 4: Inventory domain logic and inventory page

**Files:**
- Create: `src/domain/inventory.ts`
- Create: `src/components/IngredientForm.tsx`
- Create: `src/components/IngredientList.tsx`
- Modify: `src/pages/InventoryPage.tsx`
- Modify: `src/App.tsx`
- Test: `tests/inventory.test.ts`

**Interfaces:**
- Consumes: `IngredientItem`, `InventoryTransaction`, `Unit`, `convertQuantity`, `normalizeIngredientName`, storage functions.
- Produces:

```ts
export function createIngredientDraft(input: IngredientFormInput, today: string): IngredientItem;
export function upsertIngredient(items: IngredientItem[], item: IngredientItem): IngredientItem[];
export function deleteIngredient(items: IngredientItem[], id: string): IngredientItem[];
export function adjustIngredientQuantity(items: IngredientItem[], id: string, quantity: number, changedAt: string): IngredientItem[];
```

- Later tasks consume inventory helpers for confirm/cancel deduction.

- [ ] **Step 1: Write failing inventory tests**

Create `tests/inventory.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  adjustIngredientQuantity,
  createIngredientDraft,
  deleteIngredient,
  upsertIngredient,
} from '../src/domain/inventory';

describe('inventory helpers', () => {
  it('creates ingredient with normalized name and default expiry', () => {
    const item = createIngredientDraft(
      {
        name: '番茄',
        category: 'leafy-greens',
        quantity: 2,
        unit: '个',
        storageLocation: 'fridge',
        expiryDate: '',
        nutritionTags: ['fiber', 'vegetable'],
      },
      '2026-07-27',
    );
    expect(item.canonicalName).toBe('西红柿');
    expect(item.estimatedExpiryDate).toBe('2026-08-03');
  });

  it('upserts by id', () => {
    const first = createIngredientDraft(
      { name: '鸡蛋', category: 'eggs', quantity: 6, unit: '个', storageLocation: 'fridge', expiryDate: '', nutritionTags: ['protein'] },
      '2026-07-27',
    );
    const second = { ...first, quantity: 8 };
    expect(upsertIngredient([first], second)[0].quantity).toBe(8);
  });

  it('deletes by id', () => {
    const item = createIngredientDraft(
      { name: '鸡蛋', category: 'eggs', quantity: 6, unit: '个', storageLocation: 'fridge', expiryDate: '', nutritionTags: ['protein'] },
      '2026-07-27',
    );
    expect(deleteIngredient([item], item.id)).toHaveLength(0);
  });

  it('manual quantity adjustment changes current quantity', () => {
    const item = createIngredientDraft(
      { name: '鸡蛋', category: 'eggs', quantity: 6, unit: '个', storageLocation: 'fridge', expiryDate: '', nutritionTags: ['protein'] },
      '2026-07-27',
    );
    expect(adjustIngredientQuantity([item], item.id, 10, '2026-07-27T10:00:00.000Z')[0].quantity).toBe(10);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm test -- tests/inventory.test.ts
```

Expected: fail because `src/domain/inventory.ts` does not exist.

- [ ] **Step 3: Implement inventory helpers**

Create `src/domain/inventory.ts`:

```ts
import { applyDefaultExpiry } from './expiry';
import { normalizeIngredientName } from './aliases';
import type { IngredientItem, NutritionTag, Unit } from './types';

export type IngredientFormInput = {
  name: string;
  category: string;
  quantity: number;
  unit: Unit;
  storageLocation: IngredientItem['storageLocation'];
  expiryDate: string;
  nutritionTags: NutritionTag[];
};

const defaultShelfLifeByCategory: Record<string, number> = {
  'leafy-greens': 7,
  'soy-products': 5,
  eggs: 21,
  dairy: 7,
  meat: 4,
  staples: 365,
  fruit: 10,
  'dry-goods': 180,
};

export function createIngredientDraft(input: IngredientFormInput, today: string): IngredientItem {
  const now = new Date().toISOString();
  const item: IngredientItem = {
    id: `ing-${crypto.randomUUID()}`,
    name: input.name.trim(),
    canonicalName: normalizeIngredientName(input.name),
    category: input.category,
    quantity: input.quantity,
    unit: input.unit,
    storageLocation: input.storageLocation,
    addedAt: today,
    expiryDate: input.expiryDate || undefined,
    expirySource: input.expiryDate ? 'user' : 'default',
    nutritionTags: input.nutritionTags,
    updatedAt: now,
  };
  return applyDefaultExpiry(item, defaultShelfLifeByCategory);
}

export function upsertIngredient(items: IngredientItem[], item: IngredientItem): IngredientItem[] {
  const exists = items.some((candidate) => candidate.id === item.id);
  return exists ? items.map((candidate) => (candidate.id === item.id ? item : candidate)) : [item, ...items];
}

export function deleteIngredient(items: IngredientItem[], id: string): IngredientItem[] {
  return items.filter((item) => item.id !== id);
}

export function adjustIngredientQuantity(
  items: IngredientItem[],
  id: string,
  quantity: number,
  changedAt: string,
): IngredientItem[] {
  return items.map((item) => (item.id === id ? { ...item, quantity, updatedAt: changedAt } : item));
}
```

- [ ] **Step 4: Build inventory UI**

`IngredientForm` must include fields:

- `name`
- `category`
- `quantity`
- `unit`
- `storageLocation`
- `expiryDate`
- nutrition tag checkboxes for `carb`, `fat`, `fiber`, `protein`, `vegetable`, `fruit`, `dairy`

Use a submit callback:

```ts
type IngredientFormProps = {
  onSubmit: (input: IngredientFormInput) => void;
};
```

`IngredientList` must show:

- name
- quantity and unit
- storage location
- effective expiry date
- status label from `getExpiryStatus`
- edit quantity input
- delete button

`InventoryPage` must:

- load `AppData` from props or parent state
- add ingredient via `createIngredientDraft`
- save through `saveAppData`
- support delete
- support manual quantity change

- [ ] **Step 5: Wire App state**

Modify `App.tsx` to load data once:

```tsx
const [appData, setAppData] = useState<AppData>(() => loadAppData());

function updateAppData(next: AppData) {
  saveAppData(next);
  setAppData(next);
}
```

Pass `appData` and `updateAppData` to pages.

- [ ] **Step 6: Run tests and manual check**

Run:

```bash
npm test -- tests/inventory.test.ts
npm run lint
npm run build
```

Manual check:

```bash
npm run dev
```

Open the local URL. Add `鸡蛋 6 个` and confirm it appears after page refresh.

- [ ] **Step 7: Commit**

Run:

```bash
git add src tests/inventory.test.ts
git commit -m "feat: add inventory management"
```

---

### Task 5: Recipe domain logic and recipe page

**Files:**
- Create: `src/domain/recipes.ts`
- Create: `src/components/RecipeForm.tsx`
- Create: `src/components/RecipeList.tsx`
- Modify: `src/pages/RecipesPage.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `Recipe`, `RecipeIngredient`, `NutritionTag`, `Unit`, storage functions.
- Produces:

```ts
export type RecipeFormInput = {
  name: string;
  recipeType: Recipe['recipeType'];
  mealTypes: MealType[];
  servings: number;
  ingredients: Array<{ name: string; quantity: number; unit: Unit; required: boolean }>;
  nutritionTags: NutritionTag[];
};
export function createUserRecipe(input: RecipeFormInput, now: string): Recipe;
export function upsertRecipe(recipes: Recipe[], recipe: Recipe): Recipe[];
export function deleteRecipe(recipes: Recipe[], id: string): Recipe[];
```

- Planner consumes recipes in Task 6.

- [ ] **Step 1: Add recipe tests inside planner-independent file**

Create `tests/recipes.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createUserRecipe, deleteRecipe, upsertRecipe } from '../src/domain/recipes';

describe('recipe helpers', () => {
  it('creates user recipe with canonical ingredient names', () => {
    const recipe = createUserRecipe(
      {
        name: '西红柿炒蛋',
        recipeType: 'dish',
        mealTypes: ['lunch', 'dinner'],
        servings: 1,
        ingredients: [
          { name: '番茄', quantity: 1, unit: '个', required: true },
          { name: '鸡蛋', quantity: 1, unit: '个', required: true },
        ],
        nutritionTags: ['protein', 'fiber', 'fat'],
      },
      '2026-07-27T10:00:00.000Z',
    );
    expect(recipe.source).toBe('userCreated');
    expect(recipe.ingredients[0].canonicalName).toBe('西红柿');
  });

  it('upserts and deletes recipes by id', () => {
    const recipe = createUserRecipe(
      {
        name: '米饭',
        recipeType: 'staple',
        mealTypes: ['lunch', 'dinner'],
        servings: 1,
        ingredients: [{ name: '大米', quantity: 100, unit: 'g', required: true }],
        nutritionTags: ['carb'],
      },
      '2026-07-27T10:00:00.000Z',
    );
    expect(upsertRecipe([], recipe)).toHaveLength(1);
    expect(deleteRecipe([recipe], recipe.id)).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm test -- tests/recipes.test.ts
```

Expected: fail because `src/domain/recipes.ts` does not exist.

- [ ] **Step 3: Implement recipe helpers**

Create `src/domain/recipes.ts`:

```ts
import { normalizeIngredientName } from './aliases';
import type { MealType, NutritionTag, Recipe, Unit } from './types';

export type RecipeFormInput = {
  name: string;
  recipeType: Recipe['recipeType'];
  mealTypes: MealType[];
  servings: number;
  ingredients: Array<{ name: string; quantity: number; unit: Unit; required: boolean }>;
  nutritionTags: NutritionTag[];
};

export function createUserRecipe(input: RecipeFormInput, now: string): Recipe {
  return {
    id: `recipe-${crypto.randomUUID()}`,
    name: input.name.trim(),
    recipeType: input.recipeType,
    source: 'userCreated',
    mealTypes: input.mealTypes,
    servings: input.servings,
    ingredients: input.ingredients.map((ingredient) => ({
      ...ingredient,
      canonicalName: normalizeIngredientName(ingredient.name),
    })),
    nutritionTags: input.nutritionTags,
    createdAt: now,
    updatedAt: now,
  };
}

export function upsertRecipe(recipes: Recipe[], recipe: Recipe): Recipe[] {
  const exists = recipes.some((candidate) => candidate.id === recipe.id);
  return exists ? recipes.map((candidate) => (candidate.id === recipe.id ? recipe : candidate)) : [recipe, ...recipes];
}

export function deleteRecipe(recipes: Recipe[], id: string): Recipe[] {
  return recipes.filter((recipe) => recipe.id !== id);
}
```

- [ ] **Step 4: Build recipe UI**

`RecipeForm` must support:

- recipe name
- recipe type: `dish`, `staple`, `readyToEat`, `combo`
- meal type checkboxes: `breakfast`, `lunch`, `dinner`, `any`
- servings number, default `1`
- at least one required ingredient row with name, quantity, unit, and required checkbox
- nutrition tag checkboxes for `carb`, `fat`, `fiber`, `protein`

`RecipeList` must show:

- recipe name
- recipe type
- meal types
- source
- required ingredient summary
- delete button for user-created recipes only

- [ ] **Step 5: Wire recipe page**

`RecipesPage` must:

- display built-in and user-created recipes
- add recipe via `createUserRecipe`
- save via `saveAppData`
- delete only recipes with `source === 'userCreated'`

- [ ] **Step 6: Run tests and manual check**

Run:

```bash
npm test -- tests/recipes.test.ts
npm run lint
npm run build
```

Manual check:

```bash
npm run dev
```

Add a user recipe named `西红柿炒蛋` with `西红柿 1 个` and `鸡蛋 1 个`. Refresh page and confirm it remains.

- [ ] **Step 7: Commit**

Run:

```bash
git add src tests/recipes.test.ts
git commit -m "feat: add user-created recipes"
```

---

### Task 6: Planner engine with filtering, scoring, warnings, and one-meal generation

**Files:**
- Create: `src/domain/planner.ts`
- Test: `tests/planner.test.ts`

**Interfaces:**
- Consumes: `IngredientItem`, `Recipe`, `Meal`, `PlannedMealItem`, `convertQuantity`, `getExpiryStatus`.
- Produces:

```ts
export type GenerateMealInput = {
  mealType: 'breakfast' | 'lunch' | 'dinner';
  today: string;
  ingredients: IngredientItem[];
  recipes: Recipe[];
  existingMeal?: Meal;
};
export type GenerateMealResult =
  | { status: 'generated'; meal: Meal }
  | { status: 'failed'; reason: '缺食材' | '数量不足' | '单位需要确认' | '餐次不匹配' | '菜谱不足' };
export function generateMeal(input: GenerateMealInput): GenerateMealResult;
```

- Today page consumes `generateMeal` in Task 7.

- [ ] **Step 1: Write failing planner tests**

Create `tests/planner.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { generateMeal } from '../src/domain/planner';
import type { IngredientItem, Recipe } from '../src/domain/types';

const today = '2026-07-27';

const egg: IngredientItem = {
  id: 'ing-egg',
  name: '鸡蛋',
  canonicalName: '鸡蛋',
  category: 'eggs',
  quantity: 2,
  unit: '个',
  storageLocation: 'fridge',
  addedAt: today,
  expiryDate: '2026-07-28',
  expirySource: 'user',
  nutritionTags: ['protein', 'fat'],
  updatedAt: `${today}T00:00:00.000Z`,
};

const rice: IngredientItem = {
  id: 'ing-rice',
  name: '大米',
  canonicalName: '大米',
  category: 'staples',
  quantity: 1,
  unit: 'kg',
  storageLocation: 'pantry',
  addedAt: today,
  estimatedExpiryDate: '2027-07-27',
  expirySource: 'default',
  nutritionTags: ['carb'],
  updatedAt: `${today}T00:00:00.000Z`,
};

const boiledEgg: Recipe = {
  id: 'recipe-egg',
  name: '水煮蛋',
  recipeType: 'readyToEat',
  source: 'builtIn',
  mealTypes: ['breakfast'],
  servings: 1,
  ingredients: [{ name: '鸡蛋', canonicalName: '鸡蛋', quantity: 1, unit: '个', required: true }],
  nutritionTags: ['protein', 'fat'],
  createdAt: `${today}T00:00:00.000Z`,
  updatedAt: `${today}T00:00:00.000Z`,
};

const riceRecipe: Recipe = {
  id: 'recipe-rice',
  name: '米饭',
  recipeType: 'staple',
  source: 'builtIn',
  mealTypes: ['lunch', 'dinner'],
  servings: 1,
  ingredients: [{ name: '大米', canonicalName: '大米', quantity: 100, unit: 'g', required: true }],
  nutritionTags: ['carb'],
  createdAt: `${today}T00:00:00.000Z`,
  updatedAt: `${today}T00:00:00.000Z`,
};

describe('generateMeal', () => {
  it('does not recommend a recipe for the wrong meal type', () => {
    const result = generateMeal({ mealType: 'lunch', today, ingredients: [egg], recipes: [boiledEgg] });
    expect(result.status).toBe('failed');
  });

  it('generates a breakfast item from available inventory', () => {
    const result = generateMeal({ mealType: 'breakfast', today, ingredients: [egg], recipes: [boiledEgg] });
    expect(result.status).toBe('generated');
    if (result.status === 'generated') {
      expect(result.meal.items[0].recipeSnapshot.name).toBe('水煮蛋');
      expect(result.meal.items[0].reasons.length).toBeLessThanOrEqual(2);
    }
  });

  it('supports deterministic kg to g conversion', () => {
    const result = generateMeal({ mealType: 'lunch', today, ingredients: [rice], recipes: [riceRecipe] });
    expect(result.status).toBe('generated');
    if (result.status === 'generated') {
      expect(result.meal.items[0].plannedConsumption[0].quantity).toBe(100);
      expect(result.meal.items[0].plannedConsumption[0].unit).toBe('g');
    }
  });

  it('does not overwrite locked items', () => {
    const existingMeal = {
      mealType: 'breakfast' as const,
      items: [
        {
          id: 'planned-1',
          recipeSnapshot: boiledEgg,
          plannedServings: 1,
          plannedConsumption: [{ ingredientItemId: 'ing-egg', ingredientName: '鸡蛋', canonicalName: '鸡蛋', quantity: 1, unit: '个' as const, requiresConfirmation: false }],
          status: 'completed' as const,
          reasons: ['补了蛋白质'],
          warnings: [],
          locked: true,
        },
      ],
    };
    const result = generateMeal({ mealType: 'breakfast', today, ingredients: [egg], recipes: [boiledEgg], existingMeal });
    expect(result.status).toBe('generated');
    if (result.status === 'generated') {
      expect(result.meal.items[0].id).toBe('planned-1');
    }
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm test -- tests/planner.test.ts
```

Expected: fail because `src/domain/planner.ts` does not exist.

- [ ] **Step 3: Implement planner helpers**

Create `src/domain/planner.ts` with:

```ts
import { getExpiryStatus } from './expiry';
import { convertQuantity } from './units';
import type { IngredientItem, Meal, PlannedMealItem, Recipe } from './types';

export type GenerateMealInput = {
  mealType: 'breakfast' | 'lunch' | 'dinner';
  today: string;
  ingredients: IngredientItem[];
  recipes: Recipe[];
  existingMeal?: Meal;
};

export type GenerateMealResult =
  | { status: 'generated'; meal: Meal }
  | { status: 'failed'; reason: '缺食材' | '数量不足' | '单位需要确认' | '餐次不匹配' | '菜谱不足' };

function mealTypeMatches(recipe: Recipe, mealType: GenerateMealInput['mealType']): boolean {
  return recipe.mealTypes.includes(mealType) || recipe.mealTypes.includes('any');
}

function findInventoryIngredient(ingredients: IngredientItem[], canonicalName: string): IngredientItem | undefined {
  return ingredients.find((item) => item.canonicalName === canonicalName);
}

function scoreRecipe(recipe: Recipe, ingredients: IngredientItem[], today: string): { score: number; reasons: string[]; warnings: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const warnings: string[] = [];

  for (const recipeIngredient of recipe.ingredients.filter((item) => item.required)) {
    const inventoryItem = findInventoryIngredient(ingredients, recipeIngredient.canonicalName);
    if (!inventoryItem) {
      continue;
    }
    const status = getExpiryStatus(inventoryItem, today);
    if (status === 'expiringSoon') {
      score += 80;
      if (reasons.length < 2) {
        reasons.push(`用了快过期的${inventoryItem.name}`);
      }
    }
    if (inventoryItem.nutritionTags.includes('protein') && recipe.nutritionTags.includes('protein')) {
      score += 10;
    }
  }

  if (recipe.nutritionTags.includes('protein') && reasons.length < 2) {
    reasons.push('补了蛋白质');
  }
  if (recipe.recipeType === 'staple' && reasons.length < 2) {
    reasons.push('生成基础餐');
  }
  if (!recipe.nutritionTags.includes('protein')) {
    warnings.push('这餐蛋白质偏少');
  }

  return { score, reasons: reasons.slice(0, 2), warnings };
}

function buildConsumption(recipe: Recipe, ingredients: IngredientItem[]) {
  return recipe.ingredients
    .filter((ingredient) => ingredient.required)
    .map((recipeIngredient) => {
      const inventoryItem = findInventoryIngredient(ingredients, recipeIngredient.canonicalName);
      if (!inventoryItem) {
        return null;
      }
      const converted = convertQuantity(recipeIngredient.quantity, recipeIngredient.unit, inventoryItem.unit);
      return {
        ingredientItemId: inventoryItem.id,
        ingredientName: inventoryItem.name,
        canonicalName: inventoryItem.canonicalName,
        quantity: converted ?? recipeIngredient.quantity,
        unit: converted === null ? recipeIngredient.unit : inventoryItem.unit,
        requiresConfirmation: converted === null,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

function recipeIsFeasible(recipe: Recipe, ingredients: IngredientItem[], today: string): boolean {
  return recipe.ingredients
    .filter((ingredient) => ingredient.required)
    .every((recipeIngredient) => {
      const inventoryItem = findInventoryIngredient(ingredients, recipeIngredient.canonicalName);
      if (!inventoryItem || getExpiryStatus(inventoryItem, today) === 'expired') {
        return false;
      }
      const convertedNeed = convertQuantity(recipeIngredient.quantity, recipeIngredient.unit, inventoryItem.unit);
      if (convertedNeed === null) {
        return true;
      }
      return inventoryItem.quantity >= convertedNeed;
    });
}

export function generateMeal(input: GenerateMealInput): GenerateMealResult {
  const lockedItems = input.existingMeal?.items.filter((item) => item.locked) ?? [];
  const candidates = input.recipes
    .filter((recipe) => mealTypeMatches(recipe, input.mealType))
    .filter((recipe) => recipeIsFeasible(recipe, input.ingredients, input.today))
    .map((recipe) => ({ recipe, ...scoreRecipe(recipe, input.ingredients, input.today) }))
    .sort((a, b) => b.score - a.score);

  if (lockedItems.length > 0) {
    return { status: 'generated', meal: { mealType: input.mealType, items: lockedItems } };
  }
  if (candidates.length === 0) {
    return { status: 'failed', reason: input.recipes.length === 0 ? '菜谱不足' : '缺食材' };
  }

  const topScore = candidates[0].score;
  const topCandidates = candidates.filter((candidate) => candidate.score >= topScore - 10);
  const selected = topCandidates[Math.floor(Math.random() * topCandidates.length)];
  const item: PlannedMealItem = {
    id: `planned-${crypto.randomUUID()}`,
    recipeSnapshot: selected.recipe,
    plannedServings: 1,
    plannedConsumption: buildConsumption(selected.recipe, input.ingredients),
    status: 'planned',
    reasons: selected.reasons,
    warnings: selected.warnings,
    locked: false,
  };

  return { status: 'generated', meal: { mealType: input.mealType, items: [item] } };
}
```

- [ ] **Step 4: Run planner tests**

Run:

```bash
npm test -- tests/planner.test.ts
npm run lint
```

Expected: all pass.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/domain/planner.ts tests/planner.test.ts
git commit -m "feat: add meal planner engine"
```

---

### Task 7: Today page generation, confirm deduction, and cancel restoration

**Files:**
- Create: `src/components/MealCard.tsx`
- Modify: `src/pages/TodayPage.tsx`
- Modify: `src/domain/inventory.ts`
- Modify: `src/App.tsx`
- Test: `tests/inventory.test.ts`

**Interfaces:**
- Consumes: `generateMeal`, `AppData`, `PlannedMealItem`, storage functions.
- Produces:

```ts
export function completePlannedMealItem(data: AppData, mealPlanId: string, itemId: string, now: string): AppData;
export function undoCompletedMealItem(data: AppData, mealPlanId: string, itemId: string, now: string): AppData;
```

- Settings and Today UI consume updated `AppData`.

- [ ] **Step 1: Extend inventory tests for confirm and undo**

Append to `tests/inventory.test.ts`:

```ts
import { completePlannedMealItem, undoCompletedMealItem } from '../src/domain/inventory';
import type { AppData } from '../src/domain/types';

describe('meal completion inventory transactions', () => {
  const data: AppData = {
    schemaVersion: 1,
    ingredients: [
      {
        id: 'ing-egg',
        name: '鸡蛋',
        canonicalName: '鸡蛋',
        category: 'eggs',
        quantity: 6,
        unit: '个',
        storageLocation: 'fridge',
        addedAt: '2026-07-27',
        expirySource: 'default',
        estimatedExpiryDate: '2026-08-17',
        nutritionTags: ['protein'],
        updatedAt: '2026-07-27T00:00:00.000Z',
      },
    ],
    recipes: [],
    mealPlans: [
      {
        id: 'plan-1',
        date: '2026-07-27',
        createdAt: '2026-07-27T00:00:00.000Z',
        updatedAt: '2026-07-27T00:00:00.000Z',
        meals: [
          {
            mealType: 'breakfast',
            items: [
              {
                id: 'planned-egg',
                recipeSnapshot: {
                  id: 'recipe-egg',
                  name: '水煮蛋',
                  recipeType: 'readyToEat',
                  source: 'builtIn',
                  mealTypes: ['breakfast'],
                  servings: 1,
                  ingredients: [{ name: '鸡蛋', canonicalName: '鸡蛋', quantity: 2, unit: '个', required: true }],
                  nutritionTags: ['protein'],
                  createdAt: '2026-07-27T00:00:00.000Z',
                  updatedAt: '2026-07-27T00:00:00.000Z',
                },
                plannedServings: 1,
                plannedConsumption: [{ ingredientItemId: 'ing-egg', ingredientName: '鸡蛋', canonicalName: '鸡蛋', quantity: 2, unit: '个', requiresConfirmation: false }],
                status: 'planned',
                reasons: ['补了蛋白质'],
                warnings: [],
                locked: false,
              },
            ],
          },
        ],
      },
    ],
    inventoryTransactions: [],
    settings: { updatedAt: '2026-07-27T00:00:00.000Z' },
  };

  it('deducts inventory only after confirmation', () => {
    const completed = completePlannedMealItem(data, 'plan-1', 'planned-egg', '2026-07-27T08:00:00.000Z');
    expect(completed.ingredients[0].quantity).toBe(4);
    expect(completed.inventoryTransactions[0].quantityDelta).toBe(-2);
    expect(completed.mealPlans[0].meals[0].items[0].locked).toBe(true);
  });

  it('restores inventory after canceling confirmation', () => {
    const completed = completePlannedMealItem(data, 'plan-1', 'planned-egg', '2026-07-27T08:00:00.000Z');
    const undone = undoCompletedMealItem(completed, 'plan-1', 'planned-egg', '2026-07-27T08:05:00.000Z');
    expect(undone.ingredients[0].quantity).toBe(6);
    expect(undone.inventoryTransactions.at(-1)?.quantityDelta).toBe(2);
    expect(undone.mealPlans[0].meals[0].items[0].locked).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm test -- tests/inventory.test.ts
```

Expected: fail because completion functions are missing.

- [ ] **Step 3: Implement completion functions**

Add to `src/domain/inventory.ts`:

```ts
import type { AppData, InventoryTransaction } from './types';

export function completePlannedMealItem(data: AppData, mealPlanId: string, itemId: string, now: string): AppData {
  const plan = data.mealPlans.find((candidate) => candidate.id === mealPlanId);
  const meal = plan?.meals.find((candidate) => candidate.items.some((item) => item.id === itemId));
  const item = meal?.items.find((candidate) => candidate.id === itemId);
  if (!plan || !meal || !item || item.status === 'completed') {
    return data;
  }

  const transactions: InventoryTransaction[] = item.plannedConsumption.map((consumption) => ({
    id: `tx-${crypto.randomUUID()}`,
    ingredientItemId: consumption.ingredientItemId,
    mealPlanId,
    plannedMealItemId: itemId,
    quantityDelta: -consumption.quantity,
    unit: consumption.unit,
    reason: 'mealCompleted',
    createdAt: now,
  }));

  return {
    ...data,
    ingredients: data.ingredients.map((ingredient) => {
      const transaction = transactions.find((candidate) => candidate.ingredientItemId === ingredient.id);
      return transaction ? { ...ingredient, quantity: ingredient.quantity + transaction.quantityDelta, updatedAt: now } : ingredient;
    }),
    mealPlans: data.mealPlans.map((candidatePlan) =>
      candidatePlan.id === mealPlanId
        ? {
            ...candidatePlan,
            updatedAt: now,
            meals: candidatePlan.meals.map((candidateMeal) => ({
              ...candidateMeal,
              items: candidateMeal.items.map((candidateItem) =>
                candidateItem.id === itemId ? { ...candidateItem, status: 'completed', locked: true } : candidateItem,
              ),
            })),
          }
        : candidatePlan,
    ),
    inventoryTransactions: [...data.inventoryTransactions, ...transactions],
  };
}

export function undoCompletedMealItem(data: AppData, mealPlanId: string, itemId: string, now: string): AppData {
  const originalTransactions = data.inventoryTransactions.filter(
    (transaction) =>
      transaction.mealPlanId === mealPlanId &&
      transaction.plannedMealItemId === itemId &&
      transaction.reason === 'mealCompleted',
  );
  if (originalTransactions.length === 0) {
    return data;
  }

  const reverseTransactions: InventoryTransaction[] = originalTransactions.map((transaction) => ({
    id: `tx-${crypto.randomUUID()}`,
    ingredientItemId: transaction.ingredientItemId,
    mealPlanId,
    plannedMealItemId: itemId,
    quantityDelta: -transaction.quantityDelta,
    unit: transaction.unit,
    reason: 'mealCompletionUndone',
    relatedTransactionId: transaction.id,
    createdAt: now,
  }));

  return {
    ...data,
    ingredients: data.ingredients.map((ingredient) => {
      const delta = reverseTransactions
        .filter((transaction) => transaction.ingredientItemId === ingredient.id)
        .reduce((sum, transaction) => sum + transaction.quantityDelta, 0);
      return delta === 0 ? ingredient : { ...ingredient, quantity: ingredient.quantity + delta, updatedAt: now };
    }),
    mealPlans: data.mealPlans.map((candidatePlan) =>
      candidatePlan.id === mealPlanId
        ? {
            ...candidatePlan,
            updatedAt: now,
            meals: candidatePlan.meals.map((candidateMeal) => ({
              ...candidateMeal,
              items: candidateMeal.items.map((candidateItem) =>
                candidateItem.id === itemId ? { ...candidateItem, status: 'planned', locked: false } : candidateItem,
              ),
            })),
          }
        : candidatePlan,
    ),
    inventoryTransactions: [...data.inventoryTransactions, ...reverseTransactions],
  };
}
```

- [ ] **Step 4: Build meal card UI**

Create `src/components/MealCard.tsx` with props:

```ts
type MealCardProps = {
  mealType: 'breakfast' | 'lunch' | 'dinner';
  meal?: Meal;
  onGenerate: () => void;
  onConfirm: (itemId: string) => void;
  onCancel: (itemId: string) => void;
};
```

Display:

- meal label
- planned item names
- `reasons` up to 2 items
- `warnings`
- generate button
- confirm button for planned items
- cancel button for completed items

- [ ] **Step 5: Wire Today page**

`TodayPage` must:

- show three `MealCard`s
- call `generateMeal` for the selected meal type
- preserve locked items
- save generated meal into today's `MealPlan`
- call `completePlannedMealItem`
- call `undoCompletedMealItem`
- save all updates through `saveAppData`

Create helper inside `TodayPage.tsx`:

```ts
function getLocalDateString(): string {
  return new Date().toISOString().slice(0, 10);
}
```

Use the local date consistently in the page.

- [ ] **Step 6: Run tests and manual check**

Run:

```bash
npm test -- tests/inventory.test.ts tests/planner.test.ts
npm run lint
npm run build
```

Manual check:

```bash
npm run dev
```

Generate breakfast, confirm one item, verify inventory quantity decreases, cancel it, and verify inventory quantity restores.

- [ ] **Step 7: Commit**

Run:

```bash
git add src tests/inventory.test.ts
git commit -m "feat: add today meal planning flow"
```

---

### Task 8: Settings import/export/reset, final PWA polish, and verification

**Files:**
- Modify: `src/pages/SettingsPage.tsx`
- Modify: `src/styles.css`
- Modify: `public/manifest.webmanifest`
- Modify: `docs/my-fridge-demo-arch.md`
- Modify: `docs/my-fridge-demo-arch.en.md`

**Interfaces:**
- Consumes: `resetToSampleData`, `serializeForExport`, `parseImportedData`, `saveAppData`.
- Produces: a settings page with export/import/reset actions and overwrite confirmation.

- [ ] **Step 1: Build settings data actions**

`SettingsPage` must provide:

- local data notice: `数据只保存在当前设备。清除浏览器数据、换浏览器或换设备后，数据不会自动同步。`
- reset sample data button
- export data button
- import data file input

Use exact overwrite prompt:

```ts
const confirmed = window.confirm('导入会覆盖当前本地数据。是否继续？');
```

Export implementation:

```ts
const json = serializeForExport(appData, new Date().toISOString());
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = `my-fridge-backup-${new Date().toISOString().slice(0, 10)}.json`;
link.click();
URL.revokeObjectURL(url);
```

Import implementation:

```ts
const file = event.currentTarget.files?.[0];
if (!file) {
  return;
}
if (!window.confirm('导入会覆盖当前本地数据。是否继续？')) {
  event.currentTarget.value = '';
  return;
}
try {
  const text = await file.text();
  const imported = parseImportedData(text);
  saveAppData(imported);
  setAppData(imported);
  setMessage('导入成功');
} catch (error) {
  setMessage(error instanceof Error ? error.message : '导入失败');
}
```

- [ ] **Step 2: Add responsive polish**

Update `src/styles.css` so:

- body has no horizontal overflow
- app max width is 480px on desktop and full width on mobile
- bottom nav is fixed to bottom
- buttons have at least 44px tap height
- form inputs have readable mobile sizing
- completed meal items have a visible completed state
- warning text does not overlap card content

Use CSS class names already present in components.

- [ ] **Step 3: Verify manifest**

Confirm `public/manifest.webmanifest` includes:

```json
{
  "display": "standalone",
  "theme_color": "#3f7d58"
}
```

Confirm `index.html` includes:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link rel="manifest" href="/manifest.webmanifest" />
```

- [ ] **Step 4: Update docs if implementation differs**

If implementation changed any ARCH decision, update both:

```text
docs/my-fridge-demo-arch.md
docs/my-fridge-demo-arch.en.md
```

Do not update one without the other.

- [ ] **Step 5: Run full verification**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all pass.

- [ ] **Step 6: Manual demo script**

Run:

```bash
npm run dev
```

Verify this script:

1. Open Today page.
2. Generate breakfast.
3. Confirm one planned item.
4. Open Inventory and verify quantity decreased.
5. Return Today and cancel confirmation.
6. Open Inventory and verify quantity restored.
7. Open Recipes and create a recipe named `测试米饭`.
8. Refresh the browser and confirm `测试米饭` remains.
9. Open Settings and export JSON.
10. Reset sample data.
11. Import the exported JSON after accepting overwrite warning.
12. Confirm `测试米饭` returns.

- [ ] **Step 7: Commit**

Run:

```bash
git add .
git commit -m "feat: finish demo settings and verification"
```

---

## Self-Review Notes

Spec coverage:

- PRD/ARCH local PWA scope: Task 1.
- React + TypeScript + Vite: Task 1.
- localStorage persistence: Task 3.
- JSON import/export with overwrite warning: Task 3 and Task 8.
- Form-based ingredient entry: Task 4.
- Default shelf life and expiring-soon boundary: Task 2.
- Primary unit and deterministic conversion: Task 2.
- User-created recipes: Task 5.
- `Recipe` as dish/staple/readyToEat/combo: Task 2 and Task 5.
- One-meal generation: Task 6 and Task 7.
- Generated plan does not deduct inventory: Task 6 and Task 7.
- Confirm deducts and cancel restores: Task 7.
- Locked completed items are preserved: Task 6 and Task 7.
- Lightweight nutrition tags and reasons: Task 6.
- Sample data requirements: Task 2.
- PWA manifest: Task 1 and Task 8.
- Testing focus on domain logic: Tasks 2, 3, 4, 5, 6, 7, 8.

Known scope choices:

- Demo does not implement AI entry, AI recipes, cloud sync, shopping lists, photo recognition, receipt recognition, exact calories, seasoning inventory, complex cookware/time/difficulty UI, or multi-person collaboration.
- Demo UI is Chinese only in this implementation plan because current ARCH does not require bilingual product UI. Documentation remains bilingual.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-27-my-fridge-demo.md`. Two execution options:

1. Subagent-Driven (recommended) - dispatch a fresh subagent per task, review between tasks, fast iteration.
2. Inline Execution - execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
