// A1 Ünite 2 — Ailem ve eşyalarım
// Kaynak: content/source/curriculum/A1.md. Bütün cümleler ve metinler özgündür.
import type { LessonContent, VocabItem } from '../../../packages/core/src/types.ts';

export const vocabA1U2: VocabItem[] = [
  { id: 'a1u2-mother', term: 'mother', meaningTr: 'anne', pos: 'isim', ipa: '/ˈmʌðə(r)/', exampleEn: 'My mother is a teacher.', exampleTr: 'Annem öğretmen.', note: 'Günlük konuşmada "mum" (İngiltere) veya "mom" (ABD) da denir.', topic: 'aile' },
  { id: 'a1u2-father', term: 'father', meaningTr: 'baba', pos: 'isim', ipa: '/ˈfɑːðə(r)/', exampleEn: 'His father is from Izmir.', exampleTr: 'Babası İzmirli.', note: 'Günlük konuşmada "dad".', topic: 'aile' },
  { id: 'a1u2-sister', term: 'sister', meaningTr: 'kız kardeş / abla', pos: 'isim', ipa: '/ˈsɪstə(r)/', exampleEn: "I've got two sisters.", exampleTr: 'İki kız kardeşim var.', note: 'İngilizcede abla / kız kardeş ayrımı yoktur; gerekirse "older sister" denir.', topic: 'aile' },
  { id: 'a1u2-brother', term: 'brother', meaningTr: 'erkek kardeş / ağabey', pos: 'isim', ipa: '/ˈbrʌðə(r)/', exampleEn: 'My brother is twenty.', exampleTr: 'Erkek kardeşim yirmi yaşında.', topic: 'aile' },
  { id: 'a1u2-son', term: 'son', meaningTr: 'oğul', pos: 'isim', ipa: '/sʌn/', exampleEn: 'They have got a son.', exampleTr: 'Onların bir oğlu var.', note: '"sun" (güneş) ile aynı okunur.', topic: 'aile' },
  { id: 'a1u2-daughter', term: 'daughter', meaningTr: 'kız evlat', pos: 'isim', ipa: '/ˈdɔːtə(r)/', exampleEn: 'Her daughter is a doctor.', exampleTr: 'Kızı doktor.', note: '"gh" okunmaz: DOR-tır.', topic: 'aile' },
  { id: 'a1u2-wife', term: 'wife', meaningTr: 'eş (kadın)', pos: 'isim', ipa: '/waɪf/', exampleEn: 'This is my wife, Selin.', exampleTr: 'Bu eşim Selin.', topic: 'aile' },
  { id: 'a1u2-husband', term: 'husband', meaningTr: 'eş (erkek)', pos: 'isim', ipa: '/ˈhʌzbənd/', exampleEn: 'Her husband is an engineer.', exampleTr: 'Kocası mühendis.', topic: 'aile' },
  { id: 'a1u2-phone', term: 'phone', meaningTr: 'telefon', pos: 'isim', ipa: '/fəʊn/', exampleEn: 'Is this your phone?', exampleTr: 'Bu senin telefonun mu?', topic: 'eşyalar' },
  { id: 'a1u2-keys', term: 'keys', meaningTr: 'anahtarlar', pos: 'isim (çoğul)', ipa: '/kiːz/', exampleEn: 'These are my keys.', exampleTr: 'Bunlar benim anahtarlarım.', topic: 'eşyalar' },
  { id: 'a1u2-bag', term: 'bag', meaningTr: 'çanta', pos: 'isim', ipa: '/bæɡ/', exampleEn: "That's my sister's bag.", exampleTr: 'O, kız kardeşimin çantası.', topic: 'eşyalar' },
  { id: 'a1u2-red', term: 'red', meaningTr: 'kırmızı', pos: 'sıfat', ipa: '/red/', exampleEn: "I've got a red car.", exampleTr: 'Kırmızı bir arabam var.', note: 'Renk ismin önüne gelir: a red car.', topic: 'renkler' },
  { id: 'a1u2-blue', term: 'blue', meaningTr: 'mavi', pos: 'sıfat', ipa: '/bluː/', exampleEn: 'Her bag is blue.', exampleTr: 'Onun çantası mavi.', topic: 'renkler' },
  { id: 'a1u2-black', term: 'black', meaningTr: 'siyah', pos: 'sıfat', ipa: '/blæk/', exampleEn: 'My phone is black.', exampleTr: 'Telefonum siyah.', topic: 'renkler' },
];

const familyText =
  "Hello! I'm Mert. I've got a big family. My father is a doctor and my mother is a teacher. " +
  "I've got one sister and two brothers. My sister's name is Elif. She's a nurse. " +
  "My brothers are students. We've got a cat. Its name is Duman.";

export const lessonsA1U2: LessonContent[] = [
  // ------------------------------------------------------------------ A1.2.1
  {
    code: 'A1.2.1',
    unitId: 'A1.2',
    teacher: 'grammar',
    mode: 'cards',
    introTr: 'Bu derste sahiplik bildirmeyi öğreneceksin: have got / has got, my / your / his / her, ismin sonuna gelen \'s ve this / that / these / those.',
    exercises: [
      {
        id: 'a1u2l1-i1', type: 'info', skill: 'grammar', prompt: '', title: 'have got / has got',
        body: [
          'Sahip olduğun şeyleri ve aileni anlatırken "have got" kullanılır. Türkçedeki "var" gibi düşün: İki kardeşim var.',
          'I / you / we / they → have got (\'ve got)',
          'he / she / it → has got (\'s got)',
          'Olumsuz: haven\'t got / hasn\'t got. Soru: Have you got…? / Has she got…?',
          'Amerikan İngilizcesinde daha çok "I have a…" denir; ikisi de doğrudur.',
        ],
        examples: [
          { en: "I've got two brothers.", tr: 'İki erkek kardeşim var.' },
          { en: "She's got a red car.", tr: 'Onun kırmızı bir arabası var.' },
          { en: 'Have you got a pen?', tr: 'Kalemin var mı?' },
        ],
      },
      {
        id: 'a1u2l1-i2', type: 'info', skill: 'grammar', prompt: '', title: "my, your, his, her ve 's",
        body: [
          'Türkçede ekle söylediğimiz sahipliği İngilizcede ismin önüne gelen kelimeler gösterir: my (benim), your (senin / sizin), his (onun, erkek), her (onun, kadın), its (onun, eşya veya hayvan), our (bizim), their (onların).',
          'Bir kişinin bir şeyi: isim + \'s → Ali\'s phone (Ali\'nin telefonu), my sister\'s bag (kız kardeşimin çantası).',
          'Dikkat: "his" ve "her" ayrımı Türkçede yoktur. Sahip olan kişinin cinsiyetine bakılır.',
        ],
        examples: [
          { en: 'This is my mother.', tr: 'Bu benim annem.' },
          { en: "That's Ali's phone.", tr: 'O, Ali\'nin telefonu.' },
          { en: 'Her name is Selin.', tr: 'Onun adı Selin.' },
        ],
      },
      {
        id: 'a1u2l1-i3', type: 'info', skill: 'grammar', prompt: '', title: 'this, that, these, those',
        body: [
          'Yakındaki tek şey: this (bu). Uzaktaki tek şey: that (şu / o).',
          'Yakındaki birden fazla şey: these (bunlar). Uzaktaki birden fazla şey: those (şunlar).',
          'Çoğulla birlikte fiil de çoğul olur: These are my keys.',
        ],
        examples: [
          { en: 'This is my bag.', tr: 'Bu benim çantam.' },
          { en: 'Those are her keys.', tr: 'Şunlar onun anahtarları.' },
        ],
      },
      { id: 'a1u2l1-q1', type: 'mcq', skill: 'grammar', prompt: 'I ___ got two sisters.', options: ['have', 'has', 'am'], answer: 0, explainTr: '"I" ile "have got" kullanılır.' },
      { id: 'a1u2l1-q2', type: 'mcq', skill: 'grammar', prompt: 'My brother ___ got a new phone.', options: ['have', 'has', 'is'], answer: 1, explainTr: '"My brother" = he → has got.' },
      { id: 'a1u2l1-q3', type: 'fill', skill: 'grammar', prompt: 'Boşluğu doldur.', text: '___ you got a car?', accepted: ['Have'], explainTr: 'Soru: Have + you + got…?' },
      { id: 'a1u2l1-q4', type: 'mcq', skill: 'grammar', prompt: 'This is Ayşe. ___ husband is an engineer.', options: ['His', 'Her', 'Its'], answer: 1, explainTr: 'Sahip olan Ayşe (kadın) → her.' },
      { id: 'a1u2l1-q5', type: 'mcq', skill: 'grammar', prompt: 'This is Kerem. ___ sister is a nurse.', options: ['His', 'Her', 'Their'], answer: 0, explainTr: 'Sahip olan Kerem (erkek) → his.' },
      { id: 'a1u2l1-q6', type: 'fill', skill: 'grammar', prompt: 'Boşluğu doldur: "Bunlar benim anahtarlarım."', text: '___ are my keys.', accepted: ['These'], explainTr: 'Yakındaki birden fazla şey → these.' },
      { id: 'a1u2l1-q7', type: 'mcq', skill: 'grammar', prompt: 'Uzaktaki tek bir çanta için hangisi?', options: ['this bag', 'that bag', 'those bag'], answer: 1, explainTr: 'Uzak ve tekil → that.' },
      { id: 'a1u2l1-q8', type: 'order', skill: 'grammar', prompt: 'Sırala: "Bu, Ali\'nin telefonu."', tiles: ["Ali's", 'is', 'phone', 'This'], answer: "This is Ali's phone", explainTr: 'Sahiplik: Ali\'s + phone.' },
      { id: 'a1u2l1-q9', type: 'fill', skill: 'grammar', prompt: 'Cümleyi olumsuz yap.', text: "She ___ got a bike.", accepted: ["hasn't", 'has not'], explainTr: 'he / she ile olumsuz: hasn\'t got.' },
      { id: 'a1u2l1-q10', type: 'translate', skill: 'grammar', prompt: 'İngilizceye çevir.', source: 'Bir erkek kardeşim var.', accepted: ["I've got a brother", 'I have got a brother', 'I have a brother', "I've got one brother", 'I have one brother', 'I have got one brother'], explainTr: 'I\'ve got a brother. (veya I have a brother.)' },
      { id: 'a1u2l1-q11', type: 'mcq', skill: 'grammar', prompt: 'Hangi cümle doğru?', options: ['Those is my shoes.', 'Those are my shoes.', 'That are my shoes.'], answer: 1, explainTr: 'those (çoğul) + are.' },
      { id: 'a1u2l1-tf1', type: 'truefalse', skill: 'grammar', prompt: 'Bu cümle doğru mu?', statement: 'My parents has got a house in Bursa.', answer: false, explainTr: '"My parents" çoğuldur → have got: My parents have got a house in Bursa.' },
    ],
  },

  // ------------------------------------------------------------------ A1.2.2
  {
    code: 'A1.2.2',
    unitId: 'A1.2',
    teacher: 'speaking',
    mode: 'conversation',
    introTr: 'Bu derste ailenden söz etmeyi ve karşındakinin ailesini sormayı çalışacaksın.',
    ai: {
      titleTr: 'Aileler hakkında sohbet',
      situationTr: 'Bir kafede yeni tanıştığın Emma ile sohbet ediyorsun. Emma ailesinden söz ediyor ve seninkini merak ediyor.',
      teacherRoleEn: 'You are Emma, a friendly woman from Manchester. You have got one brother and a dog. Ask the learner simple questions about their family.',
      openingEn: "So, tell me about your family. Have you got any brothers or sisters?",
      goalsTr: ['Kardeşin olup olmadığını söyle', 'Ailenden en az iki kişiyi tanıt (adı, işi)', 'Emma\'ya ailesiyle ilgili en az iki soru sor'],
      maxTurns: 8,
    },
    exercises: [
      {
        id: 'a1u2l2-i1', type: 'info', skill: 'speaking', prompt: '', title: 'Aile sohbeti kalıpları',
        body: ['Bu kalıplar aile hakkında konuşurken en çok kullanılanlardır.'],
        examples: [
          { en: 'Have you got any brothers or sisters?', tr: 'Hiç kardeşin var mı?' },
          { en: "Yes, I've got one sister.", tr: 'Evet, bir kız kardeşim var.' },
          { en: "No, I'm an only child.", tr: 'Hayır, tek çocuğum.' },
          { en: "What's her name?", tr: 'Onun adı ne?' },
          { en: 'What does he do?', tr: 'O ne iş yapıyor?' },
        ],
      },
      {
        id: 'a1u2l2-d1', type: 'dialogue', skill: 'speaking', prompt: 'Diyaloğu tamamla.',
        lines: [
          { speaker: 'Emma', text: 'Have you got any brothers or sisters?' },
          { speaker: 'Sen', text: '___', me: true },
          { speaker: 'Emma', text: "Oh nice! What's her name?" },
        ],
        options: ["Yes, I've got one sister.", "Yes, I've got one brother.", "No, I haven't."],
        answer: 0,
        explainTr: 'Emma "her name" diye soruyor; demek ki sen bir kız kardeşten söz ettin.',
      },
      { id: 'a1u2l2-q1', type: 'mcq', skill: 'speaking', prompt: 'Tek çocuksan ne dersin?', options: ["I'm an only child.", "I'm one child.", "I haven't got family."], answer: 0, explainTr: 'Doğal kalıp: I\'m an only child.' },
      { id: 'a1u2l2-q2', type: 'order', skill: 'speaking', prompt: 'Sırala: "O (erkek) ne iş yapıyor?"', tiles: ['he', 'What', 'do', 'does'], answer: 'What does he do', explainTr: 'Meslek sorusu: What does he / she do?' },
      {
        id: 'a1u2l2-d2', type: 'dialogue', skill: 'speaking', prompt: 'Diyaloğu tamamla.',
        lines: [
          { speaker: 'Sen', text: 'What does your brother do?', me: true },
          { speaker: 'Emma', text: '___' },
        ],
        options: ["He's a chef.", "She's a chef.", "I'm a chef."],
        answer: 0,
        explainTr: 'Brother (erkek) için "he" kullanılır.',
      },
      { id: 'a1u2l2-lc1', type: 'listen_choice', skill: 'listening', prompt: 'Dinle: Emma ne diyor?', audioText: "I've got a brother and a dog.", options: ['Bir erkek kardeşi ve bir köpeği var.', 'Bir kız kardeşi ve bir kedisi var.', 'Kardeşi yok ama köpeği var.'], answer: 0, explainTr: '"I\'ve got a brother and a dog."' },
      { id: 'a1u2l2-q3', type: 'translate', skill: 'speaking', prompt: 'İngilizceye çevir.', source: 'Onun (kadın) adı ne?', accepted: ["What's her name", 'What is her name'], explainTr: "What's her name?" },
      {
        id: 'a1u2l2-w1', type: 'write', skill: 'speaking', prompt: 'Emma\'ya ailenden söz et: en az 4 cümle yaz ve sonunda ona bir soru sor.',
        minSentences: 4,
        mustInclude: [
          { anyOf: ['have got', "'ve got", 'has got', "'s got", 'i have', 'i am an only child', "i'm an only child"], labelTr: 'have got / has got (veya I\'m an only child)' },
          { anyOf: ['my mother', 'my father', 'my sister', 'my brother', 'my parents', 'my mum', 'my dad'], labelTr: 'Ailenden biri (my mother / my father …)' },
          { anyOf: ['have you got', 'what does', "what's your", 'what is your', 'do you'], labelTr: 'Emma\'ya bir soru' },
        ],
        checklistTr: ['his / her doğru kişiye göre mi?', 'he / she ile "has got" kullandın mı?', 'Soru, soru işaretiyle bitiyor mu?'],
      },
    ],
  },

  // ------------------------------------------------------------------ A1.2.3
  {
    code: 'A1.2.3',
    unitId: 'A1.2',
    teacher: 'listening',
    mode: 'cards',
    introTr: 'Bu derste aile, eşya ve renk kelimelerini öğrenecek, ardından bir aileyi anlatan kısa bir dinleme metni dinleyeceksin.',
    vocab: vocabA1U2,
    exercises: [
      { id: 'a1u2l3-f1', type: 'flashcard', skill: 'vocabulary', prompt: '', term: 'daughter', meaningTr: 'kız evlat', ipa: '/ˈdɔːtə(r)/', exampleEn: 'Her daughter is a doctor.', exampleTr: 'Kızı doktor.', mnemonicTr: '"gh" okunmaz. "dotır" gibi söylenir.' },
      { id: 'a1u2l3-f2', type: 'flashcard', skill: 'vocabulary', prompt: '', term: 'husband', meaningTr: 'eş (erkek)', ipa: '/ˈhʌzbənd/', exampleEn: 'Her husband is an engineer.', exampleTr: 'Kocası mühendis.' },
      { id: 'a1u2l3-f3', type: 'flashcard', skill: 'vocabulary', prompt: '', term: 'keys', meaningTr: 'anahtarlar', ipa: '/kiːz/', exampleEn: 'These are my keys.', exampleTr: 'Bunlar benim anahtarlarım.', mnemonicTr: 'Klavyedeki tuşlara da "keys" denir.' },
      { id: 'a1u2l3-m1', type: 'match', skill: 'vocabulary', prompt: 'Aile kelimelerini eşleştir.', pairs: [['mother', 'anne'], ['father', 'baba'], ['son', 'oğul'], ['daughter', 'kız evlat'], ['wife', 'eş (kadın)']] },
      { id: 'a1u2l3-m2', type: 'match', skill: 'vocabulary', prompt: 'Renkleri eşleştir.', pairs: [['red', 'kırmızı'], ['blue', 'mavi'], ['black', 'siyah'], ['white', 'beyaz']] },
      { id: 'a1u2l3-q1', type: 'mcq', skill: 'vocabulary', prompt: 'My father\'s wife is my ___.', options: ['sister', 'mother', 'daughter'], answer: 1, explainTr: 'Babanın eşi annendir.' },
      { id: 'a1u2l3-q2', type: 'mcq', skill: 'vocabulary', prompt: "My mother's son is my ___.", options: ['brother', 'husband', 'father'], answer: 0, explainTr: 'Annenin oğlu erkek kardeşindir.' },
      { id: 'a1u2l3-q3', type: 'mcq', skill: 'grammar', prompt: 'Hangi sıralama doğru?', options: ['a car red', 'a red car', 'red a car'], answer: 1, explainTr: 'Sıfat ismin önüne gelir: a red car.' },
      { id: 'a1u2l3-lc1', type: 'listen_choice', skill: 'listening', prompt: 'Dinle ve duyduğun kelimeyi seç.', audioText: 'daughter', options: ['doctor', 'daughter', 'father'], answer: 1, explainTr: 'daughter = kız evlat.' },
      { id: 'a1u2l3-l1', type: 'listen', skill: 'listening', prompt: 'Dinle ve duyduğunu yaz.', audioText: 'These are my keys.', accepted: ['These are my keys'], explainTr: 'These are my keys. = Bunlar benim anahtarlarım.' },
      { id: 'a1u2l3-lt1', type: 'listen_choice', skill: 'listening', prompt: 'Dinleme metni: Mert\'in babası ne iş yapıyor?', audioText: familyText, options: ['Öğretmen', 'Doktor', 'Hemşire'], answer: 1, explainTr: '"My father is a doctor and my mother is a teacher."' },
      { id: 'a1u2l3-lt2', type: 'listen_choice', skill: 'listening', prompt: 'Dinleme metni: Mert\'in kaç kardeşi var?', audioText: familyText, options: ['İki', 'Üç', 'Bir'], answer: 1, explainTr: '"I\'ve got one sister and two brothers." Toplam üç.' },
      { id: 'a1u2l3-lt3', type: 'listen_choice', skill: 'listening', prompt: 'Dinleme metni: Elif kim?', audioText: familyText, options: ['Mert\'in annesi', 'Mert\'in kız kardeşi', 'Mert\'in kedisi'], answer: 1, explainTr: '"My sister\'s name is Elif. She\'s a nurse."' },
      { id: 'a1u2l3-tf1', type: 'truefalse', skill: 'listening', prompt: 'Dinleme metnine göre doğru mu, yanlış mı?', statement: "Mert's family has got a dog.", answer: false, explainTr: 'Bir kedileri var: "We\'ve got a cat."' },
    ],
  },

  // ------------------------------------------------------------------ A1.2.4
  {
    code: 'A1.2.4',
    unitId: 'A1.2',
    teacher: 'speaking',
    mode: 'conversation',
    introTr: 'Bu derste bir arkadaşına telefonundaki aile fotoğrafını gösterip kimin kim olduğunu anlatacaksın.',
    ai: {
      titleTr: 'Telefondaki aile fotoğrafı',
      situationTr: 'İş arkadaşın Tom, telefonundaki aile fotoğrafını görmek istiyor. Fotoğraftaki kişileri ona tanıt.',
      teacherRoleEn: 'You are Tom, a curious coworker. The learner is showing you a family photo on their phone. Ask "Who is this?" and simple follow-up questions about each person.',
      openingEn: "Oh, is that a family photo? Can I see? Who's this?",
      goalsTr: ['Fotoğraftaki en az 3 kişiyi "This is my…" ile tanıt', 'Her biri için bir bilgi ver (iş, yaş veya şehir)', 'his / her doğru kullan'],
      maxTurns: 8,
    },
    exercises: [
      {
        id: 'a1u2l4-i1', type: 'info', skill: 'speaking', prompt: '', title: 'Fotoğraf gösterirken',
        body: ['Bir fotoğraftaki kişileri tanıtırken bu kalıplar işine yarar.'],
        examples: [
          { en: 'This is my dad. He\'s a taxi driver.', tr: 'Bu babam. Taksi şoförü.' },
          { en: "And that's my little sister.", tr: 'Şu da küçük kız kardeşim.' },
          { en: 'These are my cousins.', tr: 'Bunlar kuzenlerim.' },
          { en: "She's very funny.", tr: 'Çok komiktir.' },
        ],
      },
      {
        id: 'a1u2l4-d1', type: 'dialogue', skill: 'speaking', prompt: 'Diyaloğu tamamla.',
        lines: [
          { speaker: 'Tom', text: "Who's this?" },
          { speaker: 'Sen', text: '___', me: true },
          { speaker: 'Tom', text: 'She looks nice! What does she do?' },
        ],
        options: ["This is my mum.", "This is my dad.", 'These are my brothers.'],
        answer: 0,
        explainTr: 'Tom "she" diyor; fotoğraftaki kişi kadın olmalı: my mum.',
      },
      { id: 'a1u2l4-q1', type: 'mcq', skill: 'speaking', prompt: 'Fotoğrafta iki kuzenini gösteriyorsun. Ne dersin?', options: ['These are my cousins.', 'This is my cousins.', 'That are my cousins.'], answer: 0, explainTr: 'Birden fazla kişi → These are…' },
      { id: 'a1u2l4-q2', type: 'fill', skill: 'grammar', prompt: 'Boşluğu doldur.', text: 'This is my uncle. ___ name is Hasan.', accepted: ['His'], explainTr: 'Uncle (amca / dayı) erkektir → his.' },
      { id: 'a1u2l4-q3', type: 'order', skill: 'speaking', prompt: 'Sırala: "Şu da benim küçük kız kardeşim."', tiles: ["that's", 'And', 'little', 'my', 'sister'], answer: "And that's my little sister", explainTr: 'Sıfat (little) isimden önce gelir.' },
      { id: 'a1u2l4-lc1', type: 'listen_choice', skill: 'listening', prompt: 'Dinle: Tom ne soruyor?', audioText: 'How old is your brother?', options: ['Erkek kardeşin kaç yaşında?', 'Erkek kardeşin nerede?', 'Erkek kardeşin ne iş yapıyor?'], answer: 0, explainTr: 'How old…? = Kaç yaşında?' },
      { id: 'a1u2l4-q4', type: 'translate', skill: 'speaking', prompt: 'İngilizceye çevir.', source: 'O (erkek) yirmi yaşında.', accepted: ["He's twenty", 'He is twenty', "He's twenty years old", 'He is twenty years old', "He's 20", 'He is 20'], explainTr: 'Yaş "to be" ile söylenir: He is twenty. ("He has twenty" denmez.)' },
      {
        id: 'a1u2l4-w1', type: 'write', skill: 'writing', prompt: 'Ailen hakkında en az 5 cümlelik kısa bir metin yaz. Kim var, ne iş yapıyorlar, nerede yaşıyorlar?',
        minSentences: 5,
        mustInclude: [
          { anyOf: ['my mother', 'my father', 'my sister', 'my brother', 'my parents', 'my mum', 'my dad', 'my wife', 'my husband', 'my son', 'my daughter'], labelTr: 'Ailenden en az bir kişi' },
          { anyOf: ['his', 'her'], labelTr: 'his veya her' },
          { anyOf: ['have got', "'ve got", 'has got', "'s got", 'i have', 'he has', 'she has'], labelTr: 'have got / has got' },
        ],
        checklistTr: ['"He is twenty" gibi yaşı to be ile söyledin mi?', 'Meslekten önce a / an var mı?', 'Renk veya sıfat ismin önünde mi?'],
      },
    ],
  },

  // ------------------------------------------------------------------ A1.2.5
  {
    code: 'A1.2.5',
    unitId: 'A1.2',
    teacher: 'exam',
    mode: 'exam',
    introTr: 'Ünite değerlendirmesi: 10 soruluk mini sınav ve ünite görevi. Sınav sırasında ipucu ve düzeltme yoktur. Geçmek için %80 gerekir.',
    exercises: [
      { id: 'a1u2l5-q1', type: 'mcq', skill: 'grammar', prompt: 'We ___ got a small flat.', options: ['has', 'have', 'are'], answer: 1, explainTr: '"We" ile have got.' },
      { id: 'a1u2l5-q2', type: 'mcq', skill: 'grammar', prompt: 'This is Zeynep and ___ son.', options: ['his', 'her', 'their'], answer: 1, explainTr: 'Zeynep kadın → her.' },
      { id: 'a1u2l5-q3', type: 'fill', skill: 'grammar', prompt: 'Boşluğu doldur.', text: '___ your brother got a car?', accepted: ['Has'], explainTr: '"your brother" = he → Has … got?' },
      { id: 'a1u2l5-q4', type: 'mcq', skill: 'grammar', prompt: 'Yakındaki birden fazla anahtar için:', options: ['This is my keys.', 'These are my keys.', 'Those is my keys.'], answer: 1, explainTr: 'these + are.' },
      { id: 'a1u2l5-q5', type: 'mcq', skill: 'vocabulary', prompt: "My aunt's daughter is my ___.", options: ['cousin', 'sister', 'niece'], answer: 0, explainTr: 'Teyze / halanın kızı kuzendir: cousin.' },
      { id: 'a1u2l5-q6', type: 'order', skill: 'grammar', prompt: 'Sırala: "Bu, kız kardeşimin çantası."', tiles: ["sister's", 'This', 'my', 'is', 'bag'], answer: "This is my sister's bag", explainTr: "my sister's bag" },
      { id: 'a1u2l5-q7', type: 'translate', skill: 'grammar', prompt: 'İngilizceye çevir.', source: 'Onun (erkek) iki kızı var.', accepted: ["He's got two daughters", 'He has got two daughters', 'He has two daughters'], explainTr: "He's got two daughters." },
      { id: 'a1u2l5-q8', type: 'listen_choice', skill: 'listening', prompt: 'Dinle ve doğru anlamı seç.', audioText: "I haven't got a sister.", options: ['Kız kardeşim yok.', 'Bir kız kardeşim var.', 'Kız kardeşim burada değil.'], answer: 0, explainTr: "haven't got = yok." },
      { id: 'a1u2l5-q9', type: 'dialogue', skill: 'speaking', prompt: 'Diyaloğu tamamla.', lines: [{ speaker: 'A', text: 'What does your sister do?' }, { speaker: 'B', text: '___', me: true }], options: ["She's a nurse.", "He's a nurse.", 'She has a nurse.'], answer: 0, explainTr: 'Sister → she; meslek "to be" ile söylenir.' },
      { id: 'a1u2l5-q10', type: 'truefalse', skill: 'grammar', prompt: 'Bu cümle doğru mu?', statement: 'He is twenty years old.', answer: true, explainTr: 'Yaş "to be" ile söylenir; cümle doğru.' },
      {
        id: 'a1u2l5-w1', type: 'write', skill: 'writing', prompt: 'Ünite görevi: Aileni ve yanında taşıdığın 3 eşyayı anlat (en az 6 cümle).',
        minSentences: 6,
        mustInclude: [
          { anyOf: ['my mother', 'my father', 'my sister', 'my brother', 'my parents', 'my mum', 'my dad', 'my wife', 'my husband', 'my son', 'my daughter'], labelTr: 'Ailenden en az bir kişi' },
          { anyOf: ['have got', "'ve got", 'has got', "'s got", 'i have'], labelTr: 'have got / has got' },
          { anyOf: ['this is', 'these are', 'that is', "that's", 'those are'], labelTr: 'this / these / that / those' },
        ],
        checklistTr: ['his / her doğru kişiye göre mi?', 'these / those ile "are" kullandın mı?', 'Eşyaların rengini söyledin mi?'],
      },
    ],
  },
];
