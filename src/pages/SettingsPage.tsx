import type { ChangeEvent } from 'react';
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

export function SettingsPage({ appData, language, onChange, onLanguageChange, t }: SettingsPageProps) {
  function handleReset() {
    onChange(resetToSampleData());
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
    const file = event.currentTarget.files?.[0];
    if (!file) {
      return;
    }
    if (!window.confirm(t.settings.importOverwriteConfirm)) {
      event.currentTarget.value = '';
      return;
    }

    try {
      const text = await file.text();
      onChange(parseImportedData(text));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : t.common.importFailed);
    } finally {
      event.currentTarget.value = '';
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
        <button className="secondaryButton" type="button" onClick={handleReset}>
          <RotateCcw aria-hidden="true" size={18} />
          {t.settings.resetSampleData}
        </button>
      </div>
    </section>
  );
}
