'use client';

import { useState } from 'react';
import { useRecordingStore } from '@/store/recording-store';
import { Button } from './ui/Button';
import { MarkdownViewModal } from './MarkdownViewModal';
import { CSVViewModal } from './CSVViewModal';

export function EditorToolbar() {
  const { slides, transcript, selectedTemplate } = useRecordingStore();
  const [exporting, setExporting] = useState(false);
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [showCSV, setShowCSV] = useState(false);

  const hasSlides = !!slides && slides.length > 0;

  const handleExportPPTX = async () => {
    if (!slides) return;
    
    setExporting(true);
    try {
      const result = await window.electron.exportPPTX(slides, selectedTemplate);
      if (result.success) {
        console.log('[EditorToolbar] PPTX saved:', result.filePath);
        if (result.filePath) {
          await window.electron.openFile(result.filePath);
        }
      } else {
        console.error('[EditorToolbar] PPTX failed:', result.error);
      }
    } catch (error) {
      console.error('[EditorToolbar] PPTX error:', error);
    } finally {
      setExporting(false);
    }
  };

  const generateMarkdown = () => {
    if (!slides && !transcript) return '';
    
    let md = '# Presentation Summary\n\n';
    
    if (transcript) {
      md += '## Transcript\n\n';
      md += transcript + '\n\n';
    }
    
    if (slides && slides.length > 0) {
      md += '## Slides\n\n';
      
      slides.forEach((slide: any, index: number) => {
        md += `### Slide ${index + 1}: ${slide.title || 'Untitled'}\n\n`;
        
        if (slide.subtitle) {
          md += `**Subtitle:** ${slide.subtitle}\n\n`;
        }
        
        if (slide.content) {
          md += slide.content + '\n\n';
        }
        
        if (slide.bulletPoints && slide.bulletPoints.length > 0) {
          slide.bulletPoints.forEach((point: string) => {
            md += `- ${point}\n`;
          });
          md += '\n';
        }
      });
    }
    
    return md;
  };

  const generateCSV = () => {
    if (!slides) return '';
    
    let csv = 'Slide Number,Title,Subtitle,Content Type,Content\n';
    
    slides.forEach((slide: any, index: number) => {
      const slideNum = index + 1;
      const title = String(slide.title || '').replace(/"/g, '""');
      const subtitle = String(slide.subtitle || '').replace(/"/g, '""');
      const type = slide.templateType || slide.type || 'unknown';
      
      let content = '';
      if (slide.bulletPoints && slide.bulletPoints.length > 0) {
        content = slide.bulletPoints.join('; ');
      } else if (slide.content) {
        content = String(slide.content || '');
      }
      content = String(content).replace(/"/g, '""');
      
      csv += `${slideNum},"${title}","${subtitle}","${type}","${content}"\n`;
    });
    
    return csv;
  };

  if (!hasSlides) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t-2 border-yellow-400 p-4 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="text-sm text-yellow-400/70">
            📊 {slides.length} slide{slides.length !== 1 ? 's' : ''} in presentation
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleExportPPTX}
              disabled={exporting}
              variant="primary"
              className="px-6 py-3 text-base"
            >
              {exporting ? '⏳ Exporting...' : '📥 Export PPTX'}
            </Button>
            
            <Button
              onClick={() => setShowMarkdown(true)}
              variant="secondary"
              className="px-6 py-3 text-base"
            >
              📝 View Markdown
            </Button>
            
            <Button
              onClick={() => setShowCSV(true)}
              variant="secondary"
              className="px-6 py-3 text-base"
            >
              📊 View CSV
            </Button>
          </div>
        </div>
      </div>

      <MarkdownViewModal
        isOpen={showMarkdown}
        markdown={generateMarkdown()}
        onClose={() => setShowMarkdown(false)}
      />

      <CSVViewModal
        isOpen={showCSV}
        csv={generateCSV()}
        onClose={() => setShowCSV(false)}
      />
    </>
  );
}
