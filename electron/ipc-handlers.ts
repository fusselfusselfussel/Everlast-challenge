import { ipcMain, dialog, shell, BrowserWindow } from 'electron';
import * as path from 'path';
import * as audioRecorder from './services/audio-recorder';
import { transcribeAudio, checkWhisperHealth } from './services/whisper-process';

export function registerIpcHandlers() {
  ipcMain.handle('ping', async () => {
    console.log('Received ping from renderer');
    return 'pong';
  });

  let sharedState: any = {};

  ipcMain.handle('navigate', async (event, page: string, data?: any) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (!window) {
        return { success: false, error: 'Window not found' };
      }

      // Store data for the next page
      if (data) {
        sharedState = data;
        console.log('[IPC] Storing shared state:', Object.keys(data));
      }

      const htmlPath = path.join(__dirname, `../../out/${page}.html`);
      console.log(`[IPC] Navigating to: ${htmlPath}`);
      await window.loadFile(htmlPath);
      return { success: true };
    } catch (error) {
      console.error('[IPC] Navigation error:', error);
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('get-shared-state', async () => {
    console.log('[IPC] Getting shared state:', Object.keys(sharedState));
    return sharedState;
  });

  ipcMain.handle('set-shared-state', async (event, data: any) => {
    sharedState = data;
    console.log('[IPC] Setting shared state:', Object.keys(data));
    return { success: true };
  });

  ipcMain.handle('audio:start-recording', async () => {
    try {
      const recordingId = audioRecorder.startRecording();
      return { success: true, recordingId };
    } catch (error) {
      console.error('[IPC] Error starting recording:', error);
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('audio:stop-recording', async () => {
    try {
      const result = audioRecorder.stopRecording();
      if (!result) {
        return { success: false, error: 'No active recording' };
      }
      return { success: true, filePath: result.filePath, duration: result.duration };
    } catch (error) {
      console.error('[IPC] Error stopping recording:', error);
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('audio:upload-file', async () => {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Select Audio File',
        filters: [
          { name: 'Audio Files', extensions: ['wav', 'mp3', 'm4a', 'ogg'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, error: 'No file selected' };
      }

      const filePath = result.filePaths[0];
      const isValid = audioRecorder.validateAudioFile(filePath);

      if (!isValid) {
        return { success: false, error: 'Invalid audio file' };
      }

      return { success: true, filePath, duration: 0 };
    } catch (error) {
      console.error('[IPC] Error uploading file:', error);
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('whisper:transcribe', async (_event, audioPath: string) => {
    try {
      console.log(`[IPC] Transcribing audio: ${audioPath}`);
      const { getSettings } = require('./services/settings-storage');
      const settings = getSettings();
      
      const transcript = await transcribeAudio(
        audioPath,
        settings.useExternalWhisper || false,
        settings.externalWhisperUrl || '',
        settings.externalWhisperKey || ''
      );
      return { success: true, transcript };
    } catch (error) {
      console.error('[IPC] Transcription error:', error);
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('whisper:health', async () => {
    try {
      const isHealthy = await checkWhisperHealth();
      return { success: true, healthy: isHealthy };
    } catch (error) {
      return { success: false, healthy: false, error: String(error) };
    }
  });

  ipcMain.handle('ai:run-pipeline', async (event, transcript: string, options: any) => {
    try {
      console.log(`[IPC] Running AI pipeline (recursion: ${options.recursion})`);
      
      const { getSettings } = require('./services/settings-storage');
      const settings = getSettings();
      
      const { ollamaClient } = require('../src/lib/ollama-client');
      ollamaClient.updateSettings(
        settings.useExternalAPI || false,
        settings.externalAPIUrl || '',
        settings.externalAPIKey || ''
      );
      
      const { runAIPipeline } = require('../src/lib/ai-pipeline');
      
      const result = await runAIPipeline(transcript, {
        recursion: options.recursion || false,
        onProgress: (stage: string, current: number, total: number) => {
          event.sender.send('ai:progress', { stage, current, total });
        },
      });
      
      return { success: true, slides: result.slides, metadata: result.metadata };
    } catch (error) {
      console.error('[IPC] AI pipeline error:', error);
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('ai:paraphrase', async (_event, transcript: string) => {
    try {
      const { paraphraseTranscript } = require('../src/lib/ai-pipeline');
      const result = await paraphraseTranscript(transcript);
      return { success: true, result };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('ai:segment', async (_event, transcript: string) => {
    try {
      const { segmentTranscript } = require('../src/lib/ai-pipeline');
      const result = await segmentTranscript(transcript);
      return { success: true, result };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('ai:check-ollama', async () => {
    try {
      const { ollamaClient } = require('../src/lib/ollama-client');
      const isHealthy = await ollamaClient.checkHealth();
      const models = isHealthy ? await ollamaClient.listModels() : [];
      return { success: true, healthy: isHealthy, models };
    } catch (error) {
      return { success: false, healthy: false, error: String(error) };
    }
  });

  ipcMain.handle('export:pptx', async (_event, slides: any[], style: string) => {
    try {
      console.log(`[IPC] Exporting PPTX (${slides.length} slides, style: ${style})`);
      
      const { generatePPTX, DARK_YELLOW_TEMPLATE, MODERN_BLUE_TEMPLATE, ORGANIC_WARM_TEMPLATE } = require('../src/lib/pptx-templates');
      const path = require('path');
      const os = require('os');
      
      let template = DARK_YELLOW_TEMPLATE;
      if (style === 'modern-blue') {
        template = MODERN_BLUE_TEMPLATE;
      } else if (style === 'organic-warm') {
        template = ORGANIC_WARM_TEMPLATE;
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const fileName = `presentation-${timestamp}.pptx`;
      const outputPath = path.join(os.tmpdir(), fileName);
      
      await generatePPTX(slides, outputPath, {
        template,
        title: 'AI Generated Presentation',
        author: 'Everlast Voice-to-PPTX',
      });
      
      return { success: true, filePath: outputPath };
    } catch (error) {
      console.error('[IPC] PPTX export error:', error);
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('export:markdown', async (_event, transcript: string, slides: any[]) => {
    try {
      console.log(`[IPC] Exporting Markdown`);
      
      const fs = require('fs');
      const path = require('path');
      const os = require('os');
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const fileName = `summary-${timestamp}.md`;
      const outputPath = path.join(os.tmpdir(), fileName);
      
      let markdown = `# Transcript Summary\n\n`;
      markdown += `**Generated**: ${new Date().toLocaleString()}\n\n`;
      markdown += `## Original Transcript\n\n${transcript}\n\n`;
      markdown += `## Slide Breakdown\n\n`;
      
      slides.forEach((slide: any, index: number) => {
        markdown += `### Slide ${index + 1}: ${slide.content.title || 'Untitled'}\n`;
        markdown += `**Type**: ${slide.type}\n\n`;
        
        if (slide.type === 'bullet' && slide.content.bullets) {
          slide.content.bullets.forEach((bullet: any) => {
            markdown += `- ${bullet.text}\n`;
            if (bullet.subPoints) {
              bullet.subPoints.forEach((sub: string) => {
                markdown += `  - ${sub}\n`;
              });
            }
          });
        } else if (slide.type === 'table' && slide.content.headers) {
          markdown += `| ${slide.content.headers.join(' | ')} |\n`;
          markdown += `| ${slide.content.headers.map(() => '---').join(' | ')} |\n`;
          slide.content.rows.forEach((row: string[]) => {
            markdown += `| ${row.join(' | ')} |\n`;
          });
        }
        
        markdown += `\n`;
      });
      
      fs.writeFileSync(outputPath, markdown, 'utf-8');
      
      return { success: true, filePath: outputPath };
    } catch (error) {
      console.error('[IPC] Markdown export error:', error);
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('export:csv', async (_event, slides: any[]) => {
    try {
      console.log(`[IPC] Exporting CSV`);
      
      const fs = require('fs');
      const path = require('path');
      const os = require('os');
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const fileName = `data-${timestamp}.csv`;
      const outputPath = path.join(os.tmpdir(), fileName);
      
      let csv = 'Slide Number,Type,Title,Content\n';
      
      slides.forEach((slide: any, index: number) => {
        const slideNum = index + 1;
        const type = slide.type;
        const title = (slide.content.title || '').replace(/"/g, '""');
        
        let content = '';
        if (slide.type === 'bullet' && slide.content.bullets) {
          content = slide.content.bullets.map((b: any) => b.text).join('; ');
        } else if (slide.type === 'table' && slide.content.rows) {
          content = `Headers: ${slide.content.headers.join(', ')}`;
        }
        content = content.replace(/"/g, '""');
        
        csv += `${slideNum},"${type}","${title}","${content}"\n`;
      });
      
      fs.writeFileSync(outputPath, csv, 'utf-8');
      
      return { success: true, filePath: outputPath };
    } catch (error) {
      console.error('[IPC] CSV export error:', error);
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('settings:get', async () => {
    try {
      const { getSettings } = require('./services/settings-storage');
      const settings = getSettings();
      console.log('[IPC] Get settings:', settings);
      return settings;
    } catch (error) {
      console.error('[IPC] Error getting settings:', error);
      return {
        hotkey: 'CommandOrControl+Shift+R',
        ollamaUrl: 'http://localhost:11434',
        whisperUrl: 'http://localhost:8001',
        whisperModel: 'medium',
        llmQuantization: true,
        recursionLayer: false,
        defaultStyle: 'dark-yellow',
        autoExportPptx: false,
        language: 'en',
      };
    }
  });

  ipcMain.handle('settings:set', async (_event, settings: any) => {
    try {
      const { saveSettings, getSettings } = require('./services/settings-storage');
      const { updateGlobalHotkey } = require('./services/hotkey-manager');
      
      const oldSettings = getSettings();
      saveSettings(settings);
      
      if (settings.hotkey && settings.hotkey !== oldSettings.hotkey) {
        console.log(`[IPC] Updating hotkey from ${oldSettings.hotkey} to ${settings.hotkey}`);
        updateGlobalHotkey(settings.hotkey);
      }
      
      console.log('[IPC] Settings saved successfully');
      return { success: true };
    } catch (error) {
      console.error('[IPC] Error saving settings:', error);
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('ai:summarize-transcription', async (event, transcript: string, ollamaUrl: string) => {
    try {
      const { getSettings } = require('./services/settings-storage');
      const settings = getSettings();
      
      const { summarizeTranscription } = await import('../src/lib/summarization');
      
      const summaries = await summarizeTranscription(
        transcript,
        ollamaUrl,
        settings.useExternalAPI || false,
        settings.externalAPIUrl || '',
        settings.externalAPIKey || '',
        (stage: string) => {
          event.sender.send('ai:summarization-progress', { stage });
        }
      );
      
      return { success: true, summaries };
    } catch (error) {
      console.error('[IPC] Summarization error:', error);
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('file:open', async (_event, filePath: string) => {
    try {
      await shell.openPath(filePath);
      return { success: true };
    } catch (error) {
      console.error('[IPC] Error opening file:', error);
      return { success: false, error: String(error) };
    }
  });

  console.log('✅ IPC handlers registered');
}
