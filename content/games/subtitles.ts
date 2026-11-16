// Altyazı görevi: sahnedeki her repliği dinle, doğru altyazıyı seç ve zaman çizelgesine yerleştir.
// Her satırda: konuşan, doğru altyazı, birbirine çok benzeyen yanlış iki seçenek, Türkçe anlam.
import type { CefrLevel } from '../../packages/core/src/types.ts';

export interface SubLine { who: string; text: string; wrong: [string, string]; tr: string }
export interface SubScene { id: string; title: string; level: CefrLevel; lines: SubLine[] }

export const SUB_SCENES: SubScene[] = [
  {
    id: 'cafe', title: 'Kafede sipariş', level: 'A1', lines: [
      { who: 'Barista', text: 'Hi! What can I get you?', wrong: ['Hi! What can I give you?', 'Hi! What can you get me?'], tr: 'Merhaba! Ne alırsınız?' },
      { who: 'Caner', text: 'Can I have a large coffee, please?', wrong: ['Can I have a large copy, please?', 'Can I have the last coffee, please?'], tr: 'Büyük bir kahve alabilir miyim lütfen?' },
      { who: 'Barista', text: 'Sure. For here or to go?', wrong: ['Sure. For her or to go?', 'Sure. For here or to grow?'], tr: 'Tabii. Burada mı, götürmek için mi?' },
      { who: 'Caner', text: 'To go, thanks.', wrong: ['Two go, thanks.', 'To know, thanks.'], tr: 'Götürmek için, teşekkürler.' },
      { who: 'Barista', text: 'That\'s four fifty.', wrong: ['That\'s fourteen.', 'That\'s forty-five.'], tr: '4,50 tutuyor.' },
    ],
  },
  {
    id: 'stream', title: 'Yayın başlangıcı', level: 'A2', lines: [
      { who: 'Caner', text: 'Hey everyone, welcome back to the stream!', wrong: ['Hey everyone, welcome back to the street!', 'Hey everyone, welcome to the back stream!'], tr: 'Herkese selam, yayına tekrar hoş geldiniz!' },
      { who: 'Caner', text: 'Today we\'re trying to reach Platinum.', wrong: ['Today we\'re trying to teach Platinum.', 'Today we tried to reach Platinum.'], tr: 'Bugün Platin\'e çıkmaya çalışıyoruz.' },
      { who: 'Caner', text: 'Don\'t forget to hit that follow button.', wrong: ['Don\'t forget to hit the yellow button.', 'Don\'t forget the hit follow button.'], tr: 'Takip butonuna basmayı unutmayın.' },
      { who: 'Caner', text: 'Let\'s get into the first game.', wrong: ['Let\'s get in the first gate.', 'Let\'s get into the fast game.'], tr: 'Hadi ilk maça girelim.' },
    ],
  },
  {
    id: 'interview', title: 'İş görüşmesi', level: 'B1', lines: [
      { who: 'Interviewer', text: 'So, tell me a little about yourself.', wrong: ['So, tell me a little about your shelf.', 'So, tell me a lot about yourself.'], tr: 'Peki, biraz kendinden bahset.' },
      { who: 'Caner', text: 'I studied Radio and Television Programming.', wrong: ['I studied Radio and Television Programs.', 'I started Radio and Television Programming.'], tr: 'Radyo ve Televizyon Programcılığı okudum.' },
      { who: 'Caner', text: 'I worked in post-production for a TV channel.', wrong: ['I worked in post production for a TV channel?', 'I walked in post-production for a TV channel.'], tr: 'Bir TV kanalında post-prodüksiyonda çalıştım.' },
      { who: 'Interviewer', text: 'Why do you want to work with us?', wrong: ['Why did you want to work with us?', 'Why do you want to walk with us?'], tr: 'Neden bizimle çalışmak istiyorsun?' },
      { who: 'Caner', text: 'I think I could learn a lot here.', wrong: ['I think I could earn a lot here.', 'I thought I could learn a lot here.'], tr: 'Burada çok şey öğrenebileceğimi düşünüyorum.' },
    ],
  },
  {
    id: 'airport', title: 'Havalimanında rötar', level: 'B2', lines: [
      { who: 'Agent', text: 'I\'m afraid your flight has been delayed.', wrong: ['I\'m afraid your flight has been delivered.', 'I\'m afraid your flight had been delayed.'], tr: 'Korkarım uçuşunuz ertelendi.' },
      { who: 'Caner', text: 'Do you know how long it\'s going to be?', wrong: ['Do you know how long it\'s gonna leave?', 'Do you know how long it was going to be?'], tr: 'Ne kadar süreceğini biliyor musunuz?' },
      { who: 'Agent', text: 'Roughly two hours, but it might change.', wrong: ['Roughly two hours, but it must change.', 'Rough or two hours, but it might change.'], tr: 'Yaklaşık iki saat ama değişebilir.' },
      { who: 'Caner', text: 'Would I be able to get a meal voucher?', wrong: ['Would I be able to get a mail voucher?', 'Would I be able to get the meal for you?'], tr: 'Yemek kuponu alabilir miyim?' },
    ],
  },
];
