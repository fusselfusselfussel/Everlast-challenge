'use client';

import { useEffect, useState } from 'react';
import { useRecordingStore } from '@/store/recording-store';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface ProgressData {
  stage: string;
  current: number;
  total: number;
}

export function AIPipelineProgress() {
  const { transcript, slides, status, runAIPipeline, setError } = useRecordingStore();
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [recursion, setRecursion] = useState(false);

  useEffect(() => {
    const cleanup = window.electron.onAIProgress((data) => {
      setProgress(data);
    });

    return () => {
      cleanup();
    };
  }, []);

  const handleRunPipeline = async () => {
    if (!transcript) {
      setError('No transcript available');
      return;
    }

    setProgress(null);
    await runAIPipeline(transcript, recursion);
  };

  const isGenerating = status === 'generating';
  const hasTranscript = !!transcript;
  const hasSlides = !!slides && slides.length > 0;

  const progressPercent = progress ? (progress.current / progress.total) * 100 : 0;

  return (
    <Card className="p-6 space-y-6 bg-gray-900 border-yellow-400">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-yellow-400">AI Pipeline</h2>
        {hasSlides && (
          <span className="text-sm text-yellow-400/70">{slides.length} slides generated</span>
        )}
      </div>

      {!hasTranscript && (
        <div className="p-8 text-center text-yellow-400/50">
          <p>Transcribe audio first to generate slides</p>
        </div>
      )}

      {hasTranscript && !hasSlides && !isGenerating && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-black border-2 border-yellow-400/30">
            <input
              type="checkbox"
              id="recursion"
              checked={recursion}
              onChange={(e) => setRecursion(e.target.checked)}
              className="w-4 h-4 accent-yellow-400"
            />
            <label htmlFor="recursion" className="text-sm text-yellow-400/80 cursor-pointer">
              Enable recursion layer (slower, more accurate)
            </label>
          </div>

          <Button onClick={handleRunPipeline} variant="primary" className="w-full">
            Generate Presentation
          </Button>

          <div className="text-xs text-yellow-400/50 space-y-1">
            <p>• Stage 1: Paraphrase transcript for understanding</p>
            <p>• Stage 2: Segment into logical slide topics</p>
            <p>• Stage 3: Select optimal template for each slide</p>
            <p>• Stage 4: Extract structured content</p>
            {recursion && <p className="text-yellow-400">• Verification enabled (2x-3x slower)</p>}
          </div>
        </div>
      )}

      {isGenerating && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-yellow-400/70">
                {progress?.stage || 'Initializing...'}
              </span>
              <span className="text-yellow-400 font-medium">
                {progress ? `${progress.current} / ${progress.total}` : '0 / 0'}
              </span>
            </div>
            <div className="h-2 bg-black rounded-full overflow-hidden border-2 border-yellow-400/30">
              <div
                className="h-full bg-yellow-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-yellow-400/10 border-2 border-yellow-400/30">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-yellow-400/80">
                Processing with AI... This may take {recursion ? '15-30' : '5-10'} seconds
              </span>
            </div>
          </div>
        </div>
      )}

      {hasSlides && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-yellow-400/10 border-2 border-yellow-400">
            <p className="text-sm font-medium text-yellow-400 mb-2">
              ✓ Pipeline Complete
            </p>
            <p className="text-xs text-yellow-400/70">
              Generated {slides.length} slides ready for export
            </p>
          </div>

          <div className="space-y-2">
            {slides.map((slide: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-black border-2 border-yellow-400/20 hover:border-yellow-400/40 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs text-yellow-400/50">Slide {idx + 1}</span>
                    <p className="text-sm font-medium text-white/90">
                      {slide.content?.title || 'Untitled'}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-yellow-400/20 text-yellow-400 uppercase">
                    {slide.type}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleRunPipeline} variant="secondary" className="text-xs">
              Regenerate
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
