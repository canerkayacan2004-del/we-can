import type { Exercise, ResponseValue, WriteExercise } from './types.ts';

const CONTRACTIONS: [RegExp, string][] = [
  [/\bi'm\b/g, 'i am'],
  [/\byou're\b/g, 'you are'],
  [/\bwe're\b/g, 'we are'],
  [/\bthey're\b/g, 'they are'],
  [/\bhe's\b/g, 'he is'],
  [/\bshe's\b/g, 'she is'],
  [/\bit's\b/g, 'it is'],
  [/\bthat's\b/g, 'that is'],
  [/\bwhat's\b/g, 'what is'],
  [/\bwhere's\b/g, 'where is'],
  [/\bwho's\b/g, 'who is'],
  [/\bisn't\b/g, 'is not'],
  [/\baren't\b/g, 'are not'],
  [/\bdon't\b/g, 'do not'],
  [/\bdoesn't\b/g, 'does not'],
  [/\bcan't\b/g, 'cannot'],
  [/\bcan not\b/g, 'cannot'],
  [/\bi've\b/g, 'i have'],
  [/\bwe've\b/g, 'we have'],
  [/\bthey've\b/g, 'they have'],
  [/\byou've\b/g, 'you have'],
  [/\bhaven't\b/g, 'have not'],
  [/\bhasn't\b/g, 'has not'],
  [/\bi'd\b/g, 'i would'],
];

/** Cevapları karşılaştırmadan önce sadeleştirir: büyük-küçük harf, noktalama ve kısaltma farkları yok sayılır. */
export function normalizeAnswer(input: string): string {
  let s = (input ?? '').toLowerCase().replace(/[’‘`]/g, "'").replace(/[“”]/g, '"');
  s = s.replace(/[.,!?;:"]/g, ' ');
  for (const [re, full] of CONTRACTIONS) s = s.replace(re, full);
  return s.replace(/\s+/g, ' ').trim();
}

function matchesAny(given: string, accepted: string[]): boolean {
  const g = normalizeAnswer(given);
  return g.length > 0 && accepted.some((a) => normalizeAnswer(a) === g);
}

export interface WritingCheck {
  ok: boolean;
  sentenceCount: number;
  missingTr: string[];
}

/** Yapay zekâ olmadan yapılabilen temel yazı kontrolü: cümle sayısı ve zorunlu ifadeler. */
export function checkWriting(ex: WriteExercise, text: string): WritingCheck {
  const sentences = (text ?? '')
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).filter(Boolean).length >= 2);
  const lower = normalizeAnswer(text ?? '');
  const missingTr: string[] = [];
  for (const group of ex.mustInclude ?? []) {
    const found = group.anyOf.some((term) => lower.includes(normalizeAnswer(term)));
    if (!found) missingTr.push(group.labelTr);
  }
  return {
    ok: sentences.length >= ex.minSentences && missingTr.length === 0,
    sentenceCount: sentences.length,
    missingTr,
  };
}

export interface Grade {
  /** Bilgi ve kelime tanıtım kartları puanlanmaz. */
  gradable: boolean;
  correct: boolean;
  expected: string;
  given: string;
}

function choice(options: string[], answer: number, response: ResponseValue): Grade {
  const idx = typeof response === 'number' ? response : -1;
  return {
    gradable: true,
    correct: idx === answer,
    expected: options[answer],
    given: idx >= 0 && idx < options.length ? options[idx] : '',
  };
}

export function gradeExercise(ex: Exercise, response: ResponseValue): Grade {
  switch (ex.type) {
    case 'info':
    case 'flashcard':
      return { gradable: false, correct: true, expected: '', given: '' };
    case 'mcq':
    case 'listen_choice':
    case 'dialogue':
      return choice(ex.options, ex.answer, response);
    case 'truefalse': {
      const given = response === 1 ? 'Doğru' : response === 0 ? 'Yanlış' : '';
      return { gradable: true, correct: (response === 1) === ex.answer && (response === 0 || response === 1), expected: ex.answer ? 'Doğru' : 'Yanlış', given };
    }
    case 'fill': {
      const given = typeof response === 'string' ? response : '';
      return { gradable: true, correct: matchesAny(given, ex.accepted), expected: ex.accepted[0], given };
    }
    case 'translate':
    case 'listen': {
      const given = typeof response === 'string' ? response : '';
      return { gradable: true, correct: matchesAny(given, ex.accepted), expected: ex.accepted[0], given };
    }
    case 'order': {
      const given = typeof response === 'string' ? response : '';
      return {
        gradable: true,
        correct: matchesAny(given, [ex.answer, ...(ex.altAnswers ?? [])]),
        expected: ex.answer,
        given,
      };
    }
    case 'match': {
      const mistakes =
        response && typeof response === 'object' && typeof response.mistakes === 'number' ? response.mistakes : -1;
      return {
        gradable: true,
        correct: mistakes === 0,
        expected: ex.pairs.map(([a, b]) => `${a} = ${b}`).join(', '),
        given: mistakes < 0 ? '' : mistakes === 0 ? 'Hatasız eşleştirildi' : `${mistakes} yanlış deneme`,
      };
    }
    case 'write': {
      const given = typeof response === 'string' ? response : '';
      const check = checkWriting(ex, given);
      return {
        gradable: true,
        correct: check.ok,
        expected: `En az ${ex.minSentences} cümle` + (ex.mustInclude?.length ? ' ve istenen ifadeler' : ''),
        given,
      };
    }
  }
}

/** Kartın soru metnini (hata listeleri ve tekrar kartları için) tek satırda verir. */
export function exerciseLabel(ex: Exercise): string {
  switch (ex.type) {
    case 'fill': return ex.text;
    case 'translate': return `${ex.prompt} ${ex.source}`;
    case 'listen': case 'listen_choice': return `${ex.prompt} (🔊 ${ex.audioText.length > 60 ? ex.audioText.slice(0, 57) + '…' : ex.audioText})`;
    case 'truefalse': return ex.statement;
    case 'dialogue': return ex.lines.map((l) => `${l.speaker}: ${l.text}`).join(' / ');
    default: return ex.prompt;
  }
}
