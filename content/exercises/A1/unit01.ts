// A1 Ünite 1 — Tanışma ve kişisel bilgiler (pilot ünite)
// Kaynak: content/source/curriculum/A1.md. Bütün cümleler ve metinler özgündür.
import type { LessonContent, VocabItem } from '../../../packages/core/src/types.ts';

export const vocabA1U1: VocabItem[] = [
  { id: 'a1u1-turkey', term: 'Turkey', meaningTr: 'Türkiye', pos: 'ülke adı', ipa: '/ˈtɜːki/', exampleEn: "I'm from Turkey.", exampleTr: 'Türkiyeliyim.', note: 'Resmî ad Türkiye; günlük İngilizcede Turkey de yaygındır.', topic: 'ülkeler' },
  { id: 'a1u1-turkish', term: 'Turkish', meaningTr: 'Türk / Türkçe', pos: 'sıfat', ipa: '/ˈtɜːkɪʃ/', exampleEn: "She's Turkish.", exampleTr: 'O Türk.', topic: 'milliyetler' },
  { id: 'a1u1-germany', term: 'Germany', meaningTr: 'Almanya', pos: 'ülke adı', ipa: '/ˈdʒɜːməni/', exampleEn: 'Hans is from Germany.', exampleTr: 'Hans Almanyalı.', topic: 'ülkeler' },
  { id: 'a1u1-german', term: 'German', meaningTr: 'Alman / Almanca', pos: 'sıfat', ipa: '/ˈdʒɜːmən/', exampleEn: "He's German.", exampleTr: 'O Alman.', topic: 'milliyetler' },
  { id: 'a1u1-spain', term: 'Spain', meaningTr: 'İspanya', pos: 'ülke adı', ipa: '/speɪn/', exampleEn: 'Elena is from Spain.', exampleTr: 'Elena İspanyalı.', topic: 'ülkeler' },
  { id: 'a1u1-spanish', term: 'Spanish', meaningTr: 'İspanyol / İspanyolca', pos: 'sıfat', ipa: '/ˈspænɪʃ/', exampleEn: 'My teacher is Spanish.', exampleTr: 'Öğretmenim İspanyol.', topic: 'milliyetler' },
  { id: 'a1u1-japan', term: 'Japan', meaningTr: 'Japonya', pos: 'ülke adı', ipa: '/dʒəˈpæn/', exampleEn: 'Kenji is from Japan.', exampleTr: 'Kenji Japonyalı.', topic: 'ülkeler' },
  { id: 'a1u1-japanese', term: 'Japanese', meaningTr: 'Japon / Japonca', pos: 'sıfat', ipa: '/ˌdʒæpəˈniːz/', exampleEn: "They're Japanese.", exampleTr: 'Onlar Japon.', topic: 'milliyetler' },
  { id: 'a1u1-teacher', term: 'teacher', meaningTr: 'öğretmen', pos: 'isim', ipa: '/ˈtiːtʃə(r)/', exampleEn: "I'm a teacher.", exampleTr: 'Öğretmenim.', topic: 'meslekler' },
  { id: 'a1u1-doctor', term: 'doctor', meaningTr: 'doktor', pos: 'isim', ipa: '/ˈdɒktə(r)/', exampleEn: 'My sister is a doctor.', exampleTr: 'Kız kardeşim doktor.', topic: 'meslekler' },
  { id: 'a1u1-engineer', term: 'engineer', meaningTr: 'mühendis', pos: 'isim', ipa: '/ˌendʒɪˈnɪə(r)/', exampleEn: "He's an engineer.", exampleTr: 'O mühendis.', note: 'Sesli harfle başladığı için "an engineer" denir.', topic: 'meslekler' },
  { id: 'a1u1-nurse', term: 'nurse', meaningTr: 'hemşire', pos: 'isim', ipa: '/nɜːs/', exampleEn: "She's a nurse.", exampleTr: 'O hemşire.', topic: 'meslekler' },
];

const readingText =
  "Hi! My name is Elena. I'm from Spain, but I live in London. I'm a nurse. " +
  "My friend Kenji is Japanese. He's an engineer. We are in the same English class. " +
  "Our teacher is Ms. Brown. She's from England.";

export const lessonsA1U1: LessonContent[] = [
  // ------------------------------------------------------------------ A1.1.1
  {
    code: 'A1.1.1',
    unitId: 'A1.1',
    teacher: 'grammar',
    mode: 'cards',
    introTr: 'Bu derste am / is / are ile kim olduğunu, nereli olduğunu ve mesleğini söylemeyi öğreneceksin.',
    exercises: [
      {
        id: 'a1u1l1-i1', type: 'info', skill: 'grammar', prompt: '', title: '"to be" nedir?',
        body: [
          'Türkçede "öğretmen-im", "Türkiyeli-sin" gibi eklerle söylediğimiz şey, İngilizcede ayrı bir kelimeyle söylenir: am, is veya are.',
          'Bu kelime atlanamaz. Türkçe düşününce en sık yapılan hata onu unutmaktır.',
        ],
        examples: [
          { en: 'I am a teacher.', tr: 'Ben öğretmenim.' },
          { en: 'She is from Turkey.', tr: 'O Türkiyeli.' },
          { en: 'We are friends.', tr: 'Biz arkadaşız.' },
        ],
      },
      {
        id: 'a1u1l1-i2', type: 'info', skill: 'grammar', prompt: '', title: 'Hangi özneyle hangisi?',
        body: [
          'I → am',
          'he / she / it → is',
          'you / we / they → are',
          'Günlük konuşmada kısaltılır: I\'m, you\'re, he\'s, she\'s, it\'s, we\'re, they\'re.',
        ],
        examples: [
          { en: "I'm Ali.", tr: 'Ben Ali.' },
          { en: "He's a doctor.", tr: 'O doktor.' },
          { en: "They're from Japan.", tr: 'Onlar Japonyalı.' },
        ],
      },
      {
        id: 'a1u1l1-i3', type: 'info', skill: 'grammar', prompt: '', title: 'Olumsuz ve soru',
        body: [
          'Olumsuz: not eklenir → I\'m not, he isn\'t, they aren\'t.',
          'Soru: am / is / are başa geçer → Are you a student?',
          'Kısa cevap: Yes, I am. / No, I\'m not. Olumlu kısa cevapta kısaltma yapılmaz ("Yes, I\'m." denmez).',
          'Mesleklerden önce a / an gelir: I am a teacher.',
        ],
        examples: [
          { en: "I'm not a nurse.", tr: 'Ben hemşire değilim.' },
          { en: 'Is she from Spain?', tr: 'O İspanyalı mı?' },
        ],
      },
      { id: 'a1u1l1-q1', type: 'mcq', skill: 'grammar', prompt: 'I ___ a student.', options: ['am', 'is', 'are'], answer: 0, explainTr: '"I" öznesiyle her zaman "am" kullanılır.' },
      { id: 'a1u1l1-q2', type: 'mcq', skill: 'grammar', prompt: 'She ___ from Italy.', options: ['am', 'is', 'are'], answer: 1, explainTr: 'he / she / it ile "is" kullanılır.' },
      { id: 'a1u1l1-q3', type: 'mcq', skill: 'grammar', prompt: 'They ___ doctors.', options: ['am', 'is', 'are'], answer: 2, explainTr: 'you / we / they ile "are" kullanılır.' },
      { id: 'a1u1l1-q4', type: 'fill', skill: 'grammar', prompt: 'Boşluğu doldur.', text: 'We ___ from Turkey.', accepted: ['are'], explainTr: '"We" çoğuldur; "are" gelir.' },
      { id: 'a1u1l1-q5', type: 'fill', skill: 'grammar', prompt: 'Boşluğu doldur.', text: 'He ___ an engineer.', accepted: ['is'], explainTr: '"He" tekil üçüncü kişidir; "is" gelir.' },
      { id: 'a1u1l1-q6', type: 'fill', skill: 'grammar', prompt: 'Cümleyi olumsuz yap.', text: "I ___ a teacher. I'm a nurse.", accepted: ['am not', "'m not"], hintTr: 'İki kelime: am + not', explainTr: 'Olumsuz için "not" eklenir: I am not / I\'m not.' },
      { id: 'a1u1l1-q7', type: 'mcq', skill: 'grammar', prompt: '___ you from Spain?', options: ['Are', 'Is', 'Am'], answer: 0, explainTr: 'Soruda fiil başa geçer: Are you…?' },
      { id: 'a1u1l1-q8', type: 'mcq', skill: 'grammar', prompt: 'En doğru kısa cevabı seç.', context: 'A: Are you a doctor?\nB: No, ___.', options: ["I'm not", "I amn't", 'I not'], answer: 0, explainTr: '"amn\'t" diye bir kısaltma yoktur; "I\'m not" denir.' },
      { id: 'a1u1l1-q9', type: 'order', skill: 'grammar', prompt: 'Kelimeleri sıraya diz: "Benim adım Ali."', tiles: ['is', 'My', 'Ali', 'name'], answer: 'My name is Ali', explainTr: 'Sıra: özne (My name) + is + ad.' },
      { id: 'a1u1l1-q10', type: 'order', skill: 'grammar', prompt: 'Kelimeleri sıraya diz: "Nerelisin?"', tiles: ['you', 'from', 'Where', 'are'], answer: 'Where are you from', explainTr: 'Soru kelimesi + are + you + from.' },
      { id: 'a1u1l1-q11', type: 'translate', skill: 'grammar', prompt: 'İngilizceye çevir.', source: 'Ben öğretmenim.', accepted: ['I am a teacher', "I'm a teacher"], explainTr: '"am" ve meslekten önce "a" unutulmamalı.' },
      { id: 'a1u1l1-q12', type: 'translate', skill: 'grammar', prompt: 'İngilizceye çevir. (she)', source: "O, Türkiye'den değil.", accepted: ['She is not from Turkey', "She isn't from Turkey", "She's not from Turkey", 'She is not from Türkiye', "She isn't from Türkiye"], explainTr: 'She + is not (isn\'t) + from Turkey.' },
      { id: 'a1u1l1-q13', type: 'mcq', skill: 'grammar', prompt: 'Hangi cümle doğru?', options: ['I teacher.', 'I am teacher.', 'I am a teacher.'], answer: 2, explainTr: 'Hem "am" hem de "a" gerekir.' },
    ],
  },

  // ------------------------------------------------------------------ A1.1.2
  {
    code: 'A1.1.2',
    unitId: 'A1.1',
    teacher: 'speaking',
    mode: 'conversation',
    introTr: 'Bu derste yeni biriyle tanışmayı çalışacaksın: adını söyle, nereli olduğunu ve ne iş yaptığını anlat, karşındakine de sor.',
    ai: {
      titleTr: 'Kursun ilk günü',
      situationTr: 'Bir İngilizce kursunun ilk günündesin. Yanındaki sırada oturan Sam seninle tanışmak istiyor.',
      teacherRoleEn: 'You are Sam, a friendly classmate on the first day of an English course. You are a nurse from Canada.',
      openingEn: "Hi! I'm Sam. What's your name?",
      goalsTr: ['Adını söyle', 'Nereli olduğunu söyle', 'Mesleğini söyle', 'Sam\'e en az iki soru sor'],
      maxTurns: 8,
    },
    exercises: [
      {
        id: 'a1u1l2-i1', type: 'info', skill: 'speaking', prompt: '', title: 'Tanışma kalıpları',
        body: ['Bu kalıplar günlük hayatta aynen böyle söylenir. Sesli tekrar etmeyi dene.'],
        examples: [
          { en: "Hi, I'm Deniz.", tr: 'Merhaba, ben Deniz.' },
          { en: 'Nice to meet you.', tr: 'Tanıştığımıza memnun oldum.' },
          { en: 'Nice to meet you too.', tr: 'Ben de memnun oldum.' },
          { en: 'Where are you from?', tr: 'Nerelisin?' },
          { en: 'What do you do?', tr: 'Ne iş yapıyorsun?' },
          { en: 'And you?', tr: 'Ya sen?' },
        ],
      },
      { id: 'a1u1l2-q1', type: 'mcq', skill: 'speaking', prompt: 'En doğal cevabı seç.', context: "Sam: Hi! I'm Sam. What's your name?", options: ['My name Ali.', "I'm Ali. Nice to meet you.", 'I Ali, nice meet you.'], answer: 1, explainTr: '"I\'m Ali" veya "My name is Ali" denir; fiil atlanmaz.' },
      { id: 'a1u1l2-q2', type: 'mcq', skill: 'speaking', prompt: 'En doğal cevabı seç.', context: 'Sam: Nice to meet you too. Where are you from?', options: ["I'm from Turkey.", 'I from Turkey.', "I'm Turkey."], answer: 0, explainTr: 'Ülke adıyla "from" kullanılır: I\'m from Turkey.' },
      {
        id: 'a1u1l2-d1', type: 'dialogue', skill: 'speaking', prompt: 'Diyaloğu tamamla.',
        lines: [
          { speaker: 'Sam', text: "Hi! I'm Sam." },
          { speaker: 'Sen', text: '___', me: true },
          { speaker: 'Sam', text: 'Nice to meet you too!' },
        ],
        options: ["Hi Sam, I'm Deniz. Nice to meet you.", 'Goodbye, Sam.', "I'm fine, thank you."],
        answer: 0,
        explainTr: 'Sam "Nice to meet you too" dediğine göre önce sen "Nice to meet you" demiş olmalısın.',
      },
      { id: 'a1u1l2-q3', type: 'order', skill: 'speaking', prompt: "Sam'e ne iş yaptığını sor.", tiles: ['do', 'What', 'you', 'do'], answer: 'What do you do', explainTr: 'Meslek sormanın en yaygın yolu: What do you do?' },
      { id: 'a1u1l2-q4', type: 'mcq', skill: 'speaking', prompt: 'En doğal cevabı seç.', context: "Sam: I'm a nurse. And you?", options: ["I'm a student.", "I'm student.", 'I a student.'], answer: 0, explainTr: 'Meslek ve öğrencilikten önce "a / an" gelir.' },
      { id: 'a1u1l2-q5', type: 'fill', skill: 'speaking', prompt: 'Boşluğu doldur.', text: 'Nice to ___ you.', accepted: ['meet'], explainTr: 'Kalıp: Nice to meet you.' },
      { id: 'a1u1l2-q6', type: 'listen', skill: 'listening', prompt: 'Dinle ve duyduğunu yaz.', audioText: 'Where are you from?', accepted: ['Where are you from'], explainTr: 'Where are you from? = Nerelisin?' },
      { id: 'a1u1l2-lc1', type: 'listen_choice', skill: 'listening', prompt: 'Dinle: Sam ne soruyor?', audioText: 'What do you do?', options: ['Ne iş yapıyorsun?', 'Nerelisin?', 'Adın ne?'], answer: 0, explainTr: '"What do you do?" meslek sorar.' },
      { id: 'a1u1l2-q7', type: 'translate', skill: 'speaking', prompt: 'İngilizceye çevir.', source: 'Tanıştığımıza memnun oldum.', accepted: ['Nice to meet you', 'Pleased to meet you', "It's nice to meet you", 'Nice meeting you'], explainTr: 'En yaygın karşılığı: Nice to meet you.' },
      { id: 'a1u1l2-q8', type: 'mcq', skill: 'speaking', prompt: 'Vedalaşırken en doğal cevabı seç.', context: 'Sam: See you tomorrow!', options: ['See you!', 'Nice to meet you.', "I'm fine."], answer: 0, explainTr: '"See you!" günlük ve doğal bir vedadır.' },
      {
        id: 'a1u1l2-w1', type: 'write', skill: 'speaking', prompt: 'Kendini en az 3 cümleyle tanıt: adın, nereli olduğun ve mesleğin.',
        minSentences: 3,
        mustInclude: [
          { anyOf: ["i'm", 'i am', 'my name is'], labelTr: 'Adını söyleyen bir cümle (I\'m … / My name is …)' },
          { anyOf: ['from'], labelTr: 'Nereli olduğun (I\'m from …)' },
        ],
        checklistTr: ['Her cümle büyük harfle başlıyor mu?', 'am / is / are unutulmadı mı?', 'Mesleğinden önce a / an kullandın mı?'],
      },
    ],
  },

  // ------------------------------------------------------------------ A1.1.3
  {
    code: 'A1.1.3',
    unitId: 'A1.1',
    teacher: 'listening',
    mode: 'cards',
    introTr: 'Bu derste ülke, milliyet ve meslek kelimelerini öğrenecek, ardından kısa bir tanıtım metni okuyacaksın.',
    vocab: vocabA1U1,
    exercises: [
      {
        id: 'a1u1l3-i1', type: 'info', skill: 'vocabulary', prompt: '', title: 'Ülke mi, milliyet mi?',
        body: [
          'Ülke adı "from" ile kullanılır: I\'m from Germany.',
          'Milliyet "from" olmadan söylenir: I\'m German.',
          'İkisi de her zaman büyük harfle başlar.',
        ],
        examples: [
          { en: "She's from Japan. She's Japanese.", tr: 'O Japonyalı. O Japon.' },
          { en: "We're from Turkey. We're Turkish.", tr: 'Biz Türkiyeliyiz. Biz Türküz.' },
        ],
      },
      { id: 'a1u1l3-f1', type: 'flashcard', skill: 'vocabulary', prompt: '', term: 'Germany', meaningTr: 'Almanya', ipa: '/ˈdʒɜːməni/', exampleEn: 'Hans is from Germany.', exampleTr: 'Hans Almanyalı.', mnemonicTr: 'Almanca "Deutschland" değil; İngilizcede "Germany" denir.' },
      { id: 'a1u1l3-f2', type: 'flashcard', skill: 'vocabulary', prompt: '', term: 'Japanese', meaningTr: 'Japon / Japonca', ipa: '/ˌdʒæpəˈniːz/', exampleEn: "Kenji is Japanese.", exampleTr: 'Kenji Japon.', mnemonicTr: 'Vurgu sonda: ja-pa-NEEZ.' },
      { id: 'a1u1l3-f3', type: 'flashcard', skill: 'vocabulary', prompt: '', term: 'engineer', meaningTr: 'mühendis', ipa: '/ˌendʒɪˈnɪə(r)/', exampleEn: "He's an engineer.", exampleTr: 'O mühendis.', mnemonicTr: '"Engine" (motor) kelimesini düşün: motorla uğraşan kişi.' },
      { id: 'a1u1l3-f4', type: 'flashcard', skill: 'vocabulary', prompt: '', term: 'nurse', meaningTr: 'hemşire', ipa: '/nɜːs/', exampleEn: "She's a nurse.", exampleTr: 'O hemşire.' },
      { id: 'a1u1l3-m1', type: 'match', skill: 'vocabulary', prompt: 'Ülkeyi milliyetiyle eşleştir.', pairs: [['Turkey', 'Turkish'], ['Germany', 'German'], ['Spain', 'Spanish'], ['Japan', 'Japanese']] },
      { id: 'a1u1l3-m2', type: 'match', skill: 'vocabulary', prompt: 'Mesleği Türkçesiyle eşleştir.', pairs: [['teacher', 'öğretmen'], ['doctor', 'doktor'], ['engineer', 'mühendis'], ['nurse', 'hemşire']] },
      { id: 'a1u1l3-q1', type: 'mcq', skill: 'vocabulary', prompt: 'Yuki is from Japan. She is ___.', options: ['Japan', 'Japanese', 'Japanish'], answer: 1, explainTr: 'Japan ülkedir; milliyeti Japanese.' },
      { id: 'a1u1l3-q2', type: 'fill', skill: 'vocabulary', prompt: 'Boşluğu doldur.', text: 'Hans is German. He is from ___.', accepted: ['Germany'], explainTr: 'German milliyettir; ülkesi Germany.' },
      { id: 'a1u1l3-q3', type: 'mcq', skill: 'grammar', prompt: 'She is ___ engineer.', options: ['a', 'an'], answer: 1, explainTr: '"engineer" sesli harfle başlar: an engineer.' },
      { id: 'a1u1l3-q4', type: 'mcq', skill: 'grammar', prompt: 'He is ___ doctor.', options: ['a', 'an'], answer: 0, explainTr: '"doctor" sessiz harfle başlar: a doctor.' },
      { id: 'a1u1l3-lc1', type: 'listen_choice', skill: 'listening', prompt: 'Dinle ve duyduğun kelimeyi seç.', audioText: 'Spanish', options: ['Spain', 'Spanish', 'Danish'], answer: 1, explainTr: 'Spanish = İspanyol. Spain ise ülkenin adı.' },
      { id: 'a1u1l3-q5', type: 'listen', skill: 'listening', prompt: 'Dinle ve duyduğunu yaz.', audioText: 'She is a nurse.', accepted: ['She is a nurse', "She's a nurse"], explainTr: 'She is a nurse. = O hemşire.' },
      { id: 'a1u1l3-r1', type: 'mcq', skill: 'reading', prompt: 'Where is Elena from?', context: readingText, options: ['Spain', 'England', 'Japan'], answer: 0, explainTr: 'Metinde "I\'m from Spain" yazıyor; Londra\'da yaşıyor ama İspanyalı.' },
      { id: 'a1u1l3-r2', type: 'mcq', skill: 'reading', prompt: "What is Elena's job?", context: readingText, options: ['teacher', 'nurse', 'engineer'], answer: 1, explainTr: 'Metin: "I\'m a nurse."' },
      { id: 'a1u1l3-r3', type: 'mcq', skill: 'reading', prompt: 'Kenji is ___.', context: readingText, options: ['Spanish', 'Japanese', 'English'], answer: 1, explainTr: 'Metin: "My friend Kenji is Japanese."' },
      { id: 'a1u1l3-r4', type: 'mcq', skill: 'reading', prompt: 'Who is an engineer?', context: readingText, options: ['Elena', 'Kenji', 'Ms. Brown'], answer: 1, explainTr: 'Metin: "He\'s an engineer." Burada "he" Kenji\'dir.' },
      { id: 'a1u1l3-tf1', type: 'truefalse', skill: 'reading', prompt: 'Metne göre doğru mu, yanlış mı?', context: readingText, statement: 'Elena lives in Spain.', answer: false, explainTr: 'Elena İspanyalı ama Londra\'da yaşıyor: "I live in London."' },
      { id: 'a1u1l3-r5', type: 'mcq', skill: 'reading', prompt: 'Ms. Brown is the ___.', context: readingText, options: ['nurse', 'teacher', 'student'], answer: 1, explainTr: 'Metin: "Our teacher is Ms. Brown."' },
    ],
  },

  // ------------------------------------------------------------------ A1.1.4
  {
    code: 'A1.1.4',
    unitId: 'A1.1',
    teacher: 'speaking',
    mode: 'conversation',
    introTr: 'Bu derste bir otel resepsiyonunda kayıt yaptıracaksın: rezervasyonunu söyle, adını hecele, sorulara cevap ver.',
    ai: {
      titleTr: 'Otelde kayıt',
      situationTr: 'Londra\'da bir otele yeni geldin. Resepsiyon görevlisi kaydını yapacak.',
      teacherRoleEn: 'You are a polite hotel receptionist in London checking in a guest. Ask for their name, ask them to spell their surname, ask where they are from, then give them the room number and key.',
      openingEn: 'Good evening. Welcome to the Park Hotel. Can I help you?',
      goalsTr: ['Rezervasyonun olduğunu söyle', 'Adını söyle ve soyadını hecele', 'Nereli olduğunu söyle', 'Teşekkür et'],
      maxTurns: 8,
    },
    exercises: [
      {
        id: 'a1u1l4-i1', type: 'info', skill: 'speaking', prompt: '', title: 'Otelde kayıt kalıpları',
        body: ['Resepsiyonda en çok bu cümleleri duyar ve söylersin.'],
        examples: [
          { en: 'I have a reservation.', tr: 'Rezervasyonum var.' },
          { en: 'Can you spell your name, please?', tr: 'Adınızı heceler misiniz?' },
          { en: 'Your room is on the second floor.', tr: 'Odanız ikinci katta.' },
          { en: "Here's your key.", tr: 'Buyurun anahtarınız.' },
        ],
      },
      {
        id: 'a1u1l4-i2', type: 'info', skill: 'speaking', prompt: '', title: 'Adını hecelemek',
        body: [
          'Heceleme harf harf yapılır: K-A-Y-A.',
          'Türkçe konuşanların en çok karıştırdığı harfler: A "ey", E "i", I "ay" diye okunur.',
          'G "ci", J "cey", H "eyç", Y "vay", W "dabılyu" diye okunur.',
        ],
        examples: [{ en: 'K-A-Y-A', tr: '"key - ey - vay - ey"' }],
      },
      { id: 'a1u1l4-q1', type: 'mcq', skill: 'speaking', prompt: 'En doğal cevabı seç.', context: 'Receptionist: Good evening. Can I help you?', options: ['Yes, I have a reservation.', 'Yes, I am reservation.', "I'm fine, thanks."], answer: 0, explainTr: '"I have a reservation" = Rezervasyonum var.' },
      { id: 'a1u1l4-q2', type: 'mcq', skill: 'speaking', prompt: 'En doğal cevabı seç.', context: "Receptionist: What's your name, please?", options: ["My name's Deniz Kaya.", "I'm from Deniz Kaya.", 'Name Deniz Kaya.'], answer: 0, explainTr: '"My name\'s …" veya "I\'m …" denir.' },
      { id: 'a1u1l4-q3', type: 'mcq', skill: 'speaking', prompt: 'En doğru cevabı seç.', context: 'Receptionist: Can you spell your surname, please?', options: ['K-A-Y-A.', 'Yes, I can.', "I'm Kaya."], answer: 0, explainTr: '"spell" hecelemek demektir; harfleri tek tek söylersin.' },
      { id: 'a1u1l4-q4', type: 'listen', skill: 'listening', prompt: 'Dinle ve duyduğunu yaz.', audioText: 'Can you spell your name, please?', accepted: ['Can you spell your name please'], explainTr: 'Can you spell your name, please? = Adınızı heceler misiniz?' },
      { id: 'a1u1l4-q5', type: 'mcq', skill: 'speaking', prompt: 'En doğal cevabı seç.', context: 'Receptionist: Where are you from?', options: ["I'm from Turkey.", "I'm Turkey.", 'I from Turkish.'], answer: 0, explainTr: 'I\'m from + ülke adı.' },
      {
        id: 'a1u1l4-d1', type: 'dialogue', skill: 'speaking', prompt: 'Resepsiyondaki diyaloğu tamamla.',
        lines: [
          { speaker: 'Resepsiyon', text: 'Can you spell your surname, please?' },
          { speaker: 'Sen', text: 'Sure. K-A-Y-A.', me: true },
          { speaker: 'Resepsiyon', text: 'Thank you. Where are you from?' },
          { speaker: 'Sen', text: '___', me: true },
        ],
        options: ["I'm from Turkey.", 'Yes, I am.', 'Room 204, please.'],
        answer: 0,
        explainTr: '"Where are you from?" sorusu ülke ister: I\'m from Turkey.',
      },
      { id: 'a1u1l4-q6', type: 'order', skill: 'speaking', prompt: 'Kelimeleri sıraya diz: "Rezervasyonum var."', tiles: ['reservation', 'I', 'a', 'have'], answer: 'I have a reservation', explainTr: 'I + have + a reservation.' },
      { id: 'a1u1l4-q7', type: 'fill', skill: 'grammar', prompt: 'Boşluğu doldur.', text: 'Your room ___ on the second floor.', accepted: ['is'], explainTr: '"Your room" tekildir; "is" gelir.' },
      { id: 'a1u1l4-q8', type: 'translate', skill: 'speaking', prompt: 'İngilizceye çevir.', source: 'Rezervasyonum var.', accepted: ['I have a reservation', "I've got a reservation", 'I have got a reservation'], explainTr: 'I have a reservation.' },
      { id: 'a1u1l4-m1', type: 'match', skill: 'reading', prompt: 'Kayıt formundaki alanı uygun bilgiyle eşleştir.', pairs: [['First name', 'Deniz'], ['Surname', 'Kaya'], ['Nationality', 'Turkish'], ['Phone number', '0555 123 45 67'], ['Email', 'deniz@example.com']] },
      {
        id: 'a1u1l4-w1', type: 'write', skill: 'writing', prompt: 'Resepsiyon görevlisine en az 3 cümle yaz: adın, nereli olduğun ve rezervasyonun olduğu.',
        minSentences: 3,
        mustInclude: [
          { anyOf: ["i'm", 'i am', 'my name is', "my name's"], labelTr: 'Adını söyleyen bir cümle' },
          { anyOf: ['from'], labelTr: 'Nereli olduğun (I\'m from …)' },
          { anyOf: ['reservation'], labelTr: 'Rezervasyonun olduğu (I have a reservation.)' },
        ],
        checklistTr: ['Selamlama ile başladın mı? (Good evening. / Hello.)', 'am / is / are unutulmadı mı?', 'Kibar bir kapanış var mı? (Thank you.)'],
      },
    ],
  },

  // ------------------------------------------------------------------ A1.1.5
  {
    code: 'A1.1.5',
    unitId: 'A1.1',
    teacher: 'exam',
    mode: 'exam',
    introTr: 'Ünite değerlendirmesi: 10 soruluk mini sınav ve ünite görevi. Sınav sırasında ipucu ve düzeltme yoktur; sonuçlar en sonda gösterilir. Geçmek için %80 gerekir.',
    exercises: [
      { id: 'a1u1l5-q1', type: 'mcq', skill: 'grammar', prompt: 'My sister ___ a doctor.', options: ['am', 'is', 'are'], answer: 1, explainTr: '"My sister" = she → is.' },
      { id: 'a1u1l5-q2', type: 'mcq', skill: 'grammar', prompt: '___ they from Germany?', options: ['Is', 'Am', 'Are'], answer: 2, explainTr: '"they" ile soru: Are they…?' },
      { id: 'a1u1l5-q3', type: 'fill', skill: 'grammar', prompt: 'Boşluğu doldur.', text: 'I ___ from Turkey.', accepted: ['am', "'m"], explainTr: '"I" ile "am" kullanılır.' },
      { id: 'a1u1l5-q4', type: 'mcq', skill: 'grammar', prompt: "He ___ a teacher. He's an engineer.", options: ["isn't", "aren't", 'am not'], answer: 0, explainTr: '"He" ile olumsuz: isn\'t.' },
      { id: 'a1u1l5-q5', type: 'mcq', skill: 'vocabulary', prompt: "Maria is from Spain. She's ___.", options: ['Spain', 'Spanish', 'Spainish'], answer: 1, explainTr: 'Spain ülkedir; milliyeti Spanish.' },
      { id: 'a1u1l5-q6', type: 'mcq', skill: 'grammar', prompt: 'She is ___ nurse.', options: ['a', 'an', '(boş)'], answer: 0, explainTr: 'Meslekten önce a / an gelir; "nurse" sessiz harfle başlar.' },
      { id: 'a1u1l5-q7', type: 'order', skill: 'speaking', prompt: 'Kelimeleri sıraya diz: "Tanıştığımıza memnun oldum."', tiles: ['meet', 'Nice', 'you', 'to'], answer: 'Nice to meet you', explainTr: 'Kalıp: Nice to meet you.' },
      { id: 'a1u1l5-q8', type: 'translate', skill: 'speaking', prompt: 'İngilizceye çevir.', source: 'Nerelisin?', accepted: ['Where are you from'], explainTr: 'Where are you from?' },
      { id: 'a1u1l5-q9', type: 'listen', skill: 'listening', prompt: 'Dinle ve duyduğunu yaz.', audioText: "What's your name?", accepted: ["What's your name", 'What is your name'], explainTr: "What's your name? = Adın ne?" },
      { id: 'a1u1l5-q10', type: 'mcq', skill: 'grammar', prompt: 'En doğru kısa cevabı seç.', context: 'A: Are you a student?\nB: ___', options: ['Yes, I am.', "Yes, I'm.", 'Yes, I is.'], answer: 0, explainTr: 'Olumlu kısa cevapta kısaltma yapılmaz: Yes, I am.' },
      {
        id: 'a1u1l5-w1', type: 'write', skill: 'writing', prompt: 'Ünite görevi: Kendini 5 cümleyle tanıt ve karşındakine 3 soru sor.',
        minSentences: 8,
        mustInclude: [
          { anyOf: ["i'm", 'i am', 'my name is', "my name's"], labelTr: 'Adını söyleyen bir cümle' },
          { anyOf: ['from'], labelTr: 'Nereli olduğun' },
          { anyOf: ['are you', 'what is your', "what's your", 'where are', 'do you', 'is your'], labelTr: 'Karşındakine sorular (Where are you from? / What do you do? …)' },
        ],
        checklistTr: ['5 tanıtım cümlesi ve 3 soru var mı?', 'Mesleğinden önce a / an kullandın mı?', 'Sorular soru işaretiyle bitiyor mu?'],
      },
    ],
  },
];
