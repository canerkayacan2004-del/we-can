// Dört AI öğretmen rolü. Davranış kuralları content/source/TEACHER_SYSTEM.md dosyasından gelir.
import type { TeacherRole } from '../packages/core/src/types.ts';

export interface Teacher {
  role: TeacherRole;
  name: string;
  titleTr: string;
  emoji: string;
  color: string;
  descTr: string;
}

export const TEACHERS: Record<TeacherRole, Teacher> = {
  grammar: {
    role: 'grammar', name: 'Grace', titleTr: 'Gramer öğretmeni', emoji: '🧩', color: 'bg-[#a46bff]/15 text-[#c4a2ff]',
    descTr: 'Grameri mantığıyla anlatır: nasıl kurulur, ne demek, ne zaman kullanılır. Türkçe konuşanların tipik hatalarına dikkat çeker.',
  },
  speaking: {
    role: 'speaking', name: 'Sam', titleTr: 'Konuşma öğretmeni', emoji: '💬', color: 'bg-[#ffb547]/15 text-[#ffc773]',
    descTr: 'Gerçek hayat senaryoları kurar ve seni konuşturur. Konuşmayı her hatada kesmez; önemli hataları sonunda topluca düzeltir.',
  },
  listening: {
    role: 'listening', name: 'Lily', titleTr: 'Dinleme ve okuma öğretmeni', emoji: '🎧', color: 'bg-[#4fb3ff]/15 text-[#86cbff]',
    descTr: 'Seviyene uygun metinler ve dinleme çalışmaları hazırlar. Vurgu, ritim ve günlük konuşmadaki kısaltmaları açıklar.',
  },
  exam: {
    role: 'exam', name: 'Max', titleTr: 'Sınav öğretmeni', emoji: '📝', color: 'bg-[#22d37a]/15 text-[#5fe3a0]',
    descTr: 'Becerileri ayrı ayrı ölçer. Sınav sırasında ipucu vermez; sonunda güçlü ve zayıf yönlerini açıklar.',
  },
};
