import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { setLanguage } from '@/lib/i18n';

export type RecordingStatus = 'idle' | 'recording' | 'processing' | 'transcribing' | 'generating' | 'completed' | 'error';

export interface AudioRecording {
  id: string;
  name: string;
  filePath: string;
  transcript: string | null;
  slides: any[] | null;
  createdAt: number;
  duration: number;
  markdown?: string;
  csv?: string;
}

interface RecordingState {
  status: RecordingStatus;
  recordingId: string | null;
  audioFilePath: string | null;
  audioDuration: number;
  transcript: string | null;
  slides: any[] | null;
  error: string | null;
  selectedTemplate: string;
  audioRecordings: AudioRecording[];
  selectedAudioId: string | null;
  language: string;
  
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  uploadFile: () => Promise<void>;
  transcribe: (audioPath: string) => Promise<string | null | undefined>;
  runAIPipeline: (transcript: string, recursion: boolean) => Promise<any[] | null>;
  setStatus: (status: RecordingStatus) => void;
  setTranscript: (transcript: string | null) => void;
  setSlides: (slides: any[] | null) => void;
  setError: (error: string) => void;
  setSelectedTemplate: (template: string) => void;
  setLanguage: (language: string) => void;
  reset: () => void;
  clearAudioFile: () => void;
  
  saveRecording: (recording: Omit<AudioRecording, 'id' | 'createdAt'>) => void;
  deleteRecording: (id: string) => void;
  updateRecording: (id: string, updates: Partial<AudioRecording>) => void;
  selectAudio: (id: string | null) => void;
  loadAudioForEditing: (id: string) => void;
}

export const useRecordingStore = create<RecordingState>()(
  persist(
    (set, get) => ({
  status: 'idle',
  recordingId: null,
  audioFilePath: null,
  audioDuration: 0,
  transcript: null,
  slides: null,
  error: null,
  selectedTemplate: 'dark-yellow',
  audioRecordings: [],
  selectedAudioId: null,
  language: 'en',

  startRecording: async () => {
    try {
      set({ status: 'recording', error: null });
      const result = await window.electron.startRecording();
      
      if (!result.success) {
        set({ status: 'error', error: result.error || 'Failed to start recording' });
        return;
      }
      
      set({ recordingId: result.recordingId });
    } catch (error) {
      set({ status: 'error', error: String(error) });
    }
  },

  stopRecording: async () => {
    try {
      set({ status: 'processing' });
      const result = await window.electron.stopRecording();
      
      if (!result.success) {
        set({ status: 'error', error: result.error || 'Failed to stop recording' });
        return;
      }
      
      set({ audioFilePath: result.filePath, audioDuration: result.duration || 0, status: 'idle' });
    } catch (error) {
      set({ status: 'error', error: String(error) });
    }
  },

  uploadFile: async () => {
    try {
      set({ status: 'processing', error: null });
      const result = await window.electron.uploadFile('');
      
      if (!result.success) {
        set({ status: 'idle', error: result.error || 'Failed to upload file' });
        return;
      }
      
      set({ audioFilePath: result.filePath, audioDuration: result.duration || 0, status: 'idle' });
    } catch (error) {
      set({ status: 'error', error: String(error) });
    }
  },

  transcribe: async (audioPath: string) => {
    try {
      set({ status: 'transcribing', error: null });
      const result = await window.electron.transcribe(audioPath);
      
      if (!result.success) {
        set({ status: 'error', error: result.error || 'Transcription failed' });
        return null;
      }
      
      set({ transcript: result.transcript || null, status: 'idle' });
      return result.transcript || null;
    } catch (error) {
      set({ status: 'error', error: String(error) });
      return null;
    }
  },

  runAIPipeline: async (transcript: string, recursion: boolean) => {
    try {
      set({ status: 'generating', error: null });
      const result = await window.electron.runPipeline(transcript, { recursion });
      
      if (!result.success) {
        set({ status: 'error', error: result.error || 'AI pipeline failed' });
        return null;
      }
      
      set({ slides: result.slides, status: 'completed' });
      return result.slides;
    } catch (error) {
      set({ status: 'error', error: String(error) });
      return null;
    }
  },

  setStatus: (status) => set({ status }),
  
  setTranscript: (transcript) => set({ transcript }),
  
  setSlides: (slides) => set({ slides }),
  
  setError: (error) => set({ status: 'error', error }),
  
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
  
  setLanguage: (lang: string) => {
    setLanguage(lang as 'en' | 'de');
    set({ language: lang });
  },
  
  reset: () => set({
    status: 'idle',
    recordingId: null,
    audioFilePath: null,
    audioDuration: 0,
    transcript: null,
    slides: null,
    error: null,
    selectedTemplate: 'dark-yellow',
  }),

  clearAudioFile: () => set({
    audioFilePath: null,
    audioDuration: 0,
    transcript: null,
    slides: null,
    status: 'idle',
    recordingId: null,
    error: null,
  }),

  saveRecording: (recording) => {
    const newRecording: AudioRecording = {
      ...recording,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    set((state) => ({
      audioRecordings: [newRecording, ...state.audioRecordings],
    }));
  },

  deleteRecording: (id) => {
    set((state) => ({
      audioRecordings: state.audioRecordings.filter((r) => r.id !== id),
      selectedAudioId: state.selectedAudioId === id ? null : state.selectedAudioId,
    }));
  },

  updateRecording: (id, updates) => {
    set((state) => ({
      audioRecordings: state.audioRecordings.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    }));
  },

  selectAudio: (id) => set({ selectedAudioId: id }),

  loadAudioForEditing: (id) => {
    const recording = get().audioRecordings.find((r) => r.id === id);
    if (recording) {
      set({
        audioFilePath: recording.filePath,
        transcript: recording.transcript,
        slides: recording.slides,
        selectedAudioId: id,
      });
    }
  },
}),
    {
      name: 'recording-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
