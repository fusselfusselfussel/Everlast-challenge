import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';

const WHISPER_SERVICE_DIR = path.join(__dirname, '../../../services/whisper-service');
const WHISPER_PORT = process.env.WHISPER_PORT || '8001';
const WHISPER_HOST = process.env.WHISPER_HOST || '127.0.0.1';
const WHISPER_URL = `http://${WHISPER_HOST}:${WHISPER_PORT}`;

let whisperProcess: ChildProcess | null = null;
let restartAttempts = 0;
const MAX_RESTART_ATTEMPTS = 3;
const RESTART_DELAY = 5000;

export async function startWhisperService(): Promise<boolean> {
  const existingHealth = await checkWhisperHealth();
  if (existingHealth) {
    console.log('[Whisper] Service already running externally on port ' + WHISPER_PORT);
    return true;
  }

  if (whisperProcess) {
    console.log('[Whisper] Service already running');
    return true;
  }

  const startScript = path.join(WHISPER_SERVICE_DIR, 'start.py');

  if (!fs.existsSync(WHISPER_SERVICE_DIR)) {
    console.error('[Whisper] Service directory not found:', WHISPER_SERVICE_DIR);
    return false;
  }

  const venvPath = path.join(WHISPER_SERVICE_DIR, 'venv');
  if (!fs.existsSync(venvPath)) {
    console.log('[Whisper] Virtual environment not found. Run setup first.');
    console.log('[Whisper] Please run: python3 setup.py (or setup.sh on Linux)');
    return false;
  }

  if (!fs.existsSync(startScript)) {
    console.error('[Whisper] Start script not found:', startScript);
    return false;
  }

  try {
    console.log('[Whisper] Starting transcription service...');
    console.log(`[Whisper] Service URL: ${WHISPER_URL}`);

    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

    whisperProcess = spawn(pythonCmd, [startScript], {
      cwd: WHISPER_SERVICE_DIR,
      env: {
        ...process.env,
        WHISPER_MODEL: process.env.WHISPER_MODEL || 'medium',
        WHISPER_DEVICE: process.env.WHISPER_DEVICE || (process.platform === 'win32' ? 'cpu' : 'cuda'),
        WHISPER_COMPUTE_TYPE: process.env.WHISPER_COMPUTE_TYPE || 'float16',
        PORT: WHISPER_PORT,
        HOST: WHISPER_HOST,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
    });

    whisperProcess.stdout?.on('data', (data) => {
      console.log(`[Whisper] ${data.toString().trim()}`);
    });

    whisperProcess.stderr?.on('data', (data) => {
      console.error(`[Whisper Error] ${data.toString().trim()}`);
    });

    whisperProcess.on('exit', (code, signal) => {
      console.log(`[Whisper] Process exited with code ${code}, signal ${signal}`);
      whisperProcess = null;

      if (restartAttempts < MAX_RESTART_ATTEMPTS) {
        restartAttempts++;
        console.log(`[Whisper] Attempting restart (${restartAttempts}/${MAX_RESTART_ATTEMPTS})...`);
        setTimeout(() => {
          startWhisperService();
        }, RESTART_DELAY);
      } else {
        console.error('[Whisper] Max restart attempts reached. Service will not restart.');
      }
    });

    whisperProcess.on('error', (error) => {
      console.error('[Whisper] Failed to start process:', error);
      whisperProcess = null;
    });

    await waitForServiceReady();
    restartAttempts = 0;
    console.log('✅ Whisper service started successfully');
    return true;

  } catch (error) {
    console.error('[Whisper] Error starting service:', error);
    whisperProcess = null;
    return false;
  }
}

export function stopWhisperService(): void {
  if (whisperProcess) {
    console.log('[Whisper] Stopping service...');
    
    // Use cross-platform kill
    if (process.platform === 'win32') {
      whisperProcess.kill('SIGINT');
    } else {
      whisperProcess.kill('SIGTERM');
    }
    
    setTimeout(() => {
      if (whisperProcess && !whisperProcess.killed) {
        console.log('[Whisper] Force killing service...');
        whisperProcess.kill();
      }
    }, 5000);

    whisperProcess = null;
    console.log('✅ Whisper service stopped');
  }
}

export function isWhisperServiceRunning(): boolean {
  return whisperProcess !== null && !whisperProcess.killed;
}

export async function checkWhisperHealth(): Promise<boolean> {
  try {
    const response = await axios.get(`${WHISPER_URL}/health`, { timeout: 2000 });
    return response.status === 200 && response.data.status === 'ok';
  } catch (error) {
    return false;
  }
}

async function waitForServiceReady(maxAttempts = 30, delayMs = 1000): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const isHealthy = await checkWhisperHealth();
    if (isHealthy) {
      return;
    }
    console.log(`[Whisper] Waiting for service to be ready... (${i + 1}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  throw new Error('Whisper service failed to become ready');
}

async function transcribeWithExternalAPI(audioPath: string, apiUrl: string, apiKey: string): Promise<string> {
  if (!fs.existsSync(audioPath)) {
    throw new Error(`Audio file not found: ${audioPath}`);
  }

  try {
    console.log(`[Whisper External] Transcribing with external API: ${apiUrl}`);
    
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', fs.createReadStream(audioPath));
    form.append('model', 'whisper-1');

    const response = await axios.post(apiUrl, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${apiKey}`,
      },
      timeout: 300000,
    });

    const transcript = response.data.text || response.data.transcript || '';
    console.log(`[Whisper External] Transcription complete: ${transcript.substring(0, 100)}...`);
    
    return transcript;
  } catch (error: any) {
    console.error('[Whisper External] Transcription failed:', error.message);
    throw new Error(`External transcription failed: ${error.message}`);
  }
}

export async function transcribeAudio(audioPath: string, useExternal: boolean = false, externalUrl: string = '', externalKey: string = ''): Promise<string> {
  if (useExternal && externalUrl && externalKey) {
    return transcribeWithExternalAPI(audioPath, externalUrl, externalKey);
  }

  const isHealthy = await checkWhisperHealth();
  if (!isHealthy) {
    throw new Error('Whisper service is not running or not responding');
  }

  if (!fs.existsSync(audioPath)) {
    throw new Error(`Audio file not found: ${audioPath}`);
  }

  try {
    console.log(`[Whisper] Transcribing: ${audioPath}`);
    
    const response = await axios.post(
      `${WHISPER_URL}/transcribe`,
      { audio_path: audioPath },
      { timeout: 300000 }
    );

    const transcript = response.data.text;
    console.log(`[Whisper] Transcription complete: ${transcript.substring(0, 100)}...`);
    
    return transcript;
  } catch (error: any) {
    console.error('[Whisper] Transcription failed:', error.message);
    throw new Error(`Transcription failed: ${error.message}`);
  }
}
