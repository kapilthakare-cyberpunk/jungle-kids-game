#!/bin/bash
# Jungle Kids Game - TTS Integration Test

echo "🧪 Testing Piper TTS Integration for Jungle Kids Game"
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. TTS features require Python 3.7+"
    echo "   Install Python from: https://python.org"
    exit 1
fi

# Check if Flask is available (for CORS)
if ! python3 -c "import flask" 2>/dev/null; then
    echo "⚠️  Flask not found. Installing required dependencies..."
    pip install flask flask-cors
fi

# Check if Piper TTS is available
if ! python3 -c "import piper" 2>/dev/null; then
    echo "⚠️  Piper TTS not found. Installing..."
    pip install piper-tts
fi

# Check for voice models
echo "🎵 Checking for voice models..."
VOICE_MODELS=("en_US-lessac-medium" "en_GB-alan-medium" "en_US-ryan-medium" "en_US-amy-medium")
MISSING_MODELS=()

mkdir -p voices

for model in "${VOICE_MODELS[@]}"; do
    if [ ! -f "voices/${model}.onnx" ]; then
        MISSING_MODELS+=("$model")
    fi
done

if [ ${#MISSING_MODELS[@]} -ne 0 ]; then
    echo "📥 Downloading missing voice models..."
    for model in "${MISSING_MODELS[@]}"; do
        echo "  Downloading ${model}..."
        piper --model "${model}" --download-dir ./voices
    done
fi

echo ""
echo "✅ TTS Setup Complete!"
echo ""
echo "🚀 To test TTS integration:"
echo ""
echo "Terminal 1 - Start TTS Server:"
echo "  python tts-server.py"
echo ""
echo "Terminal 2 - Start Web Server:"
echo "  ./start.sh"
echo ""
echo "Then open: http://localhost:8181"
echo ""
echo "🎮 Test the following games for TTS:"
echo "  - Memory Match (animal names and feedback)"
echo "  - Counting Fun (numbers and encouragement)"
echo "  - ABC Jungle (letters and animal names)"
echo ""
echo "💡 TTS will automatically fallback to browser speech if server is offline."