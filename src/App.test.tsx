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
});
