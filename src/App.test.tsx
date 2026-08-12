import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './App';
import { LANGUAGE_STORAGE_KEY } from './i18n/translations';

describe('App shell', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders English as the default interface language', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Inventory/ })).toBeInTheDocument();
  });

  it('switches between main pages from the bottom navigation', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Inventory/ }));

    expect(screen.getByRole('heading', { name: 'Inventory' })).toBeInTheDocument();
  });

  it('switches the interface to Simplified Chinese and persists the choice', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Settings/ }));
    fireEvent.change(screen.getByLabelText('Language'), { target: { value: 'zh-CN' } });

    expect(screen.getByRole('heading', { name: '设置' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /库存/ })).toBeInTheDocument();
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('zh-CN');
  });

  it('keeps a newly created recipe after reopening the app', () => {
    const { unmount } = render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Recipes/ }));
    fireEvent.change(screen.getByLabelText('Recipe name'), { target: { value: 'Test Rice' } });
    fireEvent.change(screen.getByLabelText('Ingredient 1 name'), { target: { value: 'Rice' } });
    fireEvent.change(screen.getByLabelText('Ingredient 1 quantity'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Ingredient 1 unit'), { target: { value: 'g' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save recipe' }));

    expect(screen.getByRole('heading', { name: 'Test Rice' })).toBeInTheDocument();

    unmount();
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Recipes/ }));

    expect(screen.getByRole('heading', { name: 'Test Rice' })).toBeInTheDocument();
  });

  it('can switch language after confirming sample data reset', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Settings/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset sample data' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    fireEvent.change(screen.getByLabelText('Language'), { target: { value: 'zh-CN' } });

    expect(screen.getByRole('heading', { name: '设置' })).toBeInTheDocument();
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('zh-CN');
  });

  it('can switch back to English after confirming sample data reset in Chinese', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Settings/ }));
    fireEvent.change(screen.getByLabelText('Language'), { target: { value: 'zh-CN' } });
    fireEvent.click(screen.getByRole('button', { name: '恢复示例数据' }));
    fireEvent.click(screen.getByRole('button', { name: '确认' }));
    fireEvent.change(screen.getByLabelText('Language'), { target: { value: 'en' } });

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
  });
});
