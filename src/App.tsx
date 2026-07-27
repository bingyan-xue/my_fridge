import { useState } from 'react';
import { BottomNav, type PageId } from './components/BottomNav';
import type { AppData } from './domain/types';
import { TodayPage } from './pages/TodayPage';
import { InventoryPage } from './pages/InventoryPage';
import { RecipesPage } from './pages/RecipesPage';
import { SettingsPage } from './pages/SettingsPage';
import { loadAppData, saveAppData } from './storage/appStorage';
import './styles.css';

export function App() {
  const [page, setPage] = useState<PageId>('today');
  const [appData, setAppData] = useState<AppData>(() => loadAppData());

  function updateAppData(next: AppData) {
    saveAppData(next);
    setAppData(next);
  }

  return (
    <div className="appShell">
      <main className="pageFrame">
        {page === 'today' && <TodayPage />}
        {page === 'inventory' && <InventoryPage appData={appData} onChange={updateAppData} />}
        {page === 'recipes' && <RecipesPage appData={appData} onChange={updateAppData} />}
        {page === 'settings' && <SettingsPage />}
      </main>
      <BottomNav activePage={page} onChange={setPage} />
    </div>
  );
}
