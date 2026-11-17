// İş görüşmesi provaları: AI öğretmenle yazılı mülakat rol yapma senaryoları.
// Ders haritasına bağlı değildir; AI öğretmen ekranında "Mülakat provası" başlığı altında açılır.
import type { AiScenario, LevelCode } from '../packages/core/src/types.ts';

export interface InterviewScenario { code: string; level: LevelCode; emoji: string; packId: string; ai: AiScenario }

export const INTERVIEW_SCENARIOS: InterviewScenario[] = [
  {
    code: 'INT.airline', level: 'B1', emoji: '✈️', packId: 'pack:interview-airline',
    ai: {
      titleTr: 'Havayolu mülakatı',
      situationTr: 'Bir havayolunun yer hizmetleri / kabin ekibi alımı için İngilizce mülakattasın. Karşında işe alım uzmanı Ms. Carter var.',
      teacherRoleEn: 'You are Ms. Carter, a polite, professional recruiter at an international airline, interviewing a candidate for a customer-facing role (ground staff or cabin crew). Ask one typical interview question at a time: motivation for joining the airline, customer service, handling an angry passenger, teamwork, shift work and stress, and what to do when a flight is delayed. React briefly to each answer before asking the next question. If an answer is very short, ask one follow-up question for an example.',
      openingEn: 'Good morning, and thank you for coming in. I\'m Ms. Carter from the recruitment team. To start, could you tell me a little about yourself?',
      goalsTr: ['Kendini kısaca tanıt', 'Bu havayolunda neden çalışmak istediğini anlat', 'Zor bir yolcuyla nasıl ilgileneceğini açıkla', 'Vardiyalı çalışma ve stres sorularını cevapla', 'Sonunda sen de bir soru sor'],
      maxTurns: 10,
    },
  },
  {
    code: 'INT.tv', level: 'B1', emoji: '🎬', packId: 'pack:interview-tv',
    ai: {
      titleTr: 'TV kanalı mülakatı',
      situationTr: 'Bir televizyon kanalının yapım / post prodüksiyon ekibi için İngilizce mülakattasın. Karşında yapım müdürü Mr. Hayes var.',
      teacherRoleEn: 'You are Mr. Hayes, a friendly but busy production manager at a TV channel, interviewing a candidate for a junior role in production or post-production. Ask one typical interview question at a time: why television, experience and internships, editing software and skills, working under tight deadlines, what to do if something goes wrong during a live broadcast, and a project the candidate is proud of. React briefly to each answer before asking the next question. If an answer is very short, ask one follow-up question for an example.',
      openingEn: 'Hi, thanks for coming in. I\'m Mr. Hayes, the production manager. So, tell me a bit about yourself and why you want to work in television.',
      goalsTr: ['Kendini ve eğitimini tanıt', 'Staj ve kurgu deneyimini anlat', 'Kullandığın programlardan bahset', 'Baskı altında ve canlı yayında nasıl çalıştığını açıkla', 'Sonunda sen de bir soru sor'],
      maxTurns: 10,
    },
  },
];
