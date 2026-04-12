/**
 * Piper TTS Client for Jungle Kids Game
 *
 * Provides high-quality text-to-speech integration with Piper neural TTS.
 * Falls back to browser SpeechSynthesis if Piper server is unavailable.
 *
 * Features:
 * - Neural voice quality
 * - Caching for performance
 * - Graceful fallback handling
 * - Child-friendly voice selection
 * - Loading indicators
 */

class PiperTTS {
    constructor(options = {}) {
        this.endpoint = options.endpoint || 'http://127.0.0.1:8080/tts';
        this.fallback = window.speechSynthesis;
        this.cache = new Map();
        this.isOnline = false;
        this.currentVoice = options.voice || 'en_US-lessac-medium';
        this.speed = options.speed || 1.0;

        // Check server availability
        this.checkServerStatus();

        // Pre-load common phrases
        this.preloadCommonPhrases();
    }

    async checkServerStatus() {
        try {
            const response = await fetch('http://127.0.0.1:8080/health', {
                timeout: 2000
            });
            this.isOnline = response.ok;
            if (this.isOnline) {
                console.log('Piper TTS server is online');
            }
        } catch (error) {
            this.isOnline = false;
            console.log('Piper TTS server offline, using browser fallback');
        }
    }

    preloadCommonPhrases() {
        // Pre-load frequently used educational phrases
        const commonPhrases = [
            'Correct!',
            'Try again!',
            'Well done!',
            'Great job!',
            'Match found!',
            'Keep going!',
            'You win!',
            'Let\'s play!',
            'Ready to start?',
            'That\'s right!'
        ];

        // Pre-load in background (don't await)
        commonPhrases.forEach(phrase => {
            this.speak(phrase, { preload: true }).catch(() => {});
        });
    }

    async speak(text, options = {}) {
        if (!text || text.trim().length === 0) return;

        // Use cache for repeated phrases
        const cacheKey = `${this.currentVoice}:${text}:${this.speed}`;
        if (this.cache.has(cacheKey) && !options.skipCache) {
            return this.playCachedAudio(this.cache.get(cacheKey));
        }

        // Try Piper TTS first
        if (this.isOnline && !options.forceFallback) {
            try {
                return await this.speakWithPiper(text, options);
            } catch (error) {
                console.warn('Piper TTS failed:', error);
                // Mark as offline for future calls
                this.isOnline = false;
            }
        }

        // Fallback to browser speech synthesis
        return this.speakWithBrowser(text, options);
    }

    async speakWithPiper(text, options = {}) {
        const requestData = {
            text: text,
            voice: this.currentVoice,
            speed: this.speed
        };

        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`Piper TTS HTTP ${response.status}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        // Cache for future use (unless it's a preload)
        if (!options.preload) {
            const cacheKey = `${this.currentVoice}:${text}:${this.speed}`;
            this.cache.set(cacheKey, audioUrl);
        }

        return this.playAudio(audioUrl, options);
    }

    speakWithBrowser(text, options = {}) {
        return new Promise((resolve) => {
            const utterance = new SpeechSynthesisUtterance(text);

            // Configure voice settings
            utterance.rate = this.speed;
            utterance.pitch = options.pitch || 1.0;
            utterance.volume = options.volume || 1.0;

            // Try to select a child-friendly voice
            const voices = this.fallback.getVoices();
            const preferredVoice = voices.find(voice =>
                voice.name.toLowerCase().includes('female') ||
                voice.name.toLowerCase().includes('karen') ||
                voice.name.toLowerCase().includes('samantha')
            );

            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }

            utterance.onend = () => resolve();
            utterance.onerror = () => resolve();

            this.fallback.speak(utterance);
        });
    }

    async playCachedAudio(audioUrl) {
        return this.playAudio(audioUrl);
    }

    async playAudio(audioUrl, options = {}) {
        return new Promise((resolve) => {
            const audio = new Audio(audioUrl);

            if (options.volume !== undefined) {
                audio.volume = options.volume;
            }

            audio.onended = () => {
                // Clean up blob URL if not cached
                if (!options.keepBlobUrl) {
                    URL.revokeObjectURL(audioUrl);
                }
                resolve();
            };

            audio.onerror = () => {
                URL.revokeObjectURL(audioUrl);
                resolve();
            };

            // Play with user interaction handling
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Autoplay blocked, resolve immediately
                    resolve();
                });
            }
        });
    }

    setVoice(voiceName) {
        this.currentVoice = voiceName;
    }

    setSpeed(speed) {
        this.speed = Math.max(0.5, Math.min(2.0, speed));
    }

    clearCache() {
        // Clean up blob URLs
        for (const url of this.cache.values()) {
            URL.revokeObjectURL(url);
        }
        this.cache.clear();
    }

    // Utility methods for common game phrases
    async sayCorrect() {
        return this.speak('Correct!');
    }

    async sayTryAgain() {
        return this.speak('Try again!');
    }

    async sayWellDone() {
        return this.speak('Well done!');
    }

    async sayYouWin() {
        return this.speak('You win!');
    }

    async sayLetsPlay() {
        return this.speak('Let\'s play!');
    }
}

// Global TTS instance
let piperTTS;

function initPiperTTS() {
    piperTTS = new PiperTTS({
        voice: 'en_US-lessac-medium', // Child-friendly female voice
        speed: 0.9 // Slightly slower for clarity
    });

    // Make available globally for games
    window.piperTTS = piperTTS;

    console.log('Piper TTS initialized for Jungle Kids Game');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPiperTTS);
} else {
    initPiperTTS();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PiperTTS;
}