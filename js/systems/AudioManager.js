/* NEON ROYALE - Audio Manager */
export class AudioManager {
    constructor() {
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.volume = {
            master: 0.7,
            music: 0.7,
            sfx: 0.8,
            ambience: 0.5
        };
        this.audioContext = null;
        this.sounds = {};
        this.ambientTrack = null;
    }

    /** Initialize audio context */
    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.error('Web Audio API not supported');
        }
    }

    /** Load a sound */
    loadSound(name, url) {
        const audio = new Audio(url);
        audio.volume = this.volume.sfx;
        this.sounds[name] = audio;
    }

    /** Play a sound */
    playSound(name, options = {}) {
        if (!this.soundEnabled || !this.sounds[name]) return;
        
        const audio = this.sounds[name].cloneNode();
        audio.volume = this.volume.sfx * this.volume.master;
        
        if (options.loop) {
            audio.loop = true;
        }
        
        audio.play().catch(e => console.log('Sound play failed'));
    }

    /** Play UI click sound */
    playClick() {
        this.playSound('click');
    }

    /** Play win sound */
    playWin() {
        this.playSound('win');
    }

    /** Play lose sound */
    playLose() {
        this.playSound('lose');
    }

    /** Play jackpot sound */
    playJackpot() {
        this.playSound('jackpot');
    }

    /** Toggle sound */
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        return this.soundEnabled;
    }

    /** Toggle music */
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (this.musicEnabled) {
            this.playAmbient();
        } else {
            if (this.ambientTrack) {
                this.ambientTrack.pause();
                this.ambientTrack.currentTime = 0;
            }
        }
        return this.musicEnabled;
    }

    /** Play ambient casino music */
    playAmbient() {
        if (!this.musicEnabled || !this.audioContext) return;
        
        // Create a simple synth-based ambient track
        // In a full game, this would use loaded audio files
        this.ambientTrack = this.createAmbientSynth();
        this.ambientTrack.loop = true;
        this.ambientTrack.volume = this.volume.ambience * this.volume.master;
        this.ambientTrack.start(this.audioContext.currentTime);
    }

    /** Create ambient synth sound */
    createAmbientSynth() {
        const now = this.audioContext.currentTime;
        
        // Oscillator for base tone
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc1.frequency.value = 110; // A3
        osc2.frequency.value = 110 * 1.05946; // A#3
        osc1.type = 'sine';
        osc2.type = 'square';
        
        // Gain envelope
        const attack = 0.5;
        const release = 2;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.volume.ambience, now + attack);
        gain.gain.linearRampToTimeValue(0, now + 30 + release);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc1.start(now);
        osc2.start(now);
        
        osc1.stop(now + 30 + release);
        osc2.stop(now + 30 + release);
        
        return { pause: () => {}, start: () => {} }; // Placeholder
    }

    /** Set volume */
    setVolume(volumeType, value) {
        this.volume[volumeType] = Math.max(0, Math.min(1, value));
        this.savePreferences();
    }

    /** Save volume preferences */
    savePreferences() {
        localStorage.setItem('neon_royale_audio', JSON.stringify(this.volume));
    }

    /** Load volume preferences */
    loadPreferences() {
        const saved = localStorage.getItem('neon_royale_audio');
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(this.volume, parsed);
        }
    }
}