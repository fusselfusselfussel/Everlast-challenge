'use client';

import { useState } from 'react';
import { useRecordingStore } from '@/store/recording-store';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export function ExportControls() {
  const { slides, transcript, selectedTemplate } = useRecordingStore();
  const [exporting, setExporting] = useState(false);
  const [exportedFiles, setExportedFiles] = useState<{
    pptx?: string;
    markdown?: string;
  }>({});

  const hasSlides = !!slides && slides.length > 0;

  const handleExportPPTX = async () => {
    if (!slides) return;
    
    setExporting(true);
    try {
      const result = await window.electron.exportPPTX(slides, selectedTemplate);
      if (result.success) {
        setExportedFiles(prev => ({ ...prev, pptx: result.filePath }));
        console.log('[Export] PPTX saved:', result.filePath);
      } else {
        console.error('[Export] PPTX failed:', result.error);
      }
    } catch (error) {
      console.error('[Export] PPTX error:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportMarkdown = async () => {
    if (!slides) return;
    
    setExporting(true);
    try {
      let markdown = '# Presentation Summary\n\n';
      markdown += `**Generated**: ${new Date().toLocaleString()}\n`;
      markdown += `**Template**: ${selectedTemplate}\n`;
      markdown += `**Total Slides**: ${slides.length}\n\n`;
      markdown += '---\n\n';
      
      slides.forEach((slide: any, index: number) => {
        markdown += `## Slide ${index + 1}: ${slide.content?.title || 'Untitled'}\n\n`;
        markdown += `**Type**: ${slide.type}\n\n`;
        
        if (slide.type === 'bullet' && slide.content?.bullets) {
          slide.content.bullets.forEach((bullet: any) => {
            markdown += `- ${bullet.text || bullet}\n`;
            if (bullet.subPoints && Array.isArray(bullet.subPoints)) {
              bullet.subPoints.forEach((sub: string) => {
                markdown += `  - ${sub}\n`;
              });
            }
          });
          markdown += '\n';
        } else if (slide.type === 'table' && slide.content?.headers) {
          markdown += `| ${slide.content.headers.join(' | ')} |\n`;
          markdown += `| ${slide.content.headers.map(() => '---').join(' | ')} |\n`;
          if (slide.content.rows) {
            slide.content.rows.forEach((row: string[]) => {
              markdown += `| ${row.join(' | ')} |\n`;
            });
          }
          markdown += '\n';
        } else if (slide.content?.subtitle) {
          markdown += `${slide.content.subtitle}\n\n`;
        }
      });
      
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `presentation-summary-${Date.now()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setExportedFiles(prev => ({ ...prev, markdown: `presentation-summary-${Date.now()}.md` }));
      console.log('[Export] Markdown downloaded');
    } catch (error) {
      console.error('[Export] Markdown error:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleOpenFile = async (filePath: string) => {
    try {
      await window.electron.openFile(filePath);
    } catch (error) {
      console.log('[Export] Opening file in system:', filePath);
    }
  };

  return (
    <Card className="p-6 space-y-6 bg-gray-900 border-yellow-400">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-yellow-400">Export</h2>
        {hasSlides && (
          <span className="text-sm text-yellow-400/70">
            {slides.length} slide{slides.length !== 1 ? 's' : ''} ready
          </span>
        )}
      </div>

      {!hasSlides && (
        <div className="p-8 text-center text-yellow-400/50">
          <p>Generate slides first to enable export</p>
        </div>
      )}

      {hasSlides && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Button
                onClick={handleExportPPTX}
                disabled={exporting}
                variant="primary"
                className="w-full"
              >
                {exporting ? 'Exporting...' : 'Export PPTX'}
              </Button>
              <p className="text-xs text-yellow-400/50 text-center">PowerPoint Presentation</p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleExportMarkdown}
                disabled={exporting}
                variant="secondary"
                className="w-full"
              >
                Export Markdown
              </Button>
              <p className="text-xs text-yellow-400/50 text-center">Presentation Summary</p>
            </div>
          </div>

          {(exportedFiles.pptx || exportedFiles.markdown) && (
            <div className="p-4 rounded-xl bg-yellow-400/10 border-2 border-yellow-400 space-y-2">
              <p className="text-sm font-medium text-yellow-400 mb-2">✓ Exported Files</p>
              
              {exportedFiles.pptx && (
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-yellow-400/70 truncate flex-1">
                    {exportedFiles.pptx.split('/').pop()}
                  </span>
                  <Button
                    onClick={() => handleOpenFile(exportedFiles.pptx!)}
                    variant="ghost"
                    className="text-xs ml-2 text-yellow-400"
                  >
                    Open
                  </Button>
                </div>
              )}
              
              {exportedFiles.markdown && (
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-yellow-400/70 truncate flex-1">
                    {exportedFiles.markdown}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="text-xs text-yellow-400/50 space-y-1">
            <p>• <strong className="text-yellow-400">PPTX</strong>: Fully formatted PowerPoint presentation</p>
            <p>• <strong className="text-yellow-400">Markdown</strong>: Presentation summary with all slides</p>
          </div>
        </div>
      )}
    </Card>
  );
}
