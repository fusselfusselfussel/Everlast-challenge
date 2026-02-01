'use client';

import { useState } from 'react';
import { Button } from './ui/Button';

interface MarkdownViewModalProps {
  isOpen: boolean;
  markdown: string;
  onClose: () => void;
}

export function MarkdownViewModal({ isOpen, markdown, onClose }: MarkdownViewModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="bg-gray-900 border-2 border-yellow-400 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b-2 border-yellow-400">
          <h2 className="text-2xl font-bold text-yellow-400">Markdown Summary</h2>
          <div className="flex gap-2">
            <Button onClick={handleCopy} variant="secondary" className="text-sm">
              {copied ? '✓ Copied!' : '📋 Copy'}
            </Button>
            <Button onClick={onClose} variant="ghost" className="text-yellow-400">
              ✕ Close
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <pre className="text-white/90 whitespace-pre-wrap font-mono text-sm bg-black p-4 rounded-lg border border-yellow-400/30">
            {markdown || 'No markdown content available'}
          </pre>
        </div>
      </div>
    </div>
  );
}
