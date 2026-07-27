import type { ChangeEvent } from 'react';
import { Download, RotateCcw, Upload } from 'lucide-react';
import type { AppData } from '../domain/types';
import { parseImportedData, resetToSampleData, serializeForExport } from '../storage/appStorage';

type SettingsPageProps = {
  appData: AppData;
  onChange: (data: AppData) => void;
};

export function SettingsPage({ appData, onChange }: SettingsPageProps) {
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
    if (!window.confirm('导入会覆盖当前本地数据。是否继续？')) {
      event.currentTarget.value = '';
      return;
    }

    try {
      const text = await file.text();
      onChange(parseImportedData(text));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : '导入失败');
    } finally {
      event.currentTarget.value = '';
    }
  }

  return (
    <section className="stackPage">
      <h1>设置</h1>
      <p>管理本地数据和示例数据。</p>
      <p className="noticeText">数据只保存在当前设备。清除浏览器数据、换浏览器或换设备后，数据不会自动同步。</p>

      <div className="settingsActions">
        <button className="primaryButton" type="button" onClick={handleExport}>
          <Download aria-hidden="true" size={18} />
          导出数据
        </button>
        <label className="fileButton">
          <Upload aria-hidden="true" size={18} />
          导入数据
          <input accept="application/json" type="file" onChange={handleImport} />
        </label>
        <button className="secondaryButton" type="button" onClick={handleReset}>
          <RotateCcw aria-hidden="true" size={18} />
          恢复示例数据
        </button>
      </div>
    </section>
  );
}
