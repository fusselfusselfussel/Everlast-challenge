import Store from 'electron-store';

export interface AppSettings {
  hotkey: string;
  ollamaUrl: string;
  whisperUrl: string;
  whisperModel: 'medium' | 'large-v3';
  llmQuantization: boolean;
  recursionLayer: boolean;
  defaultStyle: string;
  autoExportPptx: boolean;
  language: 'en' | 'de';
  useExternalAPI: boolean;
  externalAPIUrl: string;
  externalAPIKey: string;
  useExternalWhisper: boolean;
  externalWhisperUrl: string;
  externalWhisperKey: string;
}

const defaultSettings: AppSettings = {
  hotkey: 'CommandOrControl+Shift+R',
  ollamaUrl: 'http://localhost:11434',
  whisperUrl: 'http://localhost:8001',
  whisperModel: 'medium',
  llmQuantization: true,
  recursionLayer: false,
  defaultStyle: 'dark-yellow',
  autoExportPptx: false,
  language: 'en',
  useExternalAPI: false,
  externalAPIUrl: '',
  externalAPIKey: '',
  useExternalWhisper: false,
  externalWhisperUrl: '',
  externalWhisperKey: '',
};

const store = new Store<{ settings: AppSettings }>({
  name: 'everlast-settings',
  defaults: {
    settings: defaultSettings,
  },
});

export function getSettings(): AppSettings {
  const settings = store.get('settings');
  console.log('[Settings Storage] Loaded settings:', settings);
  return { ...defaultSettings, ...settings };
}

export function saveSettings(settings: Partial<AppSettings>): void {
  const currentSettings = getSettings();
  const updatedSettings = { ...currentSettings, ...settings };
  store.set('settings', updatedSettings);
  console.log('[Settings Storage] Saved settings:', updatedSettings);
}

export function resetSettings(): void {
  store.set('settings', defaultSettings);
  console.log('[Settings Storage] Reset to default settings');
}

export function getSettingsPath(): string {
  return store.path;
}
