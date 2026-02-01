'use client';

import { useRecordingStore } from '@/store/recording-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PresentationPreview } from '@/components/PresentationPreview';
import { TemplateSelector } from '@/components/TemplateSelector';
import { EditorToolbar } from '@/components/EditorToolbar';
import { useEffect } from 'react';

export default function EditorPage() {
  const { slides, setSlides } = useRecordingStore();
  
  const hasSlides = !!slides && slides.length > 0;

  useEffect(() => {
    console.log('[Editor] Mounted');
    
    // Load slides from shared state
    const loadSharedState = async () => {
      try {
        const sharedState = await window.electron.getSharedState();
        console.log('[Editor] Shared state received:', sharedState);
        
        if (sharedState?.slides) {
          console.log('[Editor] Loading slides from shared state:', sharedState.slides.length);
          setSlides(sharedState.slides);
        } else {
          console.log('[Editor] No slides in shared state');
        }
      } catch (error) {
        console.error('[Editor] Error loading shared state:', error);
      }
    };
    
    loadSharedState();
  }, [setSlides]);

  const handleBackToHome = async () => {
    console.log('[Editor] Going back to home...');
    try {
      const result = await window.electron.navigate('index');
      console.log('[Editor] Navigation result:', result);
    } catch (error) {
      console.error('[Editor] Navigation error:', error);
    }
  };

  return (
    <main className="min-h-screen bg-black pb-24">
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        <div className="flex items-center justify-between border-b-2 border-yellow-400 pb-4">
          <div>
            <Button 
              onClick={handleBackToHome}
              variant="ghost"
              className="mb-4 text-yellow-400 hover:bg-yellow-400/10"
            >
              ← Back to Home
            </Button>
            <h1 className="text-4xl font-bold text-yellow-400">
              Presentation Editor
            </h1>
            {hasSlides && (
              <p className="text-sm text-yellow-400/70 mt-2">
                {slides.length} slide{slides.length !== 1 ? 's' : ''} in your presentation
              </p>
            )}
          </div>
          
          {hasSlides && <TemplateSelector />}
        </div>

        {!hasSlides && (
          <Card className="p-12 text-center bg-yellow-400/5 border-yellow-400">
            <div className="space-y-4">
              <p className="text-2xl text-yellow-400 font-bold">
                No slides generated yet
              </p>
              <p className="text-yellow-400/70 text-lg">
                Go back to the home page and generate slides first
              </p>
              <Button 
                onClick={handleBackToHome}
                variant="primary"
                className="mt-4 text-lg px-8 py-4"
              >
                Go to Home
              </Button>
            </div>
          </Card>
        )}

        {hasSlides && (
          <div className="space-y-6">
            <PresentationPreview />
          </div>
        )}
      </div>

      <EditorToolbar />
    </main>
  );
}
