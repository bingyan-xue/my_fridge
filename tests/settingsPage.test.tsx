import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSampleAppData } from '../src/domain/sampleData';
import { SettingsPage } from '../src/pages/SettingsPage';
import { translations } from '../src/i18n/translations';

describe('SettingsPage reset confirmation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('resets sample data after English in-page confirmation', () => {
    const appData = { ...createSampleAppData(), ingredients: [] };
    const onChange = vi.fn();

    render(
      <SettingsPage
        appData={appData}
        language="en"
        onChange={onChange}
        onLanguageChange={vi.fn()}
        t={translations.en}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Reset sample data' }));
    expect(screen.getByText('Resetting sample data will erase all current local data. Continue?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].ingredients.length).toBeGreaterThan(0);
  });

  it('does not reset sample data when English in-page confirmation is canceled', () => {
    const appData = { ...createSampleAppData(), ingredients: [] };
    const onChange = vi.fn();

    render(
      <SettingsPage
        appData={appData}
        language="en"
        onChange={onChange}
        onLanguageChange={vi.fn()}
        t={translations.en}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Reset sample data' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByText('Resetting sample data will erase all current local data. Continue?')).not.toBeInTheDocument();
  });

  it('uses Chinese reset confirmation text in the Simplified Chinese interface', () => {
    const onChange = vi.fn();

    render(
      <SettingsPage
        appData={createSampleAppData()}
        language="zh-CN"
        onChange={onChange}
        onLanguageChange={vi.fn()}
        t={translations['zh-CN']}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '恢复示例数据' }));
    fireEvent.click(screen.getByRole('button', { name: '取消' }));

    expect(screen.queryByText('恢复示例数据会清除当前所有本地数据。是否继续？')).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('SettingsPage import confirmation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('imports data after English in-page confirmation', async () => {
    const appData = createSampleAppData();
    const importedData = { ...createSampleAppData(), ingredients: [] };
    const onChange = vi.fn();
    const { container } = render(
      <SettingsPage
        appData={appData}
        language="en"
        onChange={onChange}
        onLanguageChange={vi.fn()}
        t={translations.en}
      />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([JSON.stringify(importedData)], 'backup.json', { type: 'application/json' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByText('Importing will overwrite your current local data. Continue?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].ingredients).toHaveLength(0);
  });

  it('does not import data when English in-page confirmation is canceled', async () => {
    const appData = createSampleAppData();
    const importedData = { ...createSampleAppData(), ingredients: [] };
    const onChange = vi.fn();
    const { container } = render(
      <SettingsPage
        appData={appData}
        language="en"
        onChange={onChange}
        onLanguageChange={vi.fn()}
        t={translations.en}
      />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([JSON.stringify(importedData)], 'backup.json', { type: 'application/json' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByText('Importing will overwrite your current local data. Continue?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByText('Importing will overwrite your current local data. Continue?')).not.toBeInTheDocument();
  });
});
