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

export function speak(text: string, rate = 0.95): boolean {
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
