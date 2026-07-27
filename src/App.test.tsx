import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App shell', () => {
  it('renders the default today page and bottom navigation', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: '今日' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: '主导航' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /库存/ })).toBeInTheDocument();
  });

  it('switches between main pages from the bottom navigation', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /库存/ }));

    expect(screen.getByRole('heading', { name: '库存' })).toBeInTheDocument();
  });
});
