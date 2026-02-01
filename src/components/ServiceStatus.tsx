'use client';

import { useEffect, useState } from 'react';
import { Card } from './ui/Card';

interface ServiceHealth {
  whisper: boolean;
  ollama: boolean;
  ollamaHasModel: boolean;
}

export function ServiceStatus() {
  const [health, setHealth] = useState<ServiceHealth>({ whisper: false, ollama: false, ollamaHasModel: false });
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkServices = async () => {
      try {
        const [whisperResult, ollamaResult] = await Promise.all([
          window.electron.checkWhisperHealth(),
          window.electron.checkOllama(),
        ]);

        const hasLlama31 = ollamaResult.models?.some((model: string) => 
          model.includes('llama3.1') || model.includes('llama3_1')
        ) || false;

        setHealth({
          whisper: whisperResult.healthy,
          ollama: ollamaResult.healthy,
          ollamaHasModel: hasLlama31,
        });
      } catch (error) {
        console.error('[ServiceStatus] Health check failed:', error);
      } finally {
        setChecking(false);
      }
    };

    checkServices();
    const interval = setInterval(checkServices, 10000);

    return () => clearInterval(interval);
  }, []);

  const allHealthy = health.whisper && health.ollama && health.ollamaHasModel;
  const someUnhealthy = !health.whisper || !health.ollama || !health.ollamaHasModel;

  if (checking) {
    return null;
  }

  if (allHealthy) {
    return null;
  }

  return (
    <Card className="p-4 border-2 border-red-500 bg-red-500/10">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <h3 className="text-lg font-semibold text-red-500">Service Status Warning</h3>
        </div>

        <div className="space-y-2 text-sm">
          {!health.whisper && (
            <div className="p-3 rounded-xl bg-black border-2 border-red-500/50">
              <p className="font-medium text-red-400 mb-1">❌ Whisper Service Offline</p>
              <p className="text-yellow-400/70 text-xs mb-2">
                Transcription will not work until the service is started.
              </p>
              <code className="text-xs text-yellow-400 block">
                cd services/whisper-service && ./setup.sh && ./start.sh
              </code>
            </div>
          )}

          {!health.ollama && (
            <div className="p-3 rounded-xl bg-black border-2 border-red-500/50">
              <p className="font-medium text-red-400 mb-1">❌ Ollama Service Offline</p>
              <p className="text-yellow-400/70 text-xs mb-2">
                AI pipeline will not work until Ollama is running.
              </p>
              <code className="text-xs text-yellow-400 block mb-1">
                ollama serve
              </code>
              <code className="text-xs text-yellow-400 block">
                ollama pull llama3.1
              </code>
            </div>
          )}

          {health.ollama && !health.ollamaHasModel && (
            <div className="p-3 rounded-xl bg-black border-2 border-red-500/50">
              <p className="font-medium text-red-400 mb-1">❌ llama3.1 Model Not Found</p>
              <p className="text-yellow-400/70 text-xs mb-2">
                AI pipeline requires the llama3.1 model to be installed.
              </p>
              <code className="text-xs text-yellow-400 block">
                ollama pull llama3.1
              </code>
            </div>
          )}
        </div>

        <p className="text-xs text-yellow-400/50">
          Services are checked automatically every 10 seconds
        </p>
      </div>
    </Card>
  );
}
