class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private engineGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.initCtx();
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.engineGain && this.ctx) {
      this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }
    return !this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Tactile minimal UI click
  public playClick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // Audio fallback silent
    }
  }

  // Cinematic Ferrari Twin-Turbo V8 Engine Ignition Sound (Synthesized with Web Audio API)
  public playIgnition() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // High-speed starter motor compression pulses
      const starterOsc = this.ctx.createOscillator();
      const starterGain = this.ctx.createGain();
      starterOsc.type = 'sawtooth';
      starterOsc.frequency.setValueAtTime(60, t);
      starterOsc.frequency.exponentialRampToValueAtTime(110, t + 0.32);

      starterGain.gain.setValueAtTime(0.09, t);
      starterGain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

      starterOsc.connect(starterGain);
      starterGain.connect(this.ctx.destination);
      starterOsc.start(t);
      starterOsc.stop(t + 0.35);

      // Primary flat-plane V8 exhaust roar & rev spike
      const roarOsc = this.ctx.createOscillator();
      const roarFilter = this.ctx.createBiquadFilter();
      const roarGain = this.ctx.createGain();

      roarOsc.type = 'sawtooth';
      roarOsc.frequency.setValueAtTime(82, t + 0.32);
      roarOsc.frequency.exponentialRampToValueAtTime(245, t + 0.58);
      roarOsc.frequency.exponentialRampToValueAtTime(74, t + 1.45);

      roarFilter.type = 'lowpass';
      roarFilter.frequency.setValueAtTime(240, t + 0.32);
      roarFilter.frequency.exponentialRampToValueAtTime(1200, t + 0.58);
      roarFilter.frequency.exponentialRampToValueAtTime(210, t + 1.45);
      roarFilter.Q.setValueAtTime(2.5, t + 0.32);

      roarGain.gain.setValueAtTime(0.0001, t + 0.32);
      roarGain.gain.exponentialRampToValueAtTime(0.22, t + 0.52);
      roarGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);

      roarOsc.connect(roarFilter);
      roarFilter.connect(roarGain);
      roarGain.connect(this.ctx.destination);

      roarOsc.start(t + 0.32);
      roarOsc.stop(t + 1.6);

      // High-frequency turbo spool & mechanical valve chatter harmonic
      const turboOsc = this.ctx.createOscillator();
      const turboFilter = this.ctx.createBiquadFilter();
      const turboGain = this.ctx.createGain();

      turboOsc.type = 'triangle';
      turboOsc.frequency.setValueAtTime(164, t + 0.35);
      turboOsc.frequency.exponentialRampToValueAtTime(490, t + 0.62);
      turboOsc.frequency.exponentialRampToValueAtTime(148, t + 1.4);

      turboFilter.type = 'bandpass';
      turboFilter.frequency.setValueAtTime(800, t + 0.35);
      turboFilter.frequency.exponentialRampToValueAtTime(2200, t + 0.62);
      turboFilter.frequency.exponentialRampToValueAtTime(600, t + 1.4);

      turboGain.gain.setValueAtTime(0.0001, t + 0.35);
      turboGain.gain.exponentialRampToValueAtTime(0.08, t + 0.55);
      turboGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);

      turboOsc.connect(turboFilter);
      turboFilter.connect(turboGain);
      turboGain.connect(this.ctx.destination);

      turboOsc.start(t + 0.35);
      turboOsc.stop(t + 1.4);
    } catch {
      // Ignore audio failure
    }
  }
}

export const audioEngine = new AudioEngine();
