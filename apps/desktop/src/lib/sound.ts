// Kısa ses efektleri. Ses dosyası yoktur; sesler Web Audio ile anlık üretilir.
let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(value: boolean): void {
  enabled = value;
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = 'sine', gain = 0.08): void {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, ctx.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
  osc.connect(g).connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + duration + 0.05);
}

export function playSound(kind: 'correct' | 'wrong' | 'finish' | 'tap'): void {
  if (!enabled) return;
  try {
    if (!ctx) ctx = new AudioContext();
    if (kind === 'correct') { tone(660, 0, 0.12); tone(990, 0.09, 0.18); }
    else if (kind === 'wrong') { tone(220, 0, 0.22, 'triangle', 0.07); tone(180, 0.1, 0.25, 'triangle', 0.06); }
    else if (kind === 'finish') { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.25)); }
    else tone(880, 0, 0.05, 'sine', 0.03);
  } catch {
    /* ses aygıtı yoksa sessizce devam edilir */
  }
}
