'use client';

import { useState, useEffect } from 'react';
import { useRecordingStore } from '@/store/recording-store';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export function AudioDetailView() {
  const {
    selectedAudioId,
    audioRecordings,
    updateRecording,
    transcribe,
    selectAudio,
  } = useRecordingStore();

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState('');
  const [editedName, setEditedName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  const selectedRecording = audioRecordings.find((r) => r.id === selectedAudioId);

  useEffect(() => {
    if (selectedRecording) {
      setEditedTranscript(selectedRecording.transcript || '');
      setEditedName(selectedRecording.name);
    }
  }, [selectedRecording]);

  if (!selectedRecording) {
    return (
      <Card className="p-12 text-center bg-yellow-400/5 border-yellow-400">
        <p className="text-xl text-yellow-400/70">
          Select a recording from the list to view details
        </p>
      </Card>
    );
  }

  const handleRetranscribe = async () => {
    setIsTranscribing(true);
    try {
      const newTranscript = await transcribe(selectedRecording.filePath);
      if (newTranscript) {
        updateRecording(selectedRecording.id, { transcript: newTranscript });
        setEditedTranscript(newTranscript);
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSaveTranscript = () => {
    updateRecording(selectedRecording.id, { transcript: editedTranscript });
  };

  const handleSaveName = () => {
    if (editedName.trim()) {
      updateRecording(selectedRecording.id, { name: editedName.trim() });
      setIsEditingName(false);
    }
  };

  const handleUseForPresentation = async () => {
    try {
      await window.electron.navigate('editor', { slides: selectedRecording.slides });
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gray-900 border-yellow-400">
        <div className="flex items-center justify-between mb-6">
          {isEditingName ? (
            <div className="flex gap-2 flex-1">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="flex-1 px-4 py-2 bg-black border-2 border-yellow-400 rounded-lg text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                autoFocus
              />
              <Button onClick={handleSaveName} variant="primary" className="px-4">
                Save
              </Button>
              <Button
                onClick={() => {
                  setEditedName(selectedRecording.name);
                  setIsEditingName(false);
                }}
                variant="secondary"
                className="px-4"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-yellow-400">
                {selectedRecording.name}
              </h2>
              <button
                onClick={() => setIsEditingName(true)}
                className="text-yellow-400/70 hover:text-yellow-400 text-sm"
              >
                ✏️ Edit
              </button>
            </div>
          )}
          
          <Button
            onClick={() => selectAudio(null)}
            variant="ghost"
            className="text-yellow-400"
          >
            ← Back to List
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-6 text-sm text-yellow-400/70">
            <span>
              📅{' '}
              {new Date(selectedRecording.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <span>
              ⏱️{' '}
              {Math.floor(selectedRecording.duration / 60)}:
              {(selectedRecording.duration % 60).toString().padStart(2, '0')}
            </span>
            {selectedRecording.slides && (
              <span>📊 {selectedRecording.slides.length} slides generated</span>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gray-900 border-yellow-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-yellow-400">Transcript</h3>
          <Button
            onClick={handleRetranscribe}
            disabled={isTranscribing}
            variant="secondary"
            className="text-sm"
          >
            {isTranscribing ? 'Re-transcribing...' : '🔄 Re-transcribe'}
          </Button>
        </div>

        {selectedRecording.transcript ? (
          <div className="space-y-4">
            <textarea
              value={editedTranscript}
              onChange={(e) => setEditedTranscript(e.target.value)}
              className="w-full h-64 px-4 py-3 bg-black border-2 border-yellow-400/30 rounded-lg text-white/90 focus:outline-none focus:border-yellow-400 resize-none"
              placeholder="Transcript will appear here..."
            />
            {editedTranscript !== selectedRecording.transcript && (
              <Button onClick={handleSaveTranscript} variant="primary">
                Save Changes
              </Button>
            )}
          </div>
        ) : (
          <div className="p-8 text-center border-2 border-dashed border-yellow-400/30 rounded-lg">
            <p className="text-yellow-400/70 mb-4">No transcript available</p>
            <Button onClick={handleRetranscribe} variant="primary">
              Transcribe Audio
            </Button>
          </div>
        )}
      </Card>

      {selectedRecording.slides && selectedRecording.slides.length > 0 && (
        <Card className="p-6 bg-yellow-400/10 border-yellow-400">
          <div className="text-center space-y-4">
            <p className="text-lg text-yellow-400">
              ✅ This recording has {selectedRecording.slides.length} slides ready
            </p>
            <Button
              onClick={handleUseForPresentation}
              variant="primary"
              className="text-lg px-8 py-4"
            >
              🎨 Use for Presentation
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
