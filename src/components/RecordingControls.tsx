'use client';

import { useEffect } from 'react';
import { useRecordingStore } from '@/store/recording-store';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { t } from '@/lib/i18n';

export function RecordingControls() {
  const {
    status,
    audioFilePath,
    error,
    startRecording,
    stopRecording,
    uploadFile,
    reset,
    clearAudioFile,
  } = useRecordingStore();

  const isRecording = status === 'recording';
  const isProcessing = status === 'processing';

  useEffect(() => {
    const handleRecordingStart = () => {
      startRecording();
    };

    const handleRecordingStop = () => {
      stopRecording();
    };

    window.addEventListener('hotkey:recording-start', handleRecordingStart);
    window.addEventListener('hotkey:recording-stop', handleRecordingStop);

    return () => {
      window.removeEventListener('hotkey:recording-start', handleRecordingStart);
      window.removeEventListener('hotkey:recording-stop', handleRecordingStop);
    };
  }, [startRecording, stopRecording]);

  return (
    <Card className="p-6 space-y-6 bg-gray-900 border-yellow-400">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-yellow-400">{t('record.audioInput')}</h2>
        <StatusBadge status={status} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-yellow-400/70">{t('record.recordAudio')}</h3>
          <div className="flex gap-2">
            <Button
              onClick={startRecording}
              disabled={isRecording || isProcessing}
              variant="primary"
              className="flex-1"
            >
              {isRecording ? t('record.recording') : t('record.startRecording')}
            </Button>
            <Button
              onClick={stopRecording}
              disabled={!isRecording}
              variant="secondary"
            >
              {t('record.stopRecording')}
            </Button>
          </div>
          <p className="text-xs text-yellow-400/50">{t('record.hotkey')}: Ctrl+Shift+R</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-yellow-400/70">{t('record.uploadFile')}</h3>
          <Button
            onClick={uploadFile}
            disabled={isRecording || isProcessing}
            variant="secondary"
            className="w-full"
          >
            {t('record.selectAudioFile')}
          </Button>
          <p className="text-xs text-yellow-400/50">{t('record.supportedFormats')}</p>
        </div>
      </div>

      {audioFilePath && (
        <div className="p-4 rounded-xl bg-yellow-400/10 border-2 border-yellow-400 relative">
          <button
            onClick={clearAudioFile}
            className="absolute top-2 right-2 text-yellow-400 hover:text-red-400 hover:bg-red-400/10 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
            aria-label="Clear audio file"
            title="Clear audio file"
          >
            ✕
          </button>
          <p className="text-sm font-medium text-yellow-400 mb-1 pr-8">✓ {t('record.audioFileReady')}</p>
          <p className="text-xs font-mono text-yellow-400/70 break-all pr-8">{audioFilePath}</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border-2 border-red-500">
          <p className="text-sm font-medium text-red-500 mb-1">{t('common.error')}</p>
          <p className="text-xs text-red-400">{error}</p>
          <Button onClick={reset} variant="ghost" className="mt-2 text-xs text-yellow-400">
            {t('common.clearError')}
          </Button>
        </div>
      )}
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    idle: { label: t('status.ready'), color: 'text-yellow-400/50' },
    recording: { label: t('status.recording'), color: 'text-red-500 animate-pulse' },
    processing: { label: t('status.processing'), color: 'text-yellow-400 animate-pulse' },
    transcribing: { label: t('status.transcribing'), color: 'text-yellow-400 animate-pulse' },
    generating: { label: t('status.generating'), color: 'text-yellow-400 animate-pulse' },
    completed: { label: t('status.completed'), color: 'text-green-500' },
    error: { label: t('status.error'), color: 'text-red-500' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.idle;

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')}`} />
      <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
    </div>
  );
}
