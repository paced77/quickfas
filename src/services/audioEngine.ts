/**
 * PROJECT KINGDOM: 2027+ AUDIO INTELLIGENCE ENGINE
 * Synthesizes harmonic acoustic cues using Web Audio API and voice briefings using Web Speech API.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private isAmbientPlaying = false;
  private isMuted = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.isAmbientPlaying) {
      this.stopAmbientPulse();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Positive Signal: Soft uplifting tone (harmonic dual-frequency chime)
   */
  public playPositiveSignal() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    // F#5 (739.99Hz) resolving to A#5 (932.33Hz)
    osc1.frequency.setValueAtTime(587.33, now);
    osc1.frequency.exponentialRampToValueAtTime(880.0, now + 0.18);

    osc2.frequency.setValueAtTime(880.0, now);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.22);

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.12, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.56);
    osc2.stop(now + 0.56);
  }

  /**
   * Warning Signal: Single low pulse with subtle sub-harmonic
   */
  public playWarningSignal() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(261.63, now); // Middle C
    osc.frequency.exponentialRampToValueAtTime(174.61, now + 0.25); // Drops to F3

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.16, now + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.46);
  }

  /**
   * Critical Alert: Escalated directional alert (urgent multi-step chime)
   */
  public playCriticalAlert() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sawtooth';
    // Rapid stepped pulses
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(440, now + 0.08);
    osc.frequency.setValueAtTime(987.77, now + 0.16);
    osc.frequency.setValueAtTime(523.25, now + 0.24);

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  /**
   * Completion: Confirmation acknowledgment
   */
  public playCompletionSignal() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.07); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.14); // G5
    osc.frequency.setValueAtTime(1046.50, now + 0.21); // C6

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.62);
  }

  /**
   * Ambient Telemetry Pulse: Deep 55Hz grounding sovereign pulse
   */
  public toggleAmbientPulse(): boolean {
    if (this.isAmbientPlaying) {
      this.stopAmbientPulse();
      return false;
    } else {
      this.startAmbientPulse();
      return true;
    }
  }

  public startAmbientPulse() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      this.stopAmbientPulse();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low A1

      gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.035, this.ctx.currentTime + 2.0); // Gentle background floor

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      this.ambientOsc = osc;
      this.ambientGain = gain;
      this.isAmbientPlaying = true;
    } catch {
      // AudioContext policy
    }
  }

  public stopAmbientPulse() {
    if (this.ambientGain && this.ctx) {
      try {
        this.ambientGain.gain.linearRampToValueAtTime(0.00001, this.ctx.currentTime + 0.5);
        setTimeout(() => {
          this.ambientOsc?.stop();
          this.ambientOsc?.disconnect();
          this.ambientGain?.disconnect();
          this.ambientOsc = null;
          this.ambientGain = null;
        }, 550);
      } catch {
        // cleanup
      }
    }
    this.isAmbientPlaying = false;
  }

  public isAmbientActive(): boolean {
    return this.isAmbientPlaying;
  }

  // --- Voice Briefing Engine (Web Speech API) ---

  public speak(text: string, onEnd?: () => void): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }

    window.speechSynthesis.cancel();
    if (this.isMuted) {
      if (onEnd) onEnd();
      return false;
    }

    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Pick a natural, authoritative voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        (v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('Daniel') ||
          v.name.includes('Premium')) &&
        v.lang.startsWith('en')
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = 1.02; // Confident, crisp cadence
    utterance.pitch = 0.98;

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public isSpeaking(): boolean {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      return window.speechSynthesis.speaking;
    }
    return false;
  }
}

export const audioEngine = new AudioEngine();
