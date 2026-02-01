import { globalShortcut, BrowserWindow } from 'electron';

let isRecording = false;
let currentHotkey: string | null = null;
let mainWindow: BrowserWindow | null = null;

export function registerGlobalHotkey(window: BrowserWindow, hotkey: string = 'CommandOrControl+Shift+R') {
  mainWindow = window;
  
  if (currentHotkey) {
    globalShortcut.unregister(currentHotkey);
    console.log(`[Hotkey] Unregistered previous hotkey: ${currentHotkey}`);
  }
  
  const success = globalShortcut.register(hotkey, () => {
    console.log(`[Hotkey] ${hotkey} pressed`);
    
    isRecording = !isRecording;
    
    if (isRecording) {
      console.log('[Hotkey] Starting recording...');
      window.webContents.send('hotkey:recording-start');
    } else {
      console.log('[Hotkey] Stopping recording...');
      window.webContents.send('hotkey:recording-stop');
    }
  });

  if (success) {
    currentHotkey = hotkey;
    console.log(`✅ Global hotkey registered: ${hotkey}`);
  } else {
    console.error(`❌ Failed to register global hotkey: ${hotkey}`);
    currentHotkey = null;
  }
  
  return success;
}

export function updateGlobalHotkey(hotkey: string) {
  if (!mainWindow) {
    console.error('[Hotkey] No main window available');
    return false;
  }
  
  return registerGlobalHotkey(mainWindow, hotkey);
}

export function unregisterGlobalHotkey() {
  globalShortcut.unregisterAll();
  currentHotkey = null;
  console.log('🔓 All global hotkeys unregistered');
}

export function isHotkeyRegistered(hotkey?: string): boolean {
  if (hotkey) {
    return globalShortcut.isRegistered(hotkey);
  }
  return currentHotkey !== null && globalShortcut.isRegistered(currentHotkey);
}
