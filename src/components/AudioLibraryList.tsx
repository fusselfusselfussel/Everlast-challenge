'use client';

import { useState } from 'react';
import { useRecordingStore } from '@/store/recording-store';
import { Card } from './ui/Card';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

export function AudioLibraryList() {
  const { audioRecordings, deleteRecording, selectAudio, selectedAudioId } = useRecordingStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteRecording(deleteId);
      setDeleteId(null);
    }
  };

  const handleCardClick = (id: string) => {
    selectAudio(id === selectedAudioId ? null : id);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (audioRecordings.length === 0) {
    return (
      <Card className="p-12 text-center bg-yellow-400/5 border-yellow-400">
        <div className="space-y-4">
          <p className="text-2xl text-yellow-400 font-bold">
            No recordings yet
          </p>
          <p className="text-yellow-400/70 text-lg">
            Go to the Record tab to create your first recording
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {audioRecordings.map((recording) => (
          <div
            key={recording.id}
            onClick={() => handleCardClick(recording.id)}
            className="cursor-pointer"
          >
            <Card
              className={`p-6 transition-all hover:border-yellow-400 ${
                selectedAudioId === recording.id
                  ? 'bg-yellow-400/10 border-yellow-400'
                  : 'bg-gray-900 border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-bold text-yellow-400">
                    {recording.name}
                  </h3>
                  <div className="flex gap-4 text-sm text-yellow-400/70">
                    <span>📅 {formatDate(recording.createdAt)}</span>
                    <span>⏱️ {formatDuration(recording.duration)}</span>
                    {recording.slides && (
                      <span>📊 {recording.slides.length} slides</span>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={(e) => handleDeleteClick(recording.id, e)}
                  className="text-red-500 hover:text-red-400 text-2xl font-bold p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                  aria-label="Delete recording"
                >
                  ×
                </button>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <DeleteConfirmationModal
        isOpen={deleteId !== null}
        title="Delete Recording"
        message="Are you sure you want to delete this recording? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
