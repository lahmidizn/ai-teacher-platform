// ============================================
// نظام الأصوات التفاعلية
// ============================================

const Sounds = {
    audioContext: null,
    
    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    },
    
    play(type) {
        if (!this.audioContext) {
            this.init();
            if (!this.audioContext) return;
        }
        
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const sounds = {
            click: { freq: 800, duration: 0.05, type: 'sine', volume: 0.1 },
            correct: { freq: 523.25, duration: 0.15, type: 'sine', volume: 0.15 },
            wrong: { freq: 200, duration: 0.2, type: 'sawtooth', volume: 0.1 },
            success: { freq: 659.25, duration: 0.3, type: 'sine', volume: 0.2 },
            start: { freq: 440, duration: 0.2, type: 'triangle', volume: 0.15 },
            complete: { 
                notes: [523.25, 659.25, 783.99, 1046.50], 
                duration: 0.2, 
                type: 'sine', 
                volume: 0.2 
            },
            tick: { freq: 1000, duration: 0.03, type: 'sine', volume: 0.05 },
            hover: { freq: 600, duration: 0.05, type: 'sine', volume: 0.05 }
        };
        
        const sound = sounds[type];
        if (!sound) return;
        
        if (sound.notes) {
            this.playSequence(sound.notes, sound.duration, sound.type, sound.volume);
        } else {
            this.playTone(sound.freq, sound.duration, sound.type, sound.volume);
        }
    },
    
    playTone(freq, duration, type, volume) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    },
    
    playSequence(notes, duration, type, volume) {
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, duration, type, volume), i * 100);
        });
    }
};

// Make Sounds globally accessible
if (typeof window !== 'undefined') {
    window.Sounds = Sounds;
}

// Initialize on first user interaction
document.addEventListener('click', () => Sounds.init(), { once: true });
