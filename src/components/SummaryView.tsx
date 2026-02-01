'use client';

import { useState, useEffect } from 'react';
import { useRecordingStore } from '@/store/recording-store';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import type { TopicSummary } from '@/lib/summarization';

export function SummaryView() {
  const { audioRecordings } = useRecordingStore();
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<TopicSummary[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await window.electron.getSettings();
        if (settings?.ollamaUrl) {
          setOllamaUrl(settings.ollamaUrl);
        }
      } catch (err) {
        console.error('[SummaryView] Failed to load settings:', err);
      }
    };
    loadSettings();
  }, []);

  const selectedRecording = audioRecordings.find((r) => r.id === selectedRecordingId);
  const hasTranscript = selectedRecording?.transcript && selectedRecording.transcript.trim().length > 0;

  const handleGenerateSummary = async () => {
    if (!selectedRecording || !selectedRecording.transcript) return;
    
    setGenerating(true);
    setError(null);
    setProgress('Starting summarization...');
    
    const unsubscribe = window.electron.onSummarizationProgress((data) => {
      setProgress(data.stage);
    });
    
    try {
      const result = await window.electron.summarizeTranscription(
        selectedRecording.transcript,
        ollamaUrl
      );
      
      if (result.success && result.summaries) {
        setSummaries(result.summaries);
        setProgress('');
      } else {
        setError(result.error || 'Failed to generate summary');
        setProgress('');
      }
    } catch (err) {
      setError(String(err));
      setProgress('');
    } finally {
      setGenerating(false);
      unsubscribe();
    }
  };

  const generateMarkdown = () => {
    if (!summaries || !selectedRecording) return '';
    
    let md = '# Transcription Summary\n\n';
    md += `**Recording**: ${selectedRecording.name}\n`;
    md += `**Date**: ${new Date().toLocaleDateString()}\n\n`;
    md += '---\n\n';
    
    summaries.forEach((summary, index) => {
      md += `## ${index + 1}. ${summary.topic}\n\n`;
      md += `${summary.summary}\n\n`;
      
      if (summary.keyPoints && summary.keyPoints.length > 0) {
        md += `**Key Points:**\n\n`;
        summary.keyPoints.forEach((point) => {
          md += `- ${point}\n`;
        });
        md += '\n';
      }
    });
    
    return md;
  };

  const handleExportMarkdown = async () => {
    try {
      const markdown = generateMarkdown();
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcription-summary-${Date.now()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[SummaryView] Markdown export error:', error);
    }
  };

  const handleExportPDF = async () => {
    try {
      const markdown = generateMarkdown();
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Transcription Summary</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                max-width: 800px;
                margin: 40px auto;
                padding: 20px;
                line-height: 1.6;
                color: #333;
              }
              h1 { color: #000; border-bottom: 3px solid #FFFF00; padding-bottom: 10px; }
              h2 { color: #000; margin-top: 30px; border-bottom: 2px solid #FFFF00; padding-bottom: 5px; }
              h3 { color: #333; margin-top: 20px; }
              ul { margin: 10px 0; padding-left: 20px; }
              li { margin: 5px 0; }
              hr { border: 1px solid #FFFF00; margin: 20px 0; }
            </style>
          </head>
          <body>
            ${markdown.split('\n').map(line => {
              if (line.startsWith('# ')) return `<h1>${line.substring(2)}</h1>`;
              if (line.startsWith('## ')) return `<h2>${line.substring(3)}</h2>`;
              if (line.startsWith('### ')) return `<h3>${line.substring(4)}</h3>`;
              if (line.startsWith('- ')) return `<li>${line.substring(2)}</li>`;
              if (line.startsWith('**') && line.endsWith('**')) {
                const content = line.substring(2, line.length - 2);
                return `<p><strong>${content}</strong></p>`;
              }
              if (line === '---') return '<hr>';
              if (line.trim() === '') return '<br>';
              return `<p>${line}</p>`;
            }).join('\n')}
          </body>
        </html>
      `;
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    } catch (error) {
      console.error('[SummaryView] PDF export error:', error);
    }
  };

  if (audioRecordings.length === 0) {
    return (
      <Card className="p-12 text-center bg-yellow-400/5 border-yellow-400">
        <div className="space-y-4">
          <p className="text-2xl text-yellow-400 font-bold">
            No Recordings in Library
          </p>
          <p className="text-yellow-400/70 text-lg">
            Go to the Record tab, transcribe an audio file, and save it to the library first
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gray-900 border-yellow-400">
        <h3 className="text-xl font-bold text-yellow-400 mb-4">Select Recording</h3>
        <select
          value={selectedRecordingId || ''}
          onChange={(e) => {
            setSelectedRecordingId(e.target.value || null);
            setSummaries(null);
            setError(null);
          }}
          className="w-full p-3 rounded-xl bg-black border-2 border-yellow-400/30 text-white focus:border-yellow-400 focus:outline-none"
        >
          <option value="">-- Select a recording from library --</option>
          {audioRecordings.map((recording) => (
            <option key={recording.id} value={recording.id}>
              {recording.name} ({recording.transcript ? 'Has transcript' : 'No transcript'})
            </option>
          ))}
        </select>

        {selectedRecording && !hasTranscript && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border-2 border-red-500">
            <p className="text-sm text-red-400">
              This recording does not have a transcript. Please transcribe it first.
            </p>
          </div>
        )}

        {selectedRecording && hasTranscript && !summaries && (
          <div className="mt-4">
            <Button
              onClick={handleGenerateSummary}
              disabled={generating}
              variant="primary"
              className="w-full py-4 text-lg"
            >
              {generating ? '⏳ Generating Summary...' : '🤖 Generate AI Summary'}
            </Button>
          </div>
        )}
      </Card>

      {generating && progress && (
        <Card className="p-6 bg-black border-yellow-400">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <div>
              <p className="text-yellow-400 font-semibold">Generating Summary...</p>
              <p className="text-yellow-400/70 text-sm">{progress}</p>
            </div>
          </div>
        </Card>
      )}

      {error && (
        <Card className="p-6 bg-red-500/10 border-red-500">
          <p className="text-red-400 font-semibold">Error</p>
          <p className="text-red-400/80 text-sm mt-2">{error}</p>
        </Card>
      )}

      {summaries && summaries.length > 0 && (
        <>
          <Card className="p-6 bg-black border-yellow-400">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-yellow-400">Summary Results</h3>
              <Button
                onClick={handleGenerateSummary}
                disabled={generating}
                variant="ghost"
                className="text-sm text-yellow-400"
              >
                🔄 Regenerate
              </Button>
            </div>

            <div className="space-y-6">
              {summaries.map((summary, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl bg-gray-900 border-2 border-yellow-400/30"
                >
                  <h4 className="text-xl font-bold text-yellow-400 mb-3">
                    {index + 1}. {summary.topic}
                  </h4>
                  <p className="text-white/90 leading-relaxed mb-4">
                    {summary.summary}
                  </p>
                  {summary.keyPoints && summary.keyPoints.length > 0 && (
                    <div className="mt-4 pt-4 border-t-2 border-yellow-400/20">
                      <p className="text-sm font-semibold text-yellow-400 mb-2">
                        Key Points:
                      </p>
                      <ul className="space-y-2">
                        {summary.keyPoints.map((point, i) => (
                          <li key={i} className="text-yellow-400/80 text-sm flex gap-2">
                            <span className="text-yellow-400 flex-shrink-0">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-black border-yellow-400">
            <h3 className="text-xl font-bold text-yellow-400 mb-4">Export Options</h3>
            <div className="flex gap-4">
              <Button
                onClick={handleExportMarkdown}
                variant="primary"
                className="flex-1 py-4 text-lg"
              >
                📝 Save as Markdown
              </Button>
              <Button
                onClick={handleExportPDF}
                variant="secondary"
                className="flex-1 py-4 text-lg"
              >
                📄 Save as PDF
              </Button>
            </div>
            <p className="text-sm text-yellow-400/70 text-center mt-4">
              Markdown files can be opened in any text editor. PDF uses your browser's print dialog.
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
