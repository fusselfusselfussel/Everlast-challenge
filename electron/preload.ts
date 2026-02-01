import { contextBridge, ipcRenderer } from 'electron';

declare const window: {
  dispatchEvent: (event: Event) => boolean;
};

const electronAPI = {
  // Test IPC
  ping: () => ipcRenderer.invoke('ping'),
  
  // Navigation
  navigate: (page: string, data?: any): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('navigate', page, data),
  getSharedState: (): Promise<any> =>
    ipcRenderer.invoke('get-shared-state'),
  setSharedState: (data: any): Promise<{ success: boolean }> =>
    ipcRenderer.invoke('set-shared-state', data),
  
  // Audio
  startRecording: (): Promise<{ success: boolean; recordingId?: string; error?: string }> => 
    ipcRenderer.invoke('audio:start-recording'),
  stopRecording: (): Promise<{ success: boolean; filePath?: string; duration?: number; error?: string }> => 
    ipcRenderer.invoke('audio:stop-recording'),
  uploadFile: (filePath: string): Promise<{ success: boolean; filePath?: string; duration?: number; error?: string }> => 
    ipcRenderer.invoke('audio:upload-file', filePath),
  
  // Transcription
  transcribe: (audioPath: string): Promise<{ success: boolean; transcript?: string; error?: string }> => 
    ipcRenderer.invoke('whisper:transcribe', audioPath),
  checkWhisperHealth: (): Promise<{ success: boolean; healthy: boolean; error?: string }> =>
    ipcRenderer.invoke('whisper:health'),
  
  // AI Pipeline
  paraphrase: (transcript: string) => ipcRenderer.invoke('ai:paraphrase', transcript),
  segment: (transcript: string) => ipcRenderer.invoke('ai:segment', transcript),
  runPipeline: (transcript: string, options: { recursion: boolean }) => 
    ipcRenderer.invoke('ai:run-pipeline', transcript, options),
  checkOllama: () => ipcRenderer.invoke('ai:check-ollama'),
  onAIProgress: (callback: (data: { stage: string; current: number; total: number }) => void) => {
    const listener = (_event: any, data: any) => callback(data);
    ipcRenderer.on('ai:progress', listener);
    return () => ipcRenderer.removeListener('ai:progress', listener);
  },
  
  summarizeTranscription: (transcript: string, ollamaUrl: string): Promise<{ success: boolean; summaries?: any[]; error?: string }> =>
    ipcRenderer.invoke('ai:summarize-transcription', transcript, ollamaUrl),
  onSummarizationProgress: (callback: (data: { stage: string }) => void) => {
    const listener = (_event: any, data: any) => callback(data);
    ipcRenderer.on('ai:summarization-progress', listener);
    return () => ipcRenderer.removeListener('ai:summarization-progress', listener);
  },
  
  // Export
  exportPPTX: (slides: any[], style: string): Promise<{ success: boolean; filePath?: string; error?: string }> => 
    ipcRenderer.invoke('export:pptx', slides, style),
  exportMarkdown: (transcript: string, slides: any[]): Promise<{ success: boolean; filePath?: string; error?: string }> => 
    ipcRenderer.invoke('export:markdown', transcript, slides),
  exportCSV: (slides: any[]): Promise<{ success: boolean; filePath?: string; error?: string }> => 
    ipcRenderer.invoke('export:csv', slides),
  
  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (settings: any) => ipcRenderer.invoke('settings:set', settings),
  
  // File operations
  openFile: (filePath: string): Promise<{ success: boolean; error?: string }> => 
    ipcRenderer.invoke('file:open', filePath),
};

contextBridge.exposeInMainWorld('electron', electronAPI);

ipcRenderer.on('hotkey:recording-start', () => {
  window.dispatchEvent(new Event('hotkey:recording-start'));
});

ipcRenderer.on('hotkey:recording-stop', () => {
  window.dispatchEvent(new Event('hotkey:recording-stop'));
});

export type ElectronAPI = typeof electronAPI;
