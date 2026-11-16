// Seslendirme: bilgisayarın kendi İngilizce sesini kullanır (gerçek insan kaydı değildir).
export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === 'en-GB') ??
    voices.find((v) => v.lang === 'en-US') ??
    voices.find((v) => v.lang.toLowerCase().startsWith('en'))
  );
}

declare const __AUDIO_FILES__: Record<string, string>;
const AUDIO: Record<string, string> = typeof __AUDIO_FILES__ === 'undefined' ? {} : __AUDIO_FILES__;

/** Metnin kayıt dosyası adı: küçük harf, harf/rakam dışı her şey tire. "How much is it?" → "how-much-is-it" */
export function audioKey(text: string): string {
  return text.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

let current: HTMLAudioElement | null = null;

/** Gerçek ses kaydı varsa onu çalar (yavaş modda hızı düşürür). */
function playRecording(text: string, rate: number): boolean {
  const file = AUDIO[audioKey(text)];
  if (!file) return false;
  try {
    current?.pause();
    if (canSpeak()) window.speechSynthesis.cancel();
    const audio = new Audio(`assets/audio/${file}`);
    audio.playbackRate = rate < 0.9 ? 0.75 : 1;
    (audio as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = true;
    current = audio;
    void audio.play().catch(() => { current = null; });
    return true;
  } catch {
    return false;
  }
}

export function hasRecording(text: string): boolean {
  return Boolean(AUDIO[audioKey(text)]);
}

export function speak(text: string, rate = 0.95): boolean {
  if (playRecording(text, rate)) return true;
  if (!canSpeak()) return false;
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = pickVoice();
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang ?? 'en-GB';
    utterance.rate = rate;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

// Bazı sistemlerde ses listesi geç yüklenir; ilk çağrıda hazır olması için önceden istenir.
if (canSpeak()) window.speechSynthesis.getVoices();
