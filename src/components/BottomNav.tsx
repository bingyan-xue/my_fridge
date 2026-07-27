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
