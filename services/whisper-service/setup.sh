#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔧 Setting up Whisper Transcription Service..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "✅ Found Python $PYTHON_VERSION"

if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
else
    echo "✅ Virtual environment already exists"
fi

source venv/bin/activate

echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the Whisper service:"
echo "  ./start.sh"
echo ""
echo "Environment variables (optional):"
echo "  WHISPER_MODEL=medium|large-v3  (default: medium)"
echo "  WHISPER_DEVICE=cuda|cpu         (default: cuda)"
echo "  WHISPER_COMPUTE_TYPE=float16|int8 (default: float16)"
echo "  PORT=8001                       (default: 8001)"
