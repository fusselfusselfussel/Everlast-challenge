'use client';

import { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { t } from '@/lib/i18n';

interface SaveToLibraryModalProps {
  isOpen: boolean;
  audioFilePath: string | null;
  transcript: string | null;
  slides: any[] | null;
  onSave: (name: string) => void;
  onCancel: () => void;
}

export function SaveToLibraryModal({
  isOpen,
  audioFilePath,
  transcript,
  slides,
  onSave,
  onCancel,
}: SaveToLibraryModalProps) {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      setName('');
    }
  };

  const handleCancel = () => {
    setName('');
    onCancel();
  };

  const getFileName = () => {
    if (!audioFilePath) return 'N/A';
    const parts = audioFilePath.split('/');
    return parts[parts.length - 1] || audioFilePath;
  };

  const transcriptLength = transcript?.length || 0;
  const slideCount = slides?.length || 0;
  const wordCount = transcript ? transcript.split(/\s+/).length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <Card className="w-full max-w-2xl bg-gray-900 border-yellow-400">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-yellow-400">
              {t('transcript.saveToLibrary')}
            </h2>
            <Button onClick={handleCancel} variant="ghost" className="text-yellow-400">
              ✕
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-yellow-400/80">
                Recording Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && name.trim()) {
                    handleSave();
                  }
                }}
                className="w-full p-3 rounded-xl bg-black border-2 border-yellow-400/30 text-white focus:border-yellow-400 focus:outline-none"
                placeholder="Enter a name for this recording..."
                autoFocus
              />
            </div>

            <div className="p-4 rounded-xl bg-black border-2 border-yellow-400/30 space-y-3">
              <h3 className="text-sm font-semibold text-yellow-400">Recording Details</h3>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-yellow-400/60">Audio File</p>
                  <p className="text-yellow-400 font-mono text-xs truncate" title={getFileName()}>
                    {getFileName()}
                  </p>
                </div>
                
                <div>
                  <p className="text-yellow-400/60">Transcript Length</p>
                  <p className="text-yellow-400">
                    {transcriptLength.toLocaleString()} characters
                  </p>
                </div>

                <div>
                  <p className="text-yellow-400/60">Word Count</p>
                  <p className="text-yellow-400">
                    {wordCount.toLocaleString()} words
                  </p>
                </div>

                <div>
                  <p className="text-yellow-400/60">Slides Generated</p>
                  <p className="text-yellow-400">
                    {slideCount > 0 ? `${slideCount} slides` : 'None'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t-2 border-yellow-400/20">
            <Button
              onClick={handleSave}
              disabled={!name.trim()}
              variant="primary"
              className="flex-1"
            >
              {t('common.save')}
            </Button>
            <Button onClick={handleCancel} variant="secondary">
              {t('settings.cancel')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
