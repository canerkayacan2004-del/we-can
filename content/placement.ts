// Kısa seviye ön tespit soruları: her seviyeden 4 soru.
// Bu kısa bir ön tespittir; yalnızca gramer ve kelime bilgisini, metin üzerinden ölçer.
// Kapsamlı seviye tespit sınavı (okuma, dinleme, yazma dahil) sonraki sürümde eklenecek.
import type { PlacementQuestion } from '../packages/core/src/engine.ts';

export const placementQuestions: PlacementQuestion[] = [
  { id: 'p-a1-1', level: 'A1', prompt: 'She ___ from Canada.', options: ['am', 'is', 'are'], answer: 1 },
  { id: 'p-a1-2', level: 'A1', prompt: '___ you like coffee?', options: ['Do', 'Does', 'Are'], answer: 0 },
  { id: 'p-a1-3', level: 'A1', prompt: 'There ___ two bedrooms in the flat.', options: ['is', 'are', 'be'], answer: 1 },
  { id: 'p-a1-4', level: 'A1', prompt: "I get up ___ seven o'clock.", options: ['on', 'in', 'at'], answer: 2 },

  { id: 'p-a2-1', level: 'A2', prompt: 'We ___ to the cinema last night.', options: ['go', 'went', 'gone'], answer: 1 },
  { id: 'p-a2-2', level: 'A2', prompt: 'This flat is ___ than the other one.', options: ['big', 'bigger', 'biggest'], answer: 1 },
  { id: 'p-a2-3', level: 'A2', prompt: 'Listen! Someone ___ at the door.', options: ['knocks', 'is knocking', 'knock'], answer: 1 },
  { id: 'p-a2-4', level: 'A2', prompt: "You ___ smoke here. It's not allowed.", options: ["mustn't", "don't have to", "needn't"], answer: 0 },

  { id: 'p-b1-1', level: 'B1', prompt: 'I ___ here since 2020.', options: ['live', 'have lived', 'am living'], answer: 1 },
  { id: 'p-b1-2', level: 'B1', prompt: 'If it rains tomorrow, we ___ at home.', options: ['stay', 'will stay', 'would stay'], answer: 1 },
  { id: 'p-b1-3', level: 'B1', prompt: 'The building ___ in 1995.', options: ['built', 'was built', 'has built'], answer: 1 },
  { id: 'p-b1-4', level: 'B1', prompt: 'She said she ___ tired.', options: ['is being', 'was', 'be'], answer: 1 },

  { id: 'p-b2-1', level: 'B2', prompt: 'If I ___ about the meeting, I would have come.', options: ['knew', 'had known', 'have known'], answer: 1 },
  { id: 'p-b2-2', level: 'B2', prompt: "You ___ have told me earlier! Now it's too late.", options: ['should', 'must', 'will'], answer: 0 },
  { id: 'p-b2-3', level: 'B2', prompt: "We're having the kitchen ___ next week.", options: ['renovate', 'renovated', 'renovating'], answer: 1 },
  { id: 'p-b2-4', level: 'B2', prompt: 'By the end of this year, I ___ here for a decade.', options: ['will work', 'will have worked', 'am working'], answer: 1 },
];
