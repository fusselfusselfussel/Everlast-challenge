'use client';

import { useRecordingStore } from '@/store/recording-store';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useState } from 'react';
import { t } from '@/lib/i18n';
import { SaveToLibraryModal } from './SaveToLibraryModal';

export function TranscriptView() {
  const { audioFilePath, audioDuration, transcript, status, slides, transcribe, setError, saveRecording } = useRecordingStore();
  const [copied, setCopied] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleTranscribe = async () => {
    if (!audioFilePath) {
      setError('No audio file available');
      return;
    }

    await transcribe(audioFilePath);
  };

  const handleCopy = async () => {
    if (transcript) {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveToLibrary = (name: string) => {
    if (audioFilePath && transcript) {
      saveRecording({
        name,
        filePath: audioFilePath,
        transcript,
        slides: slides || [],
        duration: audioDuration,
      });
      setShowSaveModal(false);
    }
  };

  const isTranscribing = status === 'transcribing';
  const hasAudio = !!audioFilePath;
  const hasTranscript = !!transcript;

  return (
    <Card className="p-6 space-y-4 bg-gray-900 border-yellow-400">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-yellow-400">{t('transcript.title')}</h2>
        {hasTranscript && (
          <Button onClick={handleCopy} variant="ghost" className="text-xs text-yellow-400">
            {copied ? `✓ ${t('transcript.copied')}` : t('transcript.copyToClipboard')}
          </Button>
        )}
      </div>

      {!hasAudio && (
        <div className="p-8 text-center text-yellow-400/50">
          <p>{t('transcript.placeholder')}</p>
        </div>
      )}

      {hasAudio && !hasTranscript && (
        <div className="space-y-4">
          <Button
            onClick={handleTranscribe}
            disabled={isTranscribing}
            variant="primary"
            className="w-full"
          >
            {isTranscribing ? t('transcript.transcribing') : t('transcript.startTranscription')}
          </Button>
        </div>
      )}

      {isTranscribing && (
        <div className="p-8 space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-center text-yellow-400/70">
            {t('transcript.transcribingWithWhisper')}
          </p>
        </div>
      )}

      {hasTranscript && (
        <div className="space-y-4">
          <div className="relative">
            <div className="p-4 rounded-xl bg-black border-2 border-yellow-400/30 max-h-96 overflow-y-auto">
              <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                {transcript}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleTranscribe}
              variant="secondary"
              className="text-xs"
            >
              {t('transcript.retranscribe')}
            </Button>
            <Button
              onClick={() => setShowSaveModal(true)}
              variant="primary"
              className="text-xs"
            >
              {t('transcript.saveToLibrary')}
            </Button>
          </div>
        </div>
      )}

      <SaveToLibraryModal
        isOpen={showSaveModal}
        audioFilePath={audioFilePath}
        transcript={transcript}
        slides={slides}
        onSave={handleSaveToLibrary}
        onCancel={() => setShowSaveModal(false)}
      />
    </Card>
  );
}
