import { app, BrowserWindow, protocol } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { registerIpcHandlers } from './ipc-handlers';
import { registerGlobalHotkey, unregisterGlobalHotkey } from './services/hotkey-manager';
import { cleanupOldRecordings } from './services/audio-recorder';
import { startWhisperService, stopWhisperService } from './services/whisper-process';

// Force dark theme on Linux
if (process.platform === 'linux') {
  process.env.GTK_THEME = 'Adwaita:dark';
}

let mainWindow: BrowserWindow | null = null;



function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#000000',
    title: 'Everlast Challenge - Voice Intelligence',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false,
    },
    autoHideMenuBar: true,
    darkTheme: true,
    frame: true,
    titleBarStyle: 'default',
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  const indexPath = path.join(__dirname, '../../out/index.html');
  mainWindow.loadFile(indexPath).catch((err) => {
    console.error('[Window] Failed to load:', err);
  });
  
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('enter-full-screen', () => {
    console.log('[Window] Entered fullscreen');
    if (mainWindow) {
      mainWindow.webContents.send('fullscreen-changed', true);
    }
  });

  mainWindow.on('leave-full-screen', () => {
    console.log('[Window] Left fullscreen');
    if (mainWindow) {
      mainWindow.webContents.send('fullscreen-changed', false);
    }
  });

  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('[Window] Render process crashed:', details);
  });

  mainWindow.on('unresponsive', () => {
    console.warn('[Window] Window became unresponsive');
  });
}

app.whenReady().then(async () => {
  createWindow();
  registerIpcHandlers();
  
  if (mainWindow) {
    const { getSettings } = require('./services/settings-storage');
    const settings = getSettings();
    const hotkey = settings.hotkey || 'CommandOrControl+Shift+R';
    console.log(`[App] Registering global hotkey: ${hotkey}`);
    registerGlobalHotkey(mainWindow, hotkey);
  }
  
  cleanupOldRecordings();

  // Start Whisper service asynchronously (don't block app startup)
  console.log('[App] Starting Whisper service in background...');
  startWhisperService().then((started) => {
    if (started) {
      console.log('[App] ✅ Whisper service started successfully');
    } else {
      console.warn('[App] ⚠️  Whisper service failed to start. Use external API or start service manually.');
    }
  }).catch((error) => {
    console.error('[App] ❌ Whisper service error:', error);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  unregisterGlobalHotkey();
  stopWhisperService();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  unregisterGlobalHotkey();
  stopWhisperService();
});

export { mainWindow };
