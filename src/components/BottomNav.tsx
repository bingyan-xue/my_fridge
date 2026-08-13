import { BookOpen, CalendarDays, Refrigerator } from 'lucide-react';
import type { Translation } from '../i18n/translations';

export type PageId = 'today' | 'inventory' | 'recipes' | 'settings';
type MainPageId = Exclude<PageId, 'settings'>;

type BottomNavProps = {
  activePage: PageId;
  onChange: (page: PageId) => void;
  t: Translation;
};

const navItems: Array<{ id: MainPageId; labelKey: MainPageId; icon: typeof CalendarDays }> = [
  { id: 'today', labelKey: 'today', icon: CalendarDays },
  { id: 'inventory', labelKey: 'inventory', icon: Refrigerator },
  { id: 'recipes', labelKey: 'recipes', icon: BookOpen },
];

export function BottomNav({ activePage, onChange, t }: BottomNavProps) {
  return (
    <nav className="bottomNav" aria-label={t.nav.ariaLabel}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const classes = ['navButton'];
        if (item.id === 'today') {
          classes.push('navButtonToday');
        }
        if (item.id === activePage) {
          classes.push('navButtonActive');
        }

        return (
          <button
            key={item.id}
            className={classes.join(' ')}
            type="button"
            onClick={() => onChange(item.id)}
          >
            <Icon aria-hidden="true" size={20} />
            <span>{t.nav[item.labelKey]}</span>
          </button>
        );
      })}
    </nav>
  );
}
