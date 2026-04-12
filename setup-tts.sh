#!/bin/bash
# Jungle Kids Game - TTS Setup Script
# Installs Piper TTS and downloads child-friendly voice models

echo "🎤 Setting up Piper TTS for Jungle Kids Game..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required. Please install Python 3 first."
    exit 1
fi

# Install Piper TTS
echo "📦 Installing Piper TTS..."
pip install piper-tts

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Piper TTS. Please check your Python/pip installation."
    exit 1
fi

# Create voices directory
echo "📁 Creating voices directory..."
mkdir -p voices

# Download child-friendly voice models
echo "🎵 Downloading child-friendly voice models..."

# Download en_US-lessac-medium (female, clear, child-friendly)
echo "  Downloading en_US-lessac-medium (female voice)..."
piper --model en_US-lessac-medium --download-dir ./voices

# Download en_GB-alan-medium (male, friendly)
echo "  Downloading en_GB-alan-medium (male voice)..."
piper --model en_GB-alan-medium --download-dir ./voices

# Download en_US-ryan-medium (young male)
echo "  Downloading en_US-ryan-medium (young male voice)..."
piper --model en_US-ryan-medium --download-dir ./voices

# Download en_US-amy-medium (educational female)
echo "  Downloading en_US-amy-medium (educational female voice)..."
piper --model en_US-amy-medium --download-dir ./voices

echo ""
echo "✅ Piper TTS setup complete!"
echo ""
echo "🎮 To start the game with TTS:"
echo "1. Start the TTS server: python tts-server.py"
echo "2. Start the web server: ./start.sh"
echo "3. Open http://localhost:8181 in your browser"
echo ""
echo "🎵 TTS will automatically use high-quality neural voices!"
echo "💡 If TTS server is offline, games will use browser speech synthesis as fallback."
echo ""
echo "📚 Voice Models Available:"
echo "  - en_US-lessac-medium: Female, clear, child-friendly"
echo "  - en_GB-alan-medium: Male, friendly and warm"
echo "  - en_US-ryan-medium: Young male, energetic"
echo "  - en_US-amy-medium: Female, educational and clear"