import { useState } from 'react';
import { BottomNav, type PageId } from './components/BottomNav';
import type { AppData } from './domain/types';
import { loadLanguage, saveLanguage, translations, type Language } from './i18n/translations';
import { TodayPage } from './pages/TodayPage';
import { InventoryPage } from './pages/InventoryPage';
import { RecipesPage } from './pages/RecipesPage';
import { SettingsPage } from './pages/SettingsPage';
import { loadAppData, saveAppData } from './storage/appStorage';
import './styles.css';

export function App() {
  const [page, setPage] = useState<PageId>('today');
  const [appData, setAppData] = useState<AppData>(() => loadAppData());
  const [language, setLanguage] = useState<Language>(() => loadLanguage());
  const t = translations[language];

  function updateAppData(next: AppData) {
    saveAppData(next);
    setAppData(next);
  }

  function updateLanguage(next: Language) {
    saveLanguage(next);
    setLanguage(next);
  }

  return (
    <div className="appShell">
      <main className="pageFrame">
        {page === 'today' && <TodayPage appData={appData} onChange={updateAppData} t={t} />}
        {page === 'inventory' && <InventoryPage appData={appData} onChange={updateAppData} t={t} />}
        {page === 'recipes' && <RecipesPage appData={appData} onChange={updateAppData} t={t} />}
        {page === 'settings' && (
          <SettingsPage appData={appData} language={language} onChange={updateAppData} onLanguageChange={updateLanguage} t={t} />
        )}
      </main>
      <BottomNav activePage={page} onChange={setPage} t={t} />
    </div>
  );
}
