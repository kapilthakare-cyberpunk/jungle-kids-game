#!/usr/bin/env python3
"""
Piper TTS Server for Jungle Kids Game

This server provides high-quality text-to-speech using Piper neural TTS engine.
Optimized for educational content with child-friendly voices.

Features:
- Local TTS processing (no internet required)
- Multiple voice models
- REST API for web integration
- Caching for frequently used phrases
- Error handling with fallbacks

Usage:
    python tts-server.py

API Endpoint:
    POST /tts
    Content-Type: application/json

    Request: {"text": "Hello world", "voice": "en_US-lessac-medium", "speed": 1.0}
    Response: Audio WAV data

Voices Available:
- en_US-lessac-medium (female, clear)
- en_GB-alan-medium (male, friendly)
- en_US-ryan-medium (young male)
- en_US-amy-medium (female, educational)

Author: Jungle Kids Game TTS Integration
"""

import os
import sys
import json
import logging
import tempfile
import hashlib
from pathlib import Path
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import io
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class PiperTTSManager:
    """Manages Piper TTS voices and synthesis"""

    def __init__(self):
        self.voices = {}
        self.cache_dir = Path(tempfile.gettempdir()) / "jungle_kids_tts_cache"
        self.cache_dir.mkdir(exist_ok=True)
        logger.info(f"TTS cache directory: {self.cache_dir}")

    def load_voice(self, voice_name):
        """Load a Piper voice model"""
        if voice_name in self.voices:
            return self.voices[voice_name]

        try:
            from piper import PiperVoice

            # Try different voice model paths
            possible_paths = [
                f"./voices/{voice_name}.onnx",
                f"./voices/{voice_name}/{voice_name}.onnx",
                f"/usr/share/piper-voices/{voice_name}.onnx",
                f"./piper-voices/{voice_name}.onnx",
            ]

            voice_path = None
            for path in possible_paths:
                if os.path.exists(path):
                    voice_path = path
                    break

            if not voice_path:
                logger.warning(f"Voice model not found: {voice_name}")
                return None

            logger.info(f"Loading voice: {voice_name}")
            voice = PiperVoice.load(voice_path)
            self.voices[voice_name] = voice
            return voice

        except ImportError:
            logger.error("Piper TTS not installed. Install with: pip install piper-tts")
            return None
        except Exception as e:
            logger.error(f"Failed to load voice {voice_name}: {e}")
            return None

    def synthesize(self, text, voice_name="en_US-lessac-medium", speed=1.0):
        """Synthesize text to speech with caching"""
        # Create cache key
        cache_key = hashlib.md5(f"{voice_name}:{text}:{speed}".encode()).hexdigest()
        cache_file = self.cache_dir / f"{cache_key}.wav"

        # Check cache first
        if cache_file.exists():
            logger.debug(f"Cache hit for: {text[:50]}...")
            return cache_file.read_bytes()

        # Load voice
        voice = self.load_voice(voice_name)
        if not voice:
            raise Exception(f"Voice not available: {voice_name}")

        # Synthesize
        logger.debug(f"Synthesizing: {text[:50]}...")
        start_time = time.time()

        try:
            # Piper synthesis
            audio_data = voice.synthesize(text)

            # Cache the result
            cache_file.write_bytes(audio_data)

            synthesis_time = time.time() - start_time
            logger.info(".2f")

            return audio_data

        except Exception as e:
            logger.error(f"Synthesis failed: {e}")
            raise


# Initialize TTS manager
tts_manager = PiperTTSManager()

# Flask app setup
app = Flask(__name__)
CORS(app)  # Enable CORS for web integration


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify(
        {
            "status": "healthy",
            "voices_loaded": list(tts_manager.voices.keys()),
            "cache_size": len(list(tts_manager.cache_dir.glob("*.wav"))),
        }
    )


@app.route("/tts", methods=["POST"])
def text_to_speech():
    """Main TTS endpoint"""
    try:
        # Parse request
        data = request.get_json()
        if not data or "text" not in data:
            return jsonify({"error": "Missing 'text' field"}), 400

        text = data["text"].strip()
        if not text:
            return jsonify({"error": "Empty text"}), 400

        voice = data.get("voice", "en_US-lessac-medium")
        speed = float(data.get("speed", 1.0))

        # Validate parameters
        if not (0.5 <= speed <= 2.0):
            return jsonify({"error": "Speed must be between 0.5 and 2.0"}), 400

        if len(text) > 1000:
            return jsonify({"error": "Text too long (max 1000 characters)"}), 400

        # Synthesize
        audio_data = tts_manager.synthesize(text, voice, speed)

        # Return audio
        return send_file(
            io.BytesIO(audio_data), mimetype="audio/wav", as_attachment=False
        )

    except Exception as e:
        logger.error(f"TTS request failed: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/voices", methods=["GET"])
def list_voices():
    """List available voices"""
    available_voices = [
        {
            "name": "en_US-lessac-medium",
            "description": "Female voice, clear and child-friendly",
            "language": "en-US",
        },
        {
            "name": "en_GB-alan-medium",
            "description": "Male voice, friendly and warm",
            "language": "en-GB",
        },
        {
            "name": "en_US-ryan-medium",
            "description": "Young male voice, energetic",
            "language": "en-US",
        },
        {
            "name": "en_US-amy-medium",
            "description": "Female voice, educational and clear",
            "language": "en-US",
        },
    ]

    return jsonify(
        {"voices": available_voices, "loaded": list(tts_manager.voices.keys())}
    )


@app.route("/cache/clear", methods=["POST"])
def clear_cache():
    """Clear TTS cache"""
    try:
        cache_files = list(tts_manager.cache_dir.glob("*.wav"))
        for file in cache_files:
            file.unlink()

        return jsonify({"message": f"Cleared {len(cache_files)} cached files"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    logger.info("Starting Piper TTS Server for Jungle Kids Game")
    logger.info("Available at: http://127.0.0.1:8080")
    logger.info("Health check: http://127.0.0.1:8080/health")

    # Start server
    app.run(host="127.0.0.1", port=8080, debug=False, threaded=True)
