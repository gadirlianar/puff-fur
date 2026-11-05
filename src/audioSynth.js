// =============================================================================
// PROCEDURAL WEB AUDIO SYNTHESIZER FOR MOCHI-PUFF (ZERO EXTERNAL ASSETS)
// =============================================================================
// Provides delightful procedural audio feedback directly via browser AudioContext:
// - Boop / squash pop (bouncy frequency slide)
// - Petting / purr vibration (fluttering low-frequency purr)
// - Camera shutter click (vintage SLR polaroid click)
// - Affection level-up chime (sparkling crystal arpeggio)
// - Acrobatics joy-flip whoosh (cheerful rising pitch)
// - Global mute toggle with localStorage persistence

let audioCtx = null;
let isMuted = false;

try {
  const savedMute = localStorage.getItem('mochi_sound_muted');
  if (savedMute !== null) {
    isMuted = savedMute === 'true';
  }
} catch (e) {
  // Graceful fallback if localStorage is disabled
}

function getAudioContext() {
  if (isMuted) return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Auto-unlock Web Audio context on the first user interaction
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    if (!isMuted) {
      getAudioContext();
    }
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio, { once: true, passive: true });
  window.addEventListener('keydown', unlockAudio, { once: true, passive: true });
  window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
}


/**
 * Playful cartoon pop when Mochi is booped or clicked.
 */
export function playBoopSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(560 + Math.random() * 60, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.12);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.26, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.18);
  } catch (err) {
    // Silent fail
  }
}

/**
 * Soft cat-like purring vibration when user combs or pets Mochi.
 * Throttled to ensure smooth, pleasant soundscape during continuous dragging.
 */
let lastPurrTime = 0;
export function playPurrSound() {
  const now = performance.now();
  if (now - lastPurrTime < 135) return;
  lastPurrTime = now;

  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    // 24Hz LFO mod for fluttering purr
    lfo.frequency.setValueAtTime(24, t);
    lfoGain.gain.setValueAtTime(28, t);
    lfo.connect(lfoGain);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(105 + Math.random() * 15, t);
    lfoGain.connect(osc.frequency);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(340, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.16, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    lfo.start(t);
    osc.start(t);
    lfo.stop(t + 0.22);
    osc.stop(t + 0.22);
  } catch (err) {
    // Silent fail
  }
}

function playMechanicalClick(ctx, startTime, freq, duration, vol) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'square';
  osc.frequency.setValueAtTime(freq, startTime);
  osc.frequency.exponentialRampToValueAtTime(140, startTime + duration);

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(freq * 1.1, startTime);
  filter.Q.setValueAtTime(2.5, startTime);

  gain.gain.setValueAtTime(vol, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.01);
}

/**
 * Crisp retro SLR / polaroid camera shutter sound.
 */
export function playShutterSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const t = ctx.currentTime;
    playMechanicalClick(ctx, t, 1100, 0.035, 0.26);
    playMechanicalClick(ctx, t + 0.055, 750, 0.05, 0.22);
  } catch (err) {
    // Silent fail
  }
}

/**
 * Sparkling crystal arpeggio when affection hits a milestone or 100%.
 */
export function playLevelUpSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const t = ctx.currentTime;
    // C6, E6, G6, C7
    const notes = [1046.5, 1318.5, 1567.98, 2093.0];
    notes.forEach((freq, idx) => {
      const noteTime = t + idx * 0.075;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.2, noteTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.55);
    });
  } catch (err) {
    // Silent fail
  }
}

/**
 * Joyful rising whoosh when Mochi performs a backflip.
 */
export function playFlipSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(780, t + 0.26);
    osc.frequency.exponentialRampToValueAtTime(420, t + 0.42);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.24, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.46);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.48);
  } catch (err) {
    // Silent fail
  }
}

export function isAudioMuted() {
  return isMuted;
}

export function setAudioMuted(muted) {
  isMuted = Boolean(muted);
  try {
    localStorage.setItem('mochi_sound_muted', String(isMuted));
  } catch (e) {}
  if (!isMuted) {
    getAudioContext();
  }
  return isMuted;
}

export function toggleAudioMute() {
  return setAudioMuted(!isMuted);
}
