'use client';

import { useState, useEffect } from 'react';
import { RecordingControls } from '@/components/RecordingControls';
import { TranscriptView } from '@/components/TranscriptView';
import { AIPipelineProgress } from '@/components/AIPipelineProgress';
import { ExportControls } from '@/components/ExportControls';
import { ServiceStatus } from '@/components/ServiceStatus';
import { SettingsPanel } from '@/components/SettingsPanel';
import { AudioLibraryList } from '@/components/AudioLibraryList';
import { AudioDetailView } from '@/components/AudioDetailView';
import { PresentationPreview } from '@/components/PresentationPreview';
import { TemplateSelector } from '@/components/TemplateSelector';
import { EditorToolbar } from '@/components/EditorToolbar';
import { SummaryView } from '@/components/SummaryView';
import { Button } from '@/components/ui/Button';
import { useRecordingStore } from '@/store/recording-store';
import { setLanguage, t } from '@/lib/i18n';

type Tab = 'record' | 'library' | 'summary' | 'editor';

export default function Home() {
  const { slides, selectedAudioId, audioRecordings, runAIPipeline, setSlides, setStatus, setTranscript } = useRecordingStore();
  const hasSlides = !!slides && slides.length > 0;
  const [activeTab, setActiveTab] = useState<Tab>('record');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>(null);
  const [generatingSlides, setGeneratingSlides] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await window.electron.getSettings();
        if (settings && settings.language) {
          setLanguage(settings.language);
        }
      } catch (error) {
        console.error('[Home] Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  const handleGenerateSlidesFromLibrary = async () => {
    if (!selectedLibraryId) return;
    
    const recording = audioRecordings.find(r => r.id === selectedLibraryId);
    if (!recording || !recording.transcript) return;
    
    setGeneratingSlides(true);
    setStatus('generating');
    setEditorError(null);
    setTranscript(recording.transcript);
    
    try {
      const settings = await window.electron.getSettings();
      const generatedSlides = await runAIPipeline(recording.transcript, settings.recursionLayer || false);
      
      if (generatedSlides) {
        setSlides(generatedSlides);
        setStatus('completed');
        setEditorError(null);
      } else {
        setEditorError('Failed to generate slides. Please check your API configuration in Settings.');
        setStatus('error');
      }
    } catch (error) {
      console.error('[Editor] Failed to generate slides:', error);
      setEditorError(String(error));
      setStatus('error');
    } finally {
      setGeneratingSlides(false);
    }
  };

  const handleResetPresentation = () => {
    setSlides(null);
    setTranscript(null);
    setStatus('idle');
    setEditorError(null);
    setSelectedLibraryId(null);
  };

  return (
    <main className="min-h-screen bg-black">
      <div className="flex h-screen relative">
        <aside className={`bg-black flex flex-col transition-all duration-300 border-r border-yellow-400 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
          <div className="p-6">
            {!sidebarCollapsed && (
              <>
                <h1 className="text-2xl font-bold text-yellow-400">
                  {t('app.title')}
                </h1>
                <p className="text-xs text-yellow-400/70 mt-1">
                  {t('app.subtitle')}
                </p>
              </>
            )}
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => setActiveTab('record')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                activeTab === 'record'
                  ? 'bg-yellow-400/20 text-yellow-400 border-l-4 border-yellow-400'
                  : 'text-yellow-400/70 hover:bg-yellow-400/10 hover:text-yellow-400'
              }`}
              title={t('nav.record')}
            >
              <img 
                src="/icons/voice_recording_asset_black_-removebg-preview.png" 
                alt={t('nav.record')} 
                width={sidebarCollapsed ? "48" : "40"} 
                height={sidebarCollapsed ? "48" : "40"}
                className="flex-shrink-0"
              />
              {!sidebarCollapsed && <span className="font-semibold">{t('nav.record')}</span>}
            </button>
            
            <button
              onClick={() => setActiveTab('library')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                activeTab === 'library'
                  ? 'bg-yellow-400/20 text-yellow-400 border-l-4 border-yellow-400'
                  : 'text-yellow-400/70 hover:bg-yellow-400/10 hover:text-yellow-400'
              }`}
              title={t('nav.library')}
            >
              <img 
                src="/icons/folder_icon_asset_black-removebg-previewTRANSPARENT.png" 
                alt={t('nav.library')} 
                width={sidebarCollapsed ? "48" : "40"} 
                height={sidebarCollapsed ? "48" : "40"}
                className="flex-shrink-0"
              />
              {!sidebarCollapsed && <span className="font-semibold">{t('nav.library')}</span>}
            </button>

            <button
              onClick={() => setActiveTab('summary')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                activeTab === 'summary'
                  ? 'bg-yellow-400/20 text-yellow-400 border-l-4 border-yellow-400'
                  : 'text-yellow-400/70 hover:bg-yellow-400/10 hover:text-yellow-400'
              }`}
              title={t('nav.summary')}
            >
              <img 
                src="/icons/summary_icon_asset-removebg-preview.png" 
                alt={t('nav.summary')} 
                width={sidebarCollapsed ? "48" : "40"} 
                height={sidebarCollapsed ? "48" : "40"}
                className="flex-shrink-0"
              />
              {!sidebarCollapsed && <span className="font-semibold">{t('nav.summary')}</span>}
            </button>

            <button
              onClick={() => setActiveTab('editor')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                activeTab === 'editor'
                  ? 'bg-yellow-400/20 text-yellow-400 border-l-4 border-yellow-400'
                  : 'text-yellow-400/70 hover:bg-yellow-400/10 hover:text-yellow-400'
              }`}
              title={t('nav.editor')}
            >
              <img 
                src="/icons/powerpoint_editor_icon_asset-removebg-preview.png" 
                alt={t('nav.editor')} 
                width={sidebarCollapsed ? "48" : "40"} 
                height={sidebarCollapsed ? "48" : "40"}
                className="flex-shrink-0"
              />
              {!sidebarCollapsed && <span className="font-semibold">{t('nav.editor')}</span>}
            </button>
          </nav>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-4 text-yellow-400 hover:bg-yellow-400/10 transition-all flex items-center justify-center"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <span className="text-2xl">{sidebarCollapsed ? '→' : '←'}</span>
          </button>
        </aside>

        <div className="flex-1 overflow-y-auto p-8 bg-black">
          <div className="max-w-6xl mx-auto space-y-8">
            {activeTab === 'record' && (
              <>
                <header className="space-y-4">
                  <h2 className="text-4xl font-bold text-yellow-400">
                    {t('record.title')}
                  </h2>
                  <p className="text-lg text-yellow-400/70">
                    {t('record.subtitle')}
                  </p>
                </header>

                <ServiceStatus />
                <RecordingControls />
                <TranscriptView />
                <SettingsPanel />
              </>
            )}

            {activeTab === 'library' && (
              <>
                <header className="space-y-4">
                  <h2 className="text-4xl font-bold text-yellow-400">
                    {t('library.title')}
                  </h2>
                  <p className="text-lg text-yellow-400/70">
                    {t('library.subtitle')}
                  </p>
                </header>

                {selectedAudioId ? <AudioDetailView /> : <AudioLibraryList />}
                <SettingsPanel />
              </>
            )}

            {activeTab === 'summary' && (
              <>
                <header className="space-y-4">
                  <h2 className="text-4xl font-bold text-yellow-400">
                    {t('summary.title')}
                  </h2>
                  <p className="text-lg text-yellow-400/70">
                    {t('summary.subtitle')}
                  </p>
                </header>

                <SummaryView />
                <SettingsPanel />
              </>
            )}

            {activeTab === 'editor' && (
              <>
                <div className="flex items-center justify-between border-b-2 border-yellow-400 pb-4 mb-6">
                  <h2 className="text-4xl font-bold text-yellow-400">
                    {t('editor.title')}
                  </h2>
                  
                  <div className="flex gap-3">
                    {hasSlides && (
                      <>
                        <Button onClick={handleResetPresentation} variant="ghost" className="text-red-400 hover:text-red-300">
                          🔄 Reset
                        </Button>
                        <TemplateSelector />
                      </>
                    )}
                  </div>
                </div>

                {!hasSlides && (
                  <div className="space-y-6 mb-6">
                    <div className="p-6 bg-gray-900 border-2 border-yellow-400 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-yellow-400">Generate Presentation</h3>
                        <TemplateSelector />
                      </div>
                      <p className="text-yellow-400/70 mb-4">Select a transcription from your library to generate slides</p>
                      
                      <div className="space-y-4">
                        <select
                          value={selectedLibraryId || ''}
                          onChange={(e) => setSelectedLibraryId(e.target.value || null)}
                          className="w-full p-3 rounded-xl bg-black border-2 border-yellow-400/30 text-white focus:border-yellow-400 focus:outline-none"
                        >
                          <option value="">-- Select a recording --</option>
                          {audioRecordings.map((recording) => (
                            <option key={recording.id} value={recording.id}>
                              {recording.name} {recording.transcript ? '(Has transcript)' : '(No transcript)'}
                            </option>
                          ))}
                        </select>

                        {selectedLibraryId && !audioRecordings.find(r => r.id === selectedLibraryId)?.transcript && (
                          <div className="p-4 rounded-xl bg-red-500/10 border-2 border-red-500">
                            <p className="text-sm text-red-400">
                              This recording does not have a transcript. Please transcribe it first in the Library tab.
                            </p>
                          </div>
                        )}

                        {editorError && (
                          <div className="p-4 rounded-xl bg-red-500/10 border-2 border-red-500">
                            <p className="text-sm font-medium text-red-500 mb-1">Error</p>
                            <p className="text-xs text-red-400">{editorError}</p>
                          </div>
                        )}

                        <Button
                          onClick={handleGenerateSlidesFromLibrary}
                          disabled={!selectedLibraryId || !audioRecordings.find(r => r.id === selectedLibraryId)?.transcript || generatingSlides}
                          variant="primary"
                          className="w-full py-4 text-lg"
                        >
                          {generatingSlides ? '⏳ Generating Slides...' : 'Generate Presentation'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {hasSlides ? (
                  <>
                    <AIPipelineProgress />
                    <ExportControls />
                    <PresentationPreview />
                    <SettingsPanel />
                  </>
                ) : audioRecordings.length === 0 ? (
                  <div className="p-12 text-center bg-yellow-400/5 border-2 border-yellow-400 rounded-xl">
                    <div className="space-y-4">
                      <p className="text-2xl text-yellow-400 font-bold">
                        {t('editor.noSlides')}
                      </p>
                      <p className="text-yellow-400/70 text-lg">
                        Go to the Record tab, transcribe an audio file, and save it to the library first
                      </p>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
