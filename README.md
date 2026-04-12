# jungle-kids-game

## Overview
Web-based educational game collection for children featuring 8 interactive games with memory puzzles, counting, coloring, shape matching, rhythm training, and more. Includes neural text-to-speech for enhanced accessibility and engagement in early childhood learning.

## Project Purpose
Facilitate fun and accessible learning for children. The game focuses on basic cognitive skills such as memory, number recognition, and creativity through a simple and intuitive web interface.

## Key Features
- **Memory Puzzles:** Integrated memory game with jungle-themed assets.
- **Counting Activities:** Interactive counting exercises for kids.
- **Coloring Suite:** Simple web-based coloring tool for creative play.
- **Interactive Audio:** Sound-enhanced interactions for better engagement.
- **Neural Text-to-Speech:** High-quality Piper TTS voices for educational content.
- **Shape Matching:** New geometric shape recognition game.
- **Jungle Rhythm:** Timing and coordination game with beat matching.

## Prerequisites
- Modern web browser (Chrome, Firefox, Safari).
- Git for cloning the repository.
- Python 3.7+ (for enhanced TTS features, optional).

## Installation
```bash
git clone https://github.com/kapilthakare-cyberpunk/jungle-kids-game
cd jungle-kids-game
```

## Configuration
- Customize game sounds in the `sounds/` directory.
- Update alphabet and coloring assets in their respective folders.

## Usage

### Basic Setup (Web Only)
```bash
./start.sh
# Or open index.html directly in a browser
```

### Enhanced Setup (with Neural TTS)
For the best experience with high-quality voices:

```bash
# 1. Install Piper TTS and download voice models
./setup-tts.sh

# 2. Start the TTS server (in one terminal)
python tts-server.py

# 3. Start the web server (in another terminal)
./start.sh

# 4. Open http://localhost:8181 in your browser
```

### TTS Features
- **Neural Voices:** High-quality, natural-sounding speech
- **Child-Friendly:** Optimized voices for educational content
- **Offline:** Works without internet connection
- **Fallback:** Automatically uses browser speech synthesis if TTS server is unavailable
- **Caching:** Frequently used phrases are cached for performance

### Voice Models Included
- `en_US-lessac-medium`: Female voice, clear and child-friendly
- `en_GB-alan-medium`: Male voice, friendly and warm
- `en_US-ryan-medium`: Young male voice, energetic
- `en_US-amy-medium`: Female voice, educational and clear

## Development
- Add new game modules to the root directory.
- Ensure all assets are optimized for web performance.

## License
Refer to the LICENSE file for details.