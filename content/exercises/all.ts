// Ünite tanımlarından üretilen bütün dersler.
import type { LessonContent, VocabItem } from '../../packages/core/src/types.ts';
import { buildUnit, buildVocab } from './gen.ts';
import type { UnitSpec } from './gen.ts';
import { A1_SPECS } from './specs/A1.ts';
import { A2_SPECS } from './specs/A2.ts';

export const ALL_SPECS: UnitSpec[] = [...A1_SPECS, ...A2_SPECS];
export const GENERATED_LESSONS: LessonContent[] = ALL_SPECS.flatMap(buildUnit);
export const GENERATED_VOCAB: VocabItem[] = ALL_SPECS.flatMap(buildVocab);
