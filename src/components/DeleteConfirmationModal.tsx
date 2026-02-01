'use client';

import { Button } from './ui/Button';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmationModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-gray-900 border-2 border-yellow-400 rounded-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">{title}</h2>
        <p className="text-white/80 mb-8">{message}</p>
        
        <div className="flex gap-4">
          <Button
            onClick={onCancel}
            variant="secondary"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white border-red-500"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
