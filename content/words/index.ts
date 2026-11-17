// A1–C2 kelime bankası: günlük 10 kelime buradan seçilir.
import type { CefrLevel, VocabItem } from '../../packages/core/src/types.ts';
import { A1_WORDS, A2_WORDS, B1_WORDS } from './bank-a.ts';
import type { WordRow } from './bank-a.ts';
import { B2_WORDS, C1_WORDS, C2_WORDS } from './bank-b.ts';
import { A1_MORE, A2_MORE, B1_MORE, B2_MORE, C1_MORE, C2_MORE } from './bank-c.ts';

export interface BankWord extends VocabItem {
  level: CefrLevel;
}

function slug(term: string): string {
  return term.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function rows(level: CefrLevel, list: WordRow[]): BankWord[] {
  return list.map(([term, meaningTr, pos, exampleEn, exampleTr]) => ({
    id: `w:${level}:${slug(term)}`, term, meaningTr, pos, exampleEn, exampleTr, level, topic: 'Günlük kelime',
  }));
}

export const WORD_BANK: BankWord[] = [
  ...rows('A1', [...A1_WORDS, ...A1_MORE]), ...rows('A2', [...A2_WORDS, ...A2_MORE]), ...rows('B1', [...B1_WORDS, ...B1_MORE]),
  ...rows('B2', [...B2_WORDS, ...B2_MORE]), ...rows('C1', [...C1_WORDS, ...C1_MORE]), ...rows('C2', [...C2_WORDS, ...C2_MORE]),
];

const BY_ID = new Map(WORD_BANK.map((w) => [w.id, w]));
export function bankWord(id: string): BankWord | undefined {
  return BY_ID.get(id);
}
