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
