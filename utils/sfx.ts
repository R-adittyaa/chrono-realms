// Sound Effect Generator pakai Web Audio API
// Gak perlu file .mp3 — suara dibuat dari kode

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

// Nada dasar
function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.1,
  delay = 0
) {
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0, ctx.currentTime + delay);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
}

// === SFX ===

// Dadu dilempar — bunyi "clack"
export function sfxDiceRoll() {
  playTone(200, 0.05, 'square', 0.08, 0);
  playTone(300, 0.05, 'square', 0.08, 0.06);
  playTone(250, 0.05, 'square', 0.08, 0.12);
  playTone(400, 0.08, 'square', 0.1, 0.18);
}

// Beli wilayah — "ka-ching!"
export function sfxBuy() {
  playTone(800, 0.1, 'sine', 0.15, 0);
  playTone(1200, 0.15, 'sine', 0.15, 0.08);
  playTone(1600, 0.2, 'sine', 0.12, 0.16);
}

// Bayar sewa — "duit keluar"
export function sfxPay() {
  playTone(600, 0.15, 'triangle', 0.12, 0);
  playTone(400, 0.2, 'triangle', 0.12, 0.12);
}

// Menang Siege — fanfare
export function sfxSiegeWin() {
  playTone(523, 0.15, 'square', 0.12, 0);   // C5
  playTone(659, 0.15, 'square', 0.12, 0.12); // E5
  playTone(784, 0.15, 'square', 0.12, 0.24); // G5
  playTone(1047, 0.4, 'square', 0.15, 0.36); // C6
}

// Kalah Siege — turun
export function sfxSiegeLose() {
  playTone(400, 0.2, 'sawtooth', 0.1, 0);
  playTone(300, 0.2, 'sawtooth', 0.1, 0.18);
  playTone(200, 0.4, 'sawtooth', 0.1, 0.36);
}

// Global Event — misterius
export function sfxEvent() {
  playTone(440, 0.2, 'sine', 0.1, 0);
  playTone(554, 0.2, 'sine', 0.1, 0.15);
  playTone(659, 0.3, 'sine', 0.1, 0.3);
}

// Victory — fanfare besar
export function sfxVictory() {
  const notes = [523, 659, 784, 1047, 784, 1047, 1319];
  notes.forEach((freq, i) => {
    playTone(freq, 0.2, 'square', 0.12, i * 0.15);
  });
}

// Klik / hover ringan
export function sfxClick() {
  playTone(1000, 0.03, 'sine', 0.05, 0);
}

// Token jalan
export function sfxMove() {
  playTone(500, 0.04, 'triangle', 0.06, 0);
}

// Token jalan — "tick" pendek
export function sfxTick() {
  playTone(700, 0.03, 'triangle', 0.04, 0);
}

// Token sampai tujuan — "tok" agak berat
export function sfxLand() {
  playTone(400, 0.08, 'sine', 0.1, 0);
  playTone(600, 0.1, 'sine', 0.08, 0.06);
}