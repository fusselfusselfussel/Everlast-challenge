'use client';

import { Component, ReactNode } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-background">
          <Card className="p-8 max-w-2xl">
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-red-500 mb-4">
                  Application Error
                </h1>
                <p className="text-text/80">
                  Something went wrong. The application encountered an unexpected error.
                </p>
              </div>

              {this.state.error && (
                <div className="p-4 rounded bg-red-500/10 border border-red-500">
                  <p className="text-sm font-mono text-red-400">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <Button onClick={this.handleReset} variant="primary">
                  Restart Application
                </Button>
              </div>

              <div className="text-xs text-text/50 text-center space-y-1">
                <p>If the problem persists, try:</p>
                <p>• Restart Ollama: <code className="text-primary">ollama serve</code></p>
                <p>• Restart Whisper: <code className="text-primary">cd services/whisper-service && ./start.sh</code></p>
                <p>• Check the browser console for detailed error logs</p>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
