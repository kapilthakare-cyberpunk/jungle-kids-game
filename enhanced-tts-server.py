#!/usr/bin/env python3
"""
Enhanced TTS Server for Jungle Kids Game - Premium Voice Quality

Uses Microsoft Edge TTS for studio-quality voices optimized for children.
Features:
- Premium Microsoft Azure voices
- Child-friendly voice selection
- High-quality audio output
- Fast response times
- Offline caching
- Robust error handling

Author: Jungle Kids Game Enhanced TTS
"""

import os
import sys
import json
import logging
import asyncio
import tempfile
import hashlib
from pathlib import Path
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import io
import edge_tts

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class EnhancedTTSManager:
    """Manages premium Edge TTS voices"""

    def __init__(self):
        self.cache_dir = Path(tempfile.gettempdir()) / "jungle_kids_enhanced_tts"
        self.cache_dir.mkdir(exist_ok=True)
        logger.info(f"TTS cache directory: {self.cache_dir}")

        # Premium child-friendly voices
        self.voices = {
            "child_female": "en-US-AriaNeural",  # Young female, clear and friendly
            "child_male": "en-US-ChristopherNeural",  # Young male, energetic
            "storyteller_female": "en-GB-SoniaNeural",  # British female, warm storyteller
            "storyteller_male": "en-GB-RyanNeural",  # British male, professional
            "educational_female": "en-US-JennyNeural",  # Educational female, clear
            "educational_male": "en-US-GuyNeural",  # Educational male, professional
        }

        # Default voice for kids
        self.default_voice = "en-US-AriaNeural"  # Child-friendly female

    async def generate_speech(self, text, voice_name=None, rate="+0%", pitch="+0Hz"):
        """Generate high-quality speech using Edge TTS"""
        if not text or not text.strip():
            raise ValueError("Empty text provided")

        text = text.strip()
        if len(text) > 1000:
            raise ValueError("Text too long (max 1000 characters)")

        # Select voice
        voice = self.voices.get(voice_name, self.default_voice)
        if voice_name and voice_name not in self.voices:
            voice = self.default_voice

        # Create cache key
        cache_key = hashlib.md5(f"{voice}:{text}:{rate}:{pitch}".encode()).hexdigest()
        cache_file = self.cache_dir / f"{cache_key}.mp3"

        # Check cache first
        if cache_file.exists():
            logger.debug(f"Cache hit for: {text[:50]}...")
            return cache_file.read_bytes()

        # Generate new audio
        logger.info(f"Generating speech: {text[:50]}... using {voice}")
        start_time = asyncio.get_event_loop().time()

        try:
            communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
            audio_data = b""

            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_data += chunk["data"]

            # Cache the result
            cache_file.write_bytes(audio_data)

            generation_time = asyncio.get_event_loop().time() - start_time
            logger.info(".2f")

            return audio_data

        except Exception as e:
            logger.error(f"TTS generation failed: {e}")
            raise


# Initialize TTS manager
tts_manager = EnhancedTTSManager()

# Flask app setup
app = Flask(__name__)
CORS(app)


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify(
        {
            "status": "healthy",
            "service": "Enhanced Edge TTS",
            "voices_available": list(tts_manager.voices.keys()),
            "default_voice": tts_manager.default_voice,
            "cache_size": len(list(tts_manager.cache_dir.glob("*.mp3"))),
        }
    )


@app.route("/tts", methods=["POST"])
def text_to_speech():
    """Main TTS endpoint with premium voice quality"""
    try:
        # Parse request
        data = request.get_json()
        if not data or "text" not in data:
            return jsonify({"error": "Missing 'text' field"}), 400

        text = data["text"].strip()
        if not text:
            return jsonify({"error": "Empty text"}), 400

        # Voice selection with smart defaults
        voice_name = data.get("voice")
        if not voice_name:
            # Auto-select voice based on content
            if any(
                word in text.lower()
                for word in ["lion", "tiger", "bear", "elephant", "monkey", "animal"]
            ):
                voice_name = "child_female"  # Exciting animal content
            elif any(
                word in text.lower()
                for word in ["correct", "well done", "great job", "amazing"]
            ):
                voice_name = "storyteller_female"  # Positive feedback
            elif any(
                word in text.lower() for word in ["try again", "oops", "not quite"]
            ):
                voice_name = "educational_female"  # Gentle correction
            else:
                voice_name = "child_female"  # Default child-friendly

        # Voice parameters
        rate = data.get("rate", "+0%")  # Speed adjustment
        pitch = data.get("pitch", "+0Hz")  # Pitch adjustment

        # Validate parameters
        if not isinstance(rate, str) or not rate.endswith("%"):
            rate = "+0%"
        if not isinstance(pitch, str) or not pitch.endswith("Hz"):
            pitch = "+0Hz"

        # Generate speech (async)
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        audio_data = loop.run_until_complete(
            tts_manager.generate_speech(text, voice_name, rate, pitch)
        )
        loop.close()

        # Return high-quality audio
        return send_file(
            io.BytesIO(audio_data), mimetype="audio/mpeg", as_attachment=False
        )

    except Exception as e:
        logger.error(f"TTS request failed: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/voices", methods=["GET"])
def list_voices():
    """List available premium voices"""
    voices_info = {
        "child_female": {
            "name": "en-US-AriaNeural",
            "description": "Young female voice, perfect for kids",
            "quality": "Premium",
            "language": "en-US",
        },
        "child_male": {
            "name": "en-US-ChristopherNeural",
            "description": "Young male voice, energetic and fun",
            "quality": "Premium",
            "language": "en-US",
        },
        "storyteller_female": {
            "name": "en-GB-SoniaNeural",
            "description": "British female, warm storyteller voice",
            "quality": "Premium",
            "language": "en-GB",
        },
        "storyteller_male": {
            "name": "en-GB-RyanNeural",
            "description": "British male, professional narrator",
            "quality": "Premium",
            "language": "en-GB",
        },
        "educational_female": {
            "name": "en-US-JennyNeural",
            "description": "Educational female, clear and patient",
            "quality": "Premium",
            "language": "en-US",
        },
        "educational_male": {
            "name": "en-US-GuyNeural",
            "description": "Educational male, authoritative yet gentle",
            "quality": "Premium",
            "language": "en-US",
        },
    }

    return jsonify(
        {
            "voices": voices_info,
            "default": tts_manager.default_voice,
            "service": "Microsoft Edge TTS - Premium Quality",
        }
    )


@app.route("/cache/clear", methods=["POST"])
def clear_cache():
    """Clear TTS cache"""
    try:
        cache_files = list(tts_manager.cache_dir.glob("*.mp3"))
        for file in cache_files:
            file.unlink()

        return jsonify({"message": f"Cleared {len(cache_files)} cached audio files"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/test", methods=["GET"])
def test_tts():
    """Test endpoint for quick TTS verification"""
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        audio_data = loop.run_until_complete(
            tts_manager.generate_speech(
                "Hello! The Jungle Kids Game has premium voice quality!"
            )
        )
        loop.close()

        return send_file(
            io.BytesIO(audio_data), mimetype="audio/mpeg", as_attachment=False
        )
    except Exception as e:
        return jsonify({"error": f"Test failed: {str(e)}"}), 500


if __name__ == "__main__":
    logger.info("🚀 Starting Enhanced TTS Server for Jungle Kids Game")
    logger.info("🎤 Using Microsoft Edge TTS - Premium Voice Quality")
    logger.info("🌐 Available at: http://127.0.0.1:8080")
    logger.info("🩺 Health check: http://127.0.0.1:8080/health")
    logger.info("🧪 Test audio: http://127.0.0.1:8080/test")

    # Start server
    app.run(host="127.0.0.1", port=8080, debug=False, threaded=True)
