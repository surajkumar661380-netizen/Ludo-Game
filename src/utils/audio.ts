/**
 * Web Audio API Sound Synthesizer for Ludo Game
 * Generates rich tactile sounds for dice rolls, token steps, captures, and celebrations.
 */

class SoundEffects {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

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
  }

  /**
   * Crisp multi-tap dice roll rattle
   */
  public playDiceRoll() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const count = 6;
    const now = this.ctx.currentTime;

    for (let i = 0; i < count; i++) {
      const tapTime = now + i * 0.05 + Math.random() * 0.02;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + Math.random() * 220, tapTime);
      osc.frequency.exponentialRampToValueAtTime(40, tapTime + 0.04);

      gain.gain.setValueAtTime(0.2, tapTime);
      gain.gain.exponentialRampToValueAtTime(0.001, tapTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(tapTime);
      osc.stop(tapTime + 0.05);
    }
  }

  /**
   * Melodic wooden token stepping sound
   */
  public playStep(pitchMultiplier = 1) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const baseFreq = 380 * pitchMultiplier;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  /**
   * Entering the board from yard (Chime)
   */
  public playEnterBoard() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440, 660];

    notes.forEach((freq, idx) => {
      const t = now + idx * 0.08;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  /**
   * Capturing opponent token (Pop / Knock)
   */
  public playCapture() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // High impact thump
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(260, now);
    osc1.frequency.exponentialRampToValueAtTime(60, now + 0.16);

    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.19);

    // Follow-up sparkle
    setTimeout(() => {
      if (!this.ctx || this.isMuted) return;
      const t2 = this.ctx.currentTime;
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, t2);
      osc2.frequency.exponentialRampToValueAtTime(1100, t2 + 0.12);

      gain2.gain.setValueAtTime(0.2, t2);
      gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.15);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc2.start(t2);
      osc2.stop(t2 + 0.15);
    }, 100);
  }

  /**
   * Rolled a 6! (Celebration chime)
   */
  public playSix() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chords = [523.25, 659.25, 783.99]; // C5, E5, G5

    chords.forEach((freq, idx) => {
      const t = now + idx * 0.06;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + 0.28);
    });
  }

  /**
   * Token reaches Home center!
   */
  public playHome() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];

    notes.forEach((freq, idx) => {
      const t = now + idx * 0.08;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + 0.32);
    });
  }

  /**
   * Final Victory Fanfare
   */
  public playVictory() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [
      { f: 523.25, d: 0.12 },
      { f: 523.25, d: 0.12 },
      { f: 523.25, d: 0.12 },
      { f: 659.25, d: 0.35 },
      { f: 587.33, d: 0.18 },
      { f: 783.99, d: 0.5 }
    ];

    let offset = 0;
    notes.forEach((note) => {
      const t = now + offset;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + note.d + 0.05);

      offset += note.d * 0.9;
    });
  }
}

export const sound = new SoundEffects();
