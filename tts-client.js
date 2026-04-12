/**
 * Enhanced TTS Client for Jungle Kids Game - Premium Voice Quality
 *
 * Uses Microsoft Edge TTS for studio-quality voices optimized for children.
 * Falls back to browser SpeechSynthesis if server is unavailable.
 *
 * Features:
 * - Premium Microsoft Azure voices
 * - Child-friendly voice selection
 * - High-quality audio output
 * - Smart voice selection based on content
 * - Intelligent caching
 * - Graceful fallback handling
 */

class EnhancedTTS {
    constructor(options = {}) {
        this.endpoint = options.endpoint || 'http://127.0.0.1:8080/tts';
        this.fallback = window.speechSynthesis;
        this.cache = new Map();
        this.isOnline = false;
        this.currentVoice = options.voice || 'child_female';
        this.speed = options.speed || 0.9; // Slightly slower for kids
        this.pitch = options.pitch || '+0Hz';

        // Check server availability
        this.checkServerStatus();

        // Pre-load common educational phrases
        this.preloadCommonPhrases();
    }

    async checkServerStatus() {
        try {
            const response = await fetch('http://127.0.0.1:8080/health', {
                signal: AbortSignal.timeout(3000) // 3 second timeout
            });
            this.isOnline = response.ok;
            if (this.isOnline) {
                console.log('🎤 Enhanced TTS server online - Premium Microsoft voices available');
            }
        } catch (error) {
            this.isOnline = false;
            console.log('⚠️ Enhanced TTS server offline - Using browser speech synthesis');
        }
    }

    preloadCommonPhrases() {
        // Pre-load frequently used educational phrases with smart voice selection
        const commonPhrases = [
            { text: 'Correct!', voice: 'child_female' },
            { text: 'Try again!', voice: 'educational_female' },
            { text: 'Well done!', voice: 'storyteller_female' },
            { text: 'Great job!', voice: 'child_female' },
            { text: 'Match found!', voice: 'storyteller_male' },
            { text: 'Keep going!', voice: 'educational_female' },
            { text: 'You win!', voice: 'child_male' },
            { text: 'Let\'s play!', voice: 'child_female' },
            { text: 'Ready to start?', voice: 'storyteller_male' },
            { text: 'That\'s right!', voice: 'educational_female' }
        ];

        // Pre-load in background (don't await)
        commonPhrases.forEach(phrase => {
            this.speak(phrase.text, { voice: phrase.voice, preload: true }).catch(() => {});
        });
    }

    async speak(text, options = {}) {
        if (!text || text.trim().length === 0) return;

        // Smart voice selection based on content
        let selectedVoice = options.voice || this.currentVoice;

        if (!options.voice) {
            // Auto-select voice based on content type
            const lowerText = text.toLowerCase();

            if (lowerText.includes('lion') || lowerText.includes('tiger') ||
                lowerText.includes('bear') || lowerText.includes('elephant') ||
                lowerText.includes('monkey') || lowerText.includes('animal')) {
                selectedVoice = 'child_female'; // Exciting animal content
            } else if (lowerText.includes('correct') || lowerText.includes('well done') ||
                      lowerText.includes('great job') || lowerText.includes('amazing')) {
                selectedVoice = 'storyteller_female'; // Positive feedback
            } else if (lowerText.includes('try again') || lowerText.includes('oops') ||
                      lowerText.includes('not quite') || lowerText.includes('keep going')) {
                selectedVoice = 'educational_female'; // Gentle correction
            } else if (lowerText.includes('you win') || lowerText.includes('winner')) {
                selectedVoice = 'child_male'; // Celebratory
            } else if (lowerText.includes('the ') && lowerText.includes(' says')) {
                selectedVoice = 'storyteller_male'; // Narration
            }
        }

        // Use cache for repeated phrases
        const cacheKey = `${selectedVoice}:${text}:${this.speed}:${this.pitch}`;
        if (this.cache.has(cacheKey) && !options.skipCache) {
            return this.playCachedAudio(this.cache.get(cacheKey));
        }

        // Try Enhanced TTS first (Microsoft Edge)
        if (this.isOnline && !options.forceFallback) {
            try {
                return await this.speakWithEnhanced(text, selectedVoice, options);
            } catch (error) {
                console.warn('Enhanced TTS failed:', error);
                this.isOnline = false; // Mark offline for future calls
            }
        }

        // Fallback to browser speech synthesis
        return this.speakWithBrowser(text, options);
    }

    async speakWithEnhanced(text, voice, options = {}) {
        const requestData = {
            text: text,
            voice: voice,
            rate: options.rate || this.speed,
            pitch: options.pitch || this.pitch
        };

        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
            signal: AbortSignal.timeout(10000) // 10 second timeout
        });

        if (!response.ok) {
            throw new Error(`Enhanced TTS HTTP ${response.status}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        // Cache for future use (unless it's a preload)
        if (!options.preload) {
            const cacheKey = `${voice}:${text}:${this.speed}:${this.pitch}`;
            this.cache.set(cacheKey, audioUrl);
        }

        return this.playAudio(audioUrl, options);
    }

    speakWithBrowser(text, options = {}) {
        return new Promise((resolve) => {
            const utterance = new SpeechSynthesisUtterance(text);

            // Configure voice settings
            utterance.rate = options.rate || this.speed;
            utterance.pitch = (options.pitch === '+0Hz') ? 1.0 : 1.0; // Convert Hz to multiplier
            utterance.volume = options.volume || 1.0;

            // Try to select the best available browser voice
            const voices = this.fallback.getVoices();
            const preferredVoice = voices.find(voice =>
                voice.name.toLowerCase().includes('female') ||
                voice.name.toLowerCase().includes('karen') ||
                voice.name.toLowerCase().includes('samantha') ||
                voice.name.toLowerCase().includes('aria')
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

    // Enhanced utility methods with smart voice selection
    async sayCorrect() {
        return this.speak('Correct!', { voice: 'child_female' });
    }

    async sayTryAgain() {
        return this.speak('Try again!', { voice: 'educational_female' });
    }

    async sayWellDone() {
        return this.speak('Well done!', { voice: 'storyteller_female' });
    }

    async sayYouWin() {
        return this.speak('You win!', { voice: 'child_male' });
    }

    async sayLetsPlay() {
        return this.speak('Let\'s play!', { voice: 'child_female' });
    }
}

// Global TTS instance
let enhancedTTS;

function initEnhancedTTS() {
    enhancedTTS = new EnhancedTTS({
        voice: 'child_female', // Premium child-friendly voice
        speed: 0.9, // Slightly slower for clarity
        pitch: '+0Hz' // Natural pitch
    });

    // Make available globally for games (backward compatibility)
    window.piperTTS = enhancedTTS;
    window.enhancedTTS = enhancedTTS;

    console.log('🎤 Enhanced TTS initialized - Premium Microsoft Edge voices for Jungle Kids Game');
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