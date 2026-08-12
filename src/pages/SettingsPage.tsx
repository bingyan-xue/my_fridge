import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { Download, RotateCcw, Upload } from 'lucide-react';
import type { AppData } from '../domain/types';
import type { Language, Translation } from '../i18n/translations';
import { parseImportedData, resetToSampleData, serializeForExport } from '../storage/appStorage';

type SettingsPageProps = {
  appData: AppData;
  language: Language;
  onChange: (data: AppData) => void;
  onLanguageChange: (language: Language) => void;
  t: Translation;
};

function readFileText(file: File): Promise<string> {
  if (typeof file.text === 'function') {
    return file.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}

export function SettingsPage({ appData, language, onChange, onLanguageChange, t }: SettingsPageProps) {
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [pendingImportText, setPendingImportText] = useState<string | null>(null);

  function handleReset() {
    onChange(resetToSampleData());
    setIsResetConfirmOpen(false);
  }

  function handleExport() {
    const json = serializeForExport(appData, new Date().toISOString());
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my-fridge-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await readFileText(file);
      setPendingImportText(text);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : t.common.importFailed);
    } finally {
      input.value = '';
    }
  }

  function handleConfirmImport() {
    if (pendingImportText === null) {
      return;
    }

    try {
      onChange(parseImportedData(pendingImportText));
      setPendingImportText(null);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : t.common.importFailed);
    }
  }

  return (
    <section className="stackPage">
      <h1>{t.settings.title}</h1>
      <p>{t.settings.description}</p>
      <p className="noticeText">{t.settings.notice}</p>

      <div className="fieldGroup">
        <label htmlFor="language-select">{t.settings.language}</label>
        <select id="language-select" value={language} onChange={(event) => onLanguageChange(event.target.value as Language)}>
          <option value="en">{t.settings.english}</option>
          <option value="zh-CN">{t.settings.simplifiedChinese}</option>
        </select>
      </div>

      <div className="settingsActions">
        <button className="primaryButton" type="button" onClick={handleExport}>
          <Download aria-hidden="true" size={18} />
          {t.settings.exportData}
        </button>
        <label className="fileButton">
          <Upload aria-hidden="true" size={18} />
          {t.settings.importData}
          <input accept="application/json" type="file" onChange={handleImport} />
        </label>
        <button className="secondaryButton" type="button" onClick={() => setIsResetConfirmOpen(true)}>
          <RotateCcw aria-hidden="true" size={18} />
          {t.settings.resetSampleData}
        </button>
      </div>

      {isResetConfirmOpen && (
        <div className="modalBackdrop" role="presentation">
          <section className="confirmDialog" role="dialog" aria-modal="true" aria-labelledby="reset-confirm-title">
            <h2 id="reset-confirm-title">{t.settings.resetSampleData}</h2>
            <p>{t.settings.resetSampleDataConfirm}</p>
            <div className="dialogActions">
              <button className="secondaryButton" type="button" onClick={() => setIsResetConfirmOpen(false)}>
                {t.common.cancel}
              </button>
              <button className="primaryButton" type="button" onClick={handleReset}>
                {t.common.confirm}
              </button>
            </div>
          </section>
        </div>
      )}

      {pendingImportText !== null && (
        <div className="modalBackdrop" role="presentation">
          <section className="confirmDialog" role="dialog" aria-modal="true" aria-labelledby="import-confirm-title">
            <h2 id="import-confirm-title">{t.settings.importData}</h2>
            <p>{t.settings.importOverwriteConfirm}</p>
            <div className="dialogActions">
              <button className="secondaryButton" type="button" onClick={() => setPendingImportText(null)}>
                {t.common.cancel}
              </button>
              <button className="primaryButton" type="button" onClick={handleConfirmImport}>
                {t.common.confirm}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
