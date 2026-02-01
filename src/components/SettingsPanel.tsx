'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { setLanguage } from '@/lib/i18n';

interface Settings {
  hotkey: string;
  ollamaUrl: string;
  whisperUrl: string;
  whisperModel: string;
  llmQuantization: boolean;
  recursionLayer: boolean;
  defaultStyle: string;
  autoExportPptx: boolean;
  language: string;
  useExternalAPI: boolean;
  externalAPIUrl: string;
  externalAPIKey: string;
  useExternalWhisper: boolean;
  externalWhisperUrl: string;
  externalWhisperKey: string;
}

export function SettingsPanel() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const result = await window.electron.getSettings();
      setSettings(result);
    } catch (error) {
      console.error('[Settings] Failed to load:', error);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      setLanguage(settings.language as 'en' | 'de');
      
      await window.electron.setSettings(settings);
      
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('[Settings] Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return null;
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          variant="secondary"
          className="rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
        >
          ⚙️
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border-yellow-400">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-yellow-400">Settings</h2>
            <Button onClick={() => setIsOpen(false)} variant="ghost" className="text-yellow-400">
              ✕
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-yellow-400/80">
                Recording Hotkey
              </label>
              <select
                value={settings.hotkey}
                onChange={(e) => setSettings({ ...settings, hotkey: e.target.value })}
                className="w-full p-3 rounded-xl bg-black border-2 border-yellow-400/30 text-white focus:border-yellow-400 focus:outline-none"
              >
                <option value="CommandOrControl+Shift+R">Ctrl/Cmd + Shift + R</option>
                <option value="CommandOrControl+Alt+R">Ctrl/Cmd + Alt + R</option>
                <option value="CommandOrControl+Shift+Space">Ctrl/Cmd + Shift + Space</option>
                <option value="F9">F9</option>
                <option value="F10">F10</option>
                <option value="F11">F11</option>
                <option value="CommandOrControl+R">Ctrl/Cmd + R</option>
              </select>
              <p className="text-xs text-yellow-400/50">
                Global hotkey to start/stop recording from anywhere
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-yellow-400/80">
                  Ollama URL
                </label>
                <input
                  type="text"
                  value={settings.ollamaUrl}
                  onChange={(e) => setSettings({ ...settings, ollamaUrl: e.target.value })}
                  className="w-full p-3 rounded-xl bg-black border-2 border-yellow-400/30 text-white focus:border-yellow-400 focus:outline-none"
                  placeholder="http://localhost:11434"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-yellow-400/80">
                  Whisper URL
                </label>
                <input
                  type="text"
                  value={settings.whisperUrl}
                  onChange={(e) => setSettings({ ...settings, whisperUrl: e.target.value })}
                  className="w-full p-3 rounded-xl bg-black border-2 border-yellow-400/30 text-white focus:border-yellow-400 focus:outline-none"
                  placeholder="http://localhost:8001"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-yellow-400/80">
                  Whisper Model
                </label>
                <select
                  value={settings.whisperModel}
                  onChange={(e) => setSettings({ ...settings, whisperModel: e.target.value })}
                  className="w-full p-3 rounded-xl bg-black border-2 border-yellow-400/30 text-white focus:border-yellow-400 focus:outline-none"
                >
                  <option value="medium">Medium (Faster, 1.5GB)</option>
                  <option value="large-v3">Large-v3 (More Accurate, 10GB)</option>
                </select>
                <p className="text-xs text-yellow-400/50">
                  Requires restarting service
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-yellow-400/80">
                  Language / Sprache
                </label>
                <select
                  value={settings.language || 'en'}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full p-3 rounded-xl bg-black border-2 border-yellow-400/30 text-white focus:border-yellow-400 focus:outline-none"
                >
                  <option value="en">English</option>
                  <option value="de">Deutsch</option>
                </select>
                <p className="text-xs text-yellow-400/50">
                  Interface language
                </p>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-black border-2 border-yellow-400/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-400/90">LLM Quantization</p>
                  <p className="text-xs text-yellow-400/50">Faster inference, slightly lower accuracy</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.llmQuantization}
                  onChange={(e) => setSettings({ ...settings, llmQuantization: e.target.checked })}
                  className="w-5 h-5 accent-yellow-400"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-400/90">Recursion Layer</p>
                  <p className="text-xs text-yellow-400/50">Enable verification (2x-3x slower)</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.recursionLayer}
                  onChange={(e) => setSettings({ ...settings, recursionLayer: e.target.checked })}
                  className="w-5 h-5 accent-yellow-400"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-400/90">Auto-Export PPTX</p>
                  <p className="text-xs text-yellow-400/50">Automatically save after generation</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoExportPptx}
                  onChange={(e) => setSettings({ ...settings, autoExportPptx: e.target.checked })}
                  className="w-5 h-5 accent-yellow-400"
                />
              </div>
            </div>

            <div className="space-y-4 p-4 rounded-xl bg-black border-2 border-yellow-400/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-400/90">Use External LLM API</p>
                  <p className="text-xs text-yellow-400/50">Use external API instead of local Ollama</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.useExternalAPI}
                  onChange={(e) => setSettings({ ...settings, useExternalAPI: e.target.checked })}
                  className="w-5 h-5 accent-yellow-400"
                />
              </div>

              {settings.useExternalAPI && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-yellow-400/80">
                      External LLM API URL
                    </label>
                    <input
                      type="text"
                      value={settings.externalAPIUrl}
                      onChange={(e) => setSettings({ ...settings, externalAPIUrl: e.target.value })}
                      className="w-full p-3 rounded-xl bg-black border-2 border-yellow-400/30 text-white focus:border-yellow-400 focus:outline-none"
                      placeholder="https://api.example.com/v1"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-yellow-400/80">
                      LLM API Key
                    </label>
                    <input
                      type="password"
                      value={settings.externalAPIKey}
                      onChange={(e) => setSettings({ ...settings, externalAPIKey: e.target.value })}
                      className="w-full p-3 rounded-xl bg-black border-2 border-yellow-400/30 text-white focus:border-yellow-400 focus:outline-none"
                      placeholder="sk-..."
                    />
                  </div>
                </>
              )}
            </div>

            <div className="space-y-4 p-4 rounded-xl bg-black border-2 border-yellow-400/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-400/90">Use External Whisper API</p>
                  <p className="text-xs text-yellow-400/50">Use external API instead of local Whisper service</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.useExternalWhisper}
                  onChange={(e) => setSettings({ ...settings, useExternalWhisper: e.target.checked })}
                  className="w-5 h-5 accent-yellow-400"
                />
              </div>

              {settings.useExternalWhisper && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-yellow-400/80">
                      External Whisper API URL
                    </label>
                    <input
                      type="text"
                      value={settings.externalWhisperUrl}
                      onChange={(e) => setSettings({ ...settings, externalWhisperUrl: e.target.value })}
                      className="w-full p-3 rounded-xl bg-black border-2 border-yellow-400/30 text-white focus:border-yellow-400 focus:outline-none"
                      placeholder="https://api.openai.com/v1/audio/transcriptions"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-yellow-400/80">
                      Whisper API Key
                    </label>
                    <input
                      type="password"
                      value={settings.externalWhisperKey}
                      onChange={(e) => setSettings({ ...settings, externalWhisperKey: e.target.value })}
                      className="w-full p-3 rounded-xl bg-black border-2 border-yellow-400/30 text-white focus:border-yellow-400 focus:outline-none"
                      placeholder="sk-..."
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t-2 border-yellow-400/20">
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="primary"
              className="flex-1"
            >
              {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Settings'}
            </Button>
            <Button onClick={() => setIsOpen(false)} variant="secondary">
              Cancel
            </Button>
          </div>

          <div className="text-xs text-yellow-400/50 space-y-1">
            <p>• Settings are saved locally and persist across sessions</p>
            <p>• Some changes may require restarting services or the application</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
