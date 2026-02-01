interface Window {
  electron: {
    ping: () => Promise<any>;
    navigate: (page: string, data?: any) => Promise<{ success: boolean; error?: string }>;
    getSharedState: () => Promise<any>;
    setSharedState: (data: any) => Promise<{ success: boolean }>;
    startRecording: () => Promise<{ success: boolean; recordingId?: string; error?: string }>;
    stopRecording: () => Promise<{ success: boolean; filePath?: string; duration?: number; error?: string }>;
    uploadFile: (filePath: string) => Promise<{ success: boolean; filePath?: string; duration?: number; error?: string }>;
    transcribe: (audioPath: string) => Promise<{ success: boolean; transcript?: string; error?: string }>;
    checkWhisperHealth: () => Promise<{ success: boolean; healthy: boolean; error?: string }>;
    paraphrase: (transcript: string) => Promise<any>;
    segment: (transcript: string) => Promise<any>;
    runPipeline: (transcript: string, options: { recursion: boolean }) => Promise<any>;
    checkOllama: () => Promise<any>;
    onAIProgress: (callback: (data: { stage: string; current: number; total: number }) => void) => () => void;
    summarizeTranscription: (transcript: string, ollamaUrl: string) => Promise<{ success: boolean; summaries?: any[]; error?: string }>;
    onSummarizationProgress: (callback: (data: { stage: string }) => void) => () => void;
    exportPPTX: (slides: any[], style: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;
    exportMarkdown: (transcript: string, slides: any[]) => Promise<{ success: boolean; filePath?: string; error?: string }>;
    exportCSV: (slides: any[]) => Promise<{ success: boolean; filePath?: string; error?: string }>;
    getSettings: () => Promise<any>;
    setSettings: (settings: any) => Promise<any>;
    openFile: (filePath: string) => Promise<{ success: boolean; error?: string }>;
  };
}
