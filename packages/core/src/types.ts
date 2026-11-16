// We Can çekirdek veri tipleri.
// Bu klasördeki kod hem masaüstü istemcide hem de sunucu fonksiyonlarında kullanılacak
// şekilde saf TypeScript olarak yazılmıştır (tarayıcıya veya Node'a özel hiçbir şey içermez).

export type LevelCode = 'A1' | 'A2' | 'B1' | 'B2';
export const LEVELS: LevelCode[] = ['A1', 'A2', 'B1', 'B2'];

export type Skill = 'grammar' | 'vocabulary' | 'reading' | 'listening' | 'writing' | 'speaking';
export const SKILLS: Skill[] = ['listening', 'reading', 'speaking', 'writing', 'grammar', 'vocabulary'];
export type LessonKind = 'grammar' | 'speaking' | 'vocab' | 'scenario' | 'exam';
export type TeacherRole = 'grammar' | 'speaking' | 'listening' | 'exam';

// ---- Müfredat ----
export interface LessonMeta {
  code: string; // örn. "A1.1.3"
  number: number;
  kind: LessonKind;
  title: string;
  goal: string;
  outcome: string;
}

export interface UnitMeta {
  id: string; // örn. "A1.1"
  level: LevelCode;
  number: number;
  title: string;
  scenario: string;
  grammar: string;
  vocab: string;
  unitTask: string;
  lessons: LessonMeta[];
}

export interface LevelMeta {
  code: LevelCode;
  name: string;
  summary: string;
  units: UnitMeta[];
}

export interface Curriculum {
  levels: LevelMeta[];
}

// ---- Alıştırmalar ----
interface ExerciseBase {
  id: string;
  skill: Skill;
  prompt: string;
  /** Sorunun üstünde gösterilen okuma metni veya diyalog. */
  context?: string;
  hintTr?: string;
  explainTr?: string;
}

/** Konu anlatım kartı (puanlanmaz). */
export interface InfoCard extends ExerciseBase {
  type: 'info';
  title: string;
  body: string[];
  examples?: { en: string; tr: string }[];
}
/** Yeni kelime tanıtım kartı (puanlanmaz; Memrise tarzı). */
export interface FlashcardExercise extends ExerciseBase {
  type: 'flashcard';
  term: string;
  meaningTr: string;
  ipa?: string;
  exampleEn: string;
  exampleTr: string;
  mnemonicTr?: string;
}
export interface McqExercise extends ExerciseBase {
  type: 'mcq';
  options: string[];
  answer: number;
}
/** Dinle ve doğru seçeneği seç. */
export interface ListenChoiceExercise extends ExerciseBase {
  type: 'listen_choice';
  audioText: string;
  options: string[];
  answer: number;
}
/** Diyalogdaki eksik repliği seç (Babbel tarzı). Eksik satırın metni "___" olur. */
export interface DialogueExercise extends ExerciseBase {
  type: 'dialogue';
  lines: { speaker: string; text: string; me?: boolean }[];
  options: string[];
  answer: number;
}
/** Doğru / yanlış. Cevap: 1 = doğru, 0 = yanlış. */
export interface TrueFalseExercise extends ExerciseBase {
  type: 'truefalse';
  statement: string;
  answer: boolean;
}
export interface FillExercise extends ExerciseBase {
  type: 'fill';
  /** Boşluk "___" ile gösterilir. */
  text: string;
  accepted: string[];
}
export interface OrderExercise extends ExerciseBase {
  type: 'order';
  tiles: string[];
  answer: string;
  altAnswers?: string[];
}
export interface MatchExercise extends ExerciseBase {
  type: 'match';
  pairs: [string, string][];
}
export interface TranslateExercise extends ExerciseBase {
  type: 'translate';
  source: string;
  accepted: string[];
}
export interface ListenExercise extends ExerciseBase {
  type: 'listen';
  audioText: string;
  accepted: string[];
}
export interface WriteExercise extends ExerciseBase {
  type: 'write';
  minSentences: number;
  mustInclude?: { anyOf: string[]; labelTr: string }[];
  checklistTr: string[];
}

export type Exercise =
  | InfoCard
  | FlashcardExercise
  | McqExercise
  | ListenChoiceExercise
  | DialogueExercise
  | TrueFalseExercise
  | FillExercise
  | OrderExercise
  | MatchExercise
  | TranslateExercise
  | ListenExercise
  | WriteExercise;

export type ResponseValue = number | string | { mistakes: number } | null | undefined;
export type Responses = Record<string, ResponseValue>;

export interface VocabItem {
  id: string;
  term: string;
  meaningTr: string;
  pos: string;
  ipa?: string;
  exampleEn: string;
  exampleTr: string;
  note?: string;
  topic?: string;
}

export interface AiScenario {
  titleTr: string;
  situationTr: string;
  teacherRoleEn: string;
  openingEn: string;
  goalsTr: string[];
  maxTurns: number;
}

export interface LessonContent {
  code: string;
  unitId: string;
  teacher: TeacherRole;
  mode: 'cards' | 'conversation' | 'exam';
  introTr: string;
  exercises: Exercise[];
  vocab?: VocabItem[];
  ai?: AiScenario;
}

// ---- Kişiselleştirme ----
export interface Appearance {
  /** Tema kimliği (uygulama tarafında tanımlıdır). */
  theme: string;
  /** Vurgu rengi (#rrggbb). null ise temanın kendi rengi kullanılır. */
  accent: string | null;
  /** Yazı ve arayüz ölçeği: 0.9 – 1.2 */
  scale: number;
  motion: boolean;
  sound: boolean;
  /** Ana panoda görünen bölümler. */
  dashboard: string[];
}

export const DASHBOARD_WIDGETS = [
  'skills', 'weekly', 'continue', 'words', 'ai', 'rewards',
  'planner', 'revision', 'analytics', 'notebook', 'audio', 'achievements',
] as const;

export const DEFAULT_APPEARANCE: Appearance = {
  theme: 'neon',
  accent: null,
  scale: 1,
  motion: true,
  sound: true,
  dashboard: ['skills', 'weekly', 'continue', 'words', 'ai', 'rewards', 'planner'],
};

// ---- Kullanıcı durumu ----
export type StudyTime = 'morning' | 'noon' | 'evening' | 'night' | 'flexible';
export const STUDY_TIMES: readonly StudyTime[] = ['morning', 'noon', 'evening', 'night', 'flexible'];

export interface Profile {
  displayName: string;
  goal: string;
  dailyMinutes: number;
  /** İngilizce öğrenme konuları (iş, seyahat, emlak…) */
  interests: string[];
  /** Kişisel hobiler (müzik, oyun, spor…) — örnekler ve AI dersleri buna göre seçilir. */
  hobbies: string[];
  /** Çalışma günleri: 0 = Pazartesi … 6 = Pazar */
  studyDays: number[];
  /** Tercih edilen çalışma zamanı */
  studyTime: StudyTime;
  /** Profil fotoğrafı (küçültülmüş JPEG, data URL). Yoksa baş harf gösterilir. */
  avatar?: string | null;
  onboardingDone: boolean;
  placementDone: boolean;
  placementLevel: LevelCode | null;
  plan: 'free' | 'premium';
  createdAt: string;
  appearance: Appearance;
}

export interface LessonProgress {
  status: 'completed' | 'failed';
  bestScore: number;
  attempts: number;
  completedAt?: string;
}

export type UnitStatus = 'passed' | 'reinforce' | 'failed' | 'skipped';
export interface UnitProgress {
  status: UnitStatus;
  examScore?: number;
}

export interface ReviewItem {
  id: string;
  kind: 'vocab' | 'mistake';
  front: string;
  back: string;
  extra?: string;
  /** SRS basamağı: 0..4 → 1, 3, 7, 14, 30 gün */
  step: number;
  due: string; // YYYY-MM-DD
  status: 'active' | 'learned';
  lastResult?: ReviewResult;
  lastReviewedAt?: string;
  createdAt: string;
}
export type ReviewResult = 'know' | 'hard' | 'dont';

export interface QuestProgress {
  code: string;
  progress: number;
  target: number;
  done: boolean;
}

export interface AttemptLog {
  lessonCode: string;
  at: string;
  score: number;
  correct: number;
  total: number;
  xp: number;
  seconds?: number;
}

/** Günlük çalışma özeti. */
export interface DayLog {
  seconds: number;
  xp: number;
  lessons: number;
  reviews: number;
  practice: number;
  audio: number;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  tag: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserState {
  version: 2;
  /** 0.3 tasarım geçişi yapıldı mı */
  designV3?: boolean;
  profile: Profile;
  stats: { totalXp: number; streak: number; longestStreak: number; lastActiveDate: string | null };
  lessons: Record<string, LessonProgress>;
  units: Record<string, UnitProgress>;
  xpEvents: { at: string; amount: number; reason: string; ref: string }[];
  reviews: ReviewItem[];
  vocab: Record<string, { addedAt: string; note?: string }>;
  badges: Record<string, string>;
  quests: { date: string; items: QuestProgress[] };
  ai: { date: string; conversation: number; writing: number };
  attempts: AttemptLog[];
  study: Record<string, DayLog>;
  skills: Record<Skill, { correct: number; total: number }>;
  notes: Note[];
  lastLesson: string | null;
}

export interface ExerciseResult {
  id: string;
  correct: boolean;
  expected: string;
  given: string;
  prompt: string;
  explainTr?: string;
  skill: Skill;
}

export interface LessonResult {
  lessonCode: string;
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  firstCompletion: boolean;
  xp: number;
  questXp: number;
  streak: number;
  seconds: number;
  details: ExerciseResult[];
  newBadges: string[];
  questsCompleted: string[];
  vocabAdded: number;
  unit?: { id: string; status: UnitStatus; score: number };
}

export interface PracticeResult {
  score: number;
  correct: number;
  total: number;
  xp: number;
  seconds: number;
  details: ExerciseResult[];
  newBadges: string[];
  questsCompleted: string[];
}
