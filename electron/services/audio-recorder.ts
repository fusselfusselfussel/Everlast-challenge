import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface Recording {
  id: string;
  filePath: string;
  startTime: number;
}

let currentRecording: Recording | null = null;

export function startRecording(): string {
  const recordingId = Date.now().toString();
  const filePath = path.join(os.tmpdir(), `recording-${recordingId}.wav`);
  
  currentRecording = {
    id: recordingId,
    filePath,
    startTime: Date.now(),
  };

  console.log(`[Audio Recorder] Recording started: ${recordingId}`);
  console.log(`[Audio Recorder] File path: ${filePath}`);
  
  return recordingId;
}

export function stopRecording(): { filePath: string; duration: number } | null {
  if (!currentRecording) {
    console.warn('[Audio Recorder] No active recording to stop');
    return null;
  }

  const durationMs = Date.now() - currentRecording.startTime;
  const durationSec = Math.floor(durationMs / 1000);
  const filePath = currentRecording.filePath;
  
  try {
    fs.writeFileSync(filePath, Buffer.alloc(0));
    console.log(`[Audio Recorder] Recording stopped after ${durationMs}ms (${durationSec}s)`);
    console.log(`[Audio Recorder] Saved to: ${filePath}`);
  } catch (error) {
    console.error('[Audio Recorder] Error saving file:', error);
  }
  
  currentRecording = null;
  return { filePath, duration: durationSec };
}

export function isRecording(): boolean {
  return currentRecording !== null;
}

export function getCurrentRecording(): Recording | null {
  return currentRecording;
}

export function cleanupOldRecordings(maxAgeMs: number = 3600000): void {
  const tmpDir = os.tmpdir();
  const files = fs.readdirSync(tmpDir);
  const now = Date.now();
  
  let cleanedCount = 0;
  
  files.forEach((file) => {
    if (file.startsWith('recording-') && file.endsWith('.wav')) {
      const filePath = path.join(tmpDir, file);
      try {
        const stats = fs.statSync(filePath);
        const age = now - stats.mtimeMs;
        
        if (age > maxAgeMs) {
          fs.unlinkSync(filePath);
          cleanedCount++;
        }
      } catch (error) {
        console.error(`[Audio Recorder] Error cleaning up ${file}:`, error);
      }
    }
  });
  
  if (cleanedCount > 0) {
    console.log(`[Audio Recorder] Cleaned up ${cleanedCount} old recording(s)`);
  }
}

export function validateAudioFile(filePath: string): boolean {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`[Audio Recorder] File does not exist: ${filePath}`);
      return false;
    }
    
    const stats = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    if (!['.wav', '.mp3', '.m4a', '.ogg'].includes(ext)) {
      console.error(`[Audio Recorder] Invalid file format: ${ext}`);
      return false;
    }
    
    if (stats.size === 0) {
      console.error('[Audio Recorder] File is empty');
      return false;
    }
    
    const maxSize = 100 * 1024 * 1024;
    if (stats.size > maxSize) {
      console.error(`[Audio Recorder] File too large: ${stats.size} bytes (max: ${maxSize})`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[Audio Recorder] Error validating file:', error);
    return false;
  }
}
