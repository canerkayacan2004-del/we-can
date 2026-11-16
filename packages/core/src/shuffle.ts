// Testlerde soru ve şık karıştırma.
// Ekranda şıklar karışık gösterilir; verilen cevap, puanlamadan önce özgün şık sırasına çevrilir.
// Böylece puanlama (sunucuda da) özgün içerikle yapılır ve kopyalanan cevap sıraları işe yaramaz.
import type { Exercise, Responses } from './types.ts';

export type Rng = () => number;

/** Tekrarlanabilir rastgele sayı üreteci (testler için). */
export function seededRng(seed: number): Rng {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 0x100000000;
  };
}

export function shuffled<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** perm[gösterilenSıra] = özgünSıra */
export function permutation(length: number, rng: Rng = Math.random): number[] {
  return shuffled(Array.from({ length }, (_, i) => i), rng);
}

export interface ShuffledSet {
  exercises: Exercise[];
  /** Gösterilen şık sırasıyla verilen cevapları özgün sıraya çevirir. */
  toOriginal(responses: Responses): Responses;
}

const CHOICE_TYPES = new Set(['mcq', 'listen_choice', 'dialogue']);

/**
 * Alıştırmaları karıştırır.
 * - Çoktan seçmeli şıklar her zaman karıştırılır.
 * - Sıralama kartlarının parçaları her zaman karıştırılır.
 * - order=true ise soru sırası da karıştırılır (sınav ve tekrar). Bilgi kartları başta kalır.
 */
export function shuffleExercises(exercises: Exercise[], opts: { order: boolean }, rng: Rng = Math.random): ShuffledSet {
  const perms: Record<string, number[]> = {};
  const mapped = exercises.map((ex): Exercise => {
    if (CHOICE_TYPES.has(ex.type) && 'options' in ex && 'answer' in ex && typeof ex.answer === 'number') {
      const perm = permutation(ex.options.length, rng);
      perms[ex.id] = perm;
      return { ...ex, options: perm.map((i) => ex.options[i]), answer: perm.indexOf(ex.answer) } as Exercise;
    }
    if (ex.type === 'order') {
      let tiles = shuffled(ex.tiles, rng);
      // Parçalar tesadüfen doğru sırada kaldıysa bir kez daha karıştır.
      if (tiles.join(' ') === ex.tiles.join(' ') && tiles.length > 1) tiles = [...tiles.slice(1), tiles[0]];
      return { ...ex, tiles };
    }
    return ex;
  });

  let list = mapped;
  if (opts.order) {
    const lead = mapped.filter((e) => e.type === 'info');
    const rest = mapped.filter((e) => e.type !== 'info');
    list = [...lead, ...shuffled(rest, rng)];
  }

  return {
    exercises: list,
    toOriginal(responses: Responses): Responses {
      const out: Responses = { ...responses };
      for (const [id, perm] of Object.entries(perms)) {
        const v = out[id];
        if (typeof v === 'number' && v >= 0 && v < perm.length) out[id] = perm[v];
      }
      return out;
    },
  };
}

/** Seviye tespiti gibi basit sorular için: şıkları karıştırır, cevap eşlemesini döndürür. */
export function shuffleOptions<T extends { options: string[] }>(question: T, rng: Rng = Math.random): { question: T; perm: number[] } {
  const perm = permutation(question.options.length, rng);
  return { question: { ...question, options: perm.map((i) => question.options[i]) }, perm };
}
