# Piper TTS Integration Plan for Jungle Kids Game

## Overview
Integrate Piper TTS (https://github.com/OHF-Voice/piper1-gpl) to replace browser SpeechSynthesis with higher quality, more consistent voices for educational content.

## Integration Strategy

### 1. Backend TTS Server
- **Technology**: Piper TTS Web Server API
- **Installation**: `pip install piper-tts`
- **Models**: Download child-friendly voice models
- **Endpoint**: Local HTTP server on port 8080

### 2. Frontend Integration
- **Current**: Browser `speechSynthesis.speak()`
- **New**: Fetch API calls to local Piper server
- **Fallback**: Keep SpeechSynthesis as backup

### 3. Voice Selection
- **Priority**: Child-friendly, clear voices
- **Languages**: English (US/UK), additional languages possible
- **Quality**: High-quality neural voices over robotic synthesis

## Implementation Steps

### Step 1: Set up Piper TTS Server
```bash
# Install Piper TTS
pip install piper-tts

# Download voice models (child-friendly)
piper --download-voices

# Run web server
python -c "
from piper import PiperVoice
from flask import Flask, request, send_file
import io

app = Flask(__name__)
voice = PiperVoice.load('path/to/voice/model')

@app.route('/tts', methods=['POST'])
def tts():
    text = request.json.get('text', '')
    audio_data = voice.synthesize(text)
    return send_file(io.BytesIO(audio_data), mimetype='audio/wav')

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080)
"
```

### Step 2: Frontend TTS Client
```javascript
class PiperTTS {
    constructor() {
        this.endpoint = 'http://127.0.0.1:8080/tts';
        this.fallback = window.speechSynthesis;
    }

    async speak(text, options = {}) {
        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, ...options })
            });

            if (response.ok) {
                const audioBlob = await response.blob();
                const audio = new Audio(URL.createObjectURL(audioBlob));
                audio.play();
            } else {
                throw new Error('Piper TTS failed');
            }
        } catch (error) {
            console.warn('Piper TTS failed, using fallback:', error);
            this.fallbackSpeak(text, options);
        }
    }

    fallbackSpeak(text, options) {
        const utterance = new SpeechSynthesisUtterance(text);
        if (options.rate) utterance.rate = options.rate;
        if (options.pitch) utterance.pitch = options.pitch;
        this.fallback.speak(utterance);
    }
}
```

### Step 3: Game Integration
- Replace `speechSynthesis.speak()` calls with `piperTTS.speak()`
- Add loading indicators for TTS requests
- Handle offline scenarios gracefully

## Voice Model Selection

### Recommended Models for Kids:
1. **en_US-lessac-medium** - Clear, child-friendly female voice
2. **en_GB-alan-medium** - Friendly male voice
3. **en_US-ryan-high** - Young male voice
4. **en_US-amy-medium** - Clear female voice

### Download Commands:
```bash
# Download specific voice models
piper --model en_US-lessac-medium --download-dir ./voices
piper --model en_GB-alan-medium --download-dir ./voices
```

## Technical Considerations

### Performance
- **Local Processing**: Faster than API calls, no internet required
- **Caching**: Cache frequently used phrases
- **Async Loading**: Non-blocking TTS requests

### Error Handling
- **Server Unavailable**: Graceful fallback to SpeechSynthesis
- **Network Issues**: Offline detection and messaging
- **Audio Playback**: Handle browser autoplay restrictions

### Security
- **Local Only**: TTS server runs locally, no external API calls
- **No Data Transmission**: All processing stays on device
- **Child Safety**: No tracking or data collection

## Benefits for Kids Game

### Voice Quality
- **Natural Sounding**: Neural voices sound more human
- **Consistent Quality**: Same voice across all browsers/platforms
- **Emotional Expression**: Better for educational engagement

### Educational Value
- **Clear Pronunciation**: Better word clarity for learning
- **Multiple Voices**: Different characters can have distinct voices
- **Language Learning**: Support for multiple languages

### Technical Advantages
- **Offline Capability**: Works without internet connection
- **Cross-Platform**: Consistent experience on all devices
- **Customizable**: Can adjust voice parameters for different content

## Implementation Timeline

1. **Week 1**: Set up Piper TTS server and basic integration
2. **Week 2**: Replace SpeechSynthesis calls in all games
3. **Week 3**: Test voice models and optimize performance
4. **Week 4**: Add advanced features (voice switching, caching)

## Files to Modify

- `index.html` - Add TTS client initialization
- `*/index.html` - Replace speechSynthesis calls
- New files: `tts-server.py`, `tts-client.js`
- `start.sh` - Include TTS server startup

This integration will significantly enhance the educational value and user experience of the Jungle Kids Game with professional-quality text-to-speech.