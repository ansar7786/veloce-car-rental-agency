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

  // Cinematic Engine Ignition Sound (Synthesized with Web Audio API)
  public playIgnition() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Starter motor pulse
      const starterOsc = this.ctx.createOscillator();
      const starterGain = this.ctx.createGain();
      starterOsc.type = 'sawtooth';
      starterOsc.frequency.setValueAtTime(45, t);
      starterOsc.frequency.exponentialRampToValueAtTime(85, t + 0.35);

      starterGain.gain.setValueAtTime(0.08, t);
      starterGain.gain.exponentialRampToValueAtTime(0.01, t + 0.38);

      starterOsc.connect(starterGain);
      starterGain.connect(this.ctx.destination);
      starterOsc.start(t);
      starterOsc.stop(t + 0.38);

      // Deep V8 / Flat-6 ignition roar
      const roarOsc = this.ctx.createOscillator();
      const roarFilter = this.ctx.createBiquadFilter();
      const roarGain = this.ctx.createGain();

      roarOsc.type = 'sawtooth';
      roarOsc.frequency.setValueAtTime(65, t + 0.35);
      roarOsc.frequency.exponentialRampToValueAtTime(140, t + 0.6);
      roarOsc.frequency.exponentialRampToValueAtTime(55, t + 1.4);

      roarFilter.type = 'lowpass';
      roarFilter.frequency.setValueAtTime(180, t + 0.35);
      roarFilter.frequency.exponentialRampToValueAtTime(650, t + 0.6);
      roarFilter.frequency.exponentialRampToValueAtTime(140, t + 1.4);

      roarGain.gain.setValueAtTime(0.0001, t + 0.35);
      roarGain.gain.exponentialRampToValueAtTime(0.18, t + 0.55);
      roarGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);

      roarOsc.connect(roarFilter);
      roarFilter.connect(roarGain);
      roarGain.connect(this.ctx.destination);

      roarOsc.start(t + 0.35);
      roarOsc.stop(t + 1.5);
    } catch {
      // Ignore audio failure
    }
  }
}

export const audioEngine = new AudioEngine();
