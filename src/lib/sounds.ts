"use client";

class SoundEffects {
  private context: AudioContext | null = null;
  private enabled: boolean = true;

  private initContext() {
    if (typeof window === "undefined") return;
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.context.state === "suspended") {
      this.context.resume();
    }
  }

  public toggleMute() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  public isEnabled() {
    return this.enabled;
  }

  public playTap() {
    // Soft, quick tap for navigation
    if (!this.enabled || typeof window === "undefined") return;
    this.initContext();
    if (!this.context) return;

    const duration = 0.05;
    const osc = this.context.createOscillator();
    const gainNode = this.context.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(400, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.context.currentTime + 0.02);

    gainNode.gain.setValueAtTime(0.05, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(this.context.destination);

    osc.start();
    osc.stop(this.context.currentTime + duration);
  }

  public playSelect() {
    // Slightly higher pitch tap for selecting items
    if (!this.enabled || typeof window === "undefined") return;
    this.initContext();
    if (!this.context) return;
    
    const duration = 0.08;
    const osc = this.context.createOscillator();
    const gainNode = this.context.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(600, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.context.currentTime + 0.04);

    gainNode.gain.setValueAtTime(0.08, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(this.context.destination);

    osc.start();
    osc.stop(this.context.currentTime + duration);
  }

  public playSuccess() {
    // Ascending soft arpeggio for success (e.g. activity registered)
    if (!this.enabled || typeof window === "undefined") return;
    this.initContext();
    if (!this.context) return;

    // A4, C#5, E5, A5
    const notes = [440, 554.37, 659.25, 880]; 
    notes.forEach((freq, i) => {
      setTimeout(() => {
        if (!this.context) return;
        const osc = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        osc.type = "sine";
        osc.frequency.value = freq;
        
        gainNode.gain.setValueAtTime(0.1, this.context.currentTime);
        gainNode.gain.setTargetAtTime(0, this.context.currentTime, 0.1);
        
        osc.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        osc.start();
        osc.stop(this.context.currentTime + 0.3);
      }, i * 80); // 80ms between notes
    });
  }
}

export const sounds = new SoundEffects();
