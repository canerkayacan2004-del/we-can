// Hikaye modu: "Londra'da 7 Gün". Her bölümde karşındaki kişiye en uygun İngilizce cevabı seçerek ilerlersin.
// Her seçenek: metin, sonuç (best = en doğal, ok = anlaşılır ama tuhaf, bad = yanlış/kaba) ve kısa açıklama.
import type { CefrLevel } from '../../packages/core/src/types.ts';

export type Outcome = 'best' | 'ok' | 'bad';
export interface StoryChoice { text: string; outcome: Outcome; note: string; reply?: string }
export interface StoryNode { scene: string; who: string; line: string; tr: string; choices: StoryChoice[] }
export interface StoryChapter { id: string; day: number; title: string; emoji: string; level: CefrLevel; intro: string; nodes: StoryNode[] }

export const STORY: StoryChapter[] = [
  {
    id: 'airport', day: 1, title: 'Heathrow Havalimanı', emoji: '✈️', level: 'A1',
    intro: 'Londra\'ya yeni indin. Pasaport kontrolündesin; görevli seni çağırıyor.',
    nodes: [
      { scene: 'Pasaport kontrolü', who: 'Officer', line: 'Good morning. What is the purpose of your visit?', tr: 'Günaydın. Ziyaretinizin amacı nedir?', choices: [
        { text: 'I\'m here on holiday for a week.', outcome: 'best', note: '"On holiday" + süre: tam istenen cevap.', reply: 'Lovely. Enjoy your stay.' },
        { text: 'Holiday. Week.', outcome: 'ok', note: 'Anlaşılır ama çok kısa; tam cümle daha kibar.', reply: 'Right… okay.' },
        { text: 'I am purpose.', outcome: 'bad', note: '"Purpose" amaç demek; cevap anlamsız oldu.', reply: 'Sorry? Are you on holiday or business?' },
      ] },
      { scene: 'Pasaport kontrolü', who: 'Officer', line: 'Where are you staying?', tr: 'Nerede kalacaksınız?', choices: [
        { text: 'At a hotel near King\'s Cross.', outcome: 'best', note: '"At a hotel near…" doğal ve net.' },
        { text: 'I stay hotel.', outcome: 'ok', note: '"I\'m staying at a hotel" daha doğru.' },
        { text: 'Yes, I am staying.', outcome: 'bad', note: '"Where" sorusu yer ister; evet/hayır değil.' },
      ] },
      { scene: 'Bagaj bandı', who: 'Staff', line: 'Can I help you? You look a bit lost.', tr: 'Yardımcı olabilir miyim? Biraz kaybolmuş görünüyorsunuz.', choices: [
        { text: 'Yes, please. Where can I find my luggage?', outcome: 'best', note: 'Kibar başlangıç + net soru.' },
        { text: 'Luggage where?', outcome: 'ok', note: 'Anlaşılır ama kaba durabilir.' },
        { text: 'No, I am not lost, I am Caner.', outcome: 'bad', note: 'Yardım teklifini anlamadın ve yardımı kaçırdın 🙂' },
      ] },
      { scene: 'Metro girişi', who: 'Ticket officer', line: 'Single or return?', tr: 'Tek yön mü, gidiş-dönüş mü?', choices: [
        { text: 'A single to King\'s Cross, please.', outcome: 'best', note: '"Single" = tek yön, "return" = gidiş-dönüş.' },
        { text: 'One ticket.', outcome: 'ok', note: 'Ne tür bilet olduğunu söylemedin.' },
        { text: 'I am single.', outcome: 'bad', note: 'Bu "bekarım" demek oldu 😅' },
      ] },
    ],
  },
  {
    id: 'hotel', day: 2, title: 'Otel ve kahvaltı', emoji: '🏨', level: 'A1',
    intro: 'Otele geldin. Resepsiyonda sıra sende.',
    nodes: [
      { scene: 'Resepsiyon', who: 'Receptionist', line: 'Hello! Do you have a reservation?', tr: 'Merhaba! Rezervasyonunuz var mı?', choices: [
        { text: 'Yes, it\'s under Kayacan.', outcome: 'best', note: '"Under + soyad" rezervasyonda kullanılan kalıp.' },
        { text: 'Yes. Caner.', outcome: 'ok', note: 'Çoğu zaman soyadınla aranır.' },
        { text: 'I want reservation now.', outcome: 'bad', note: 'Zaten yapılmış rezervasyonun var; soru anlaşılmadı.' },
      ] },
      { scene: 'Resepsiyon', who: 'Receptionist', line: 'Breakfast is from seven to ten. Is there anything else?', tr: 'Kahvaltı yediden ona kadar. Başka bir şey var mı?', choices: [
        { text: 'What\'s the Wi-Fi password, please?', outcome: 'best', note: 'Otelde en çok sorulan sorulardan biri.' },
        { text: 'Give Wi-Fi.', outcome: 'ok', note: 'Emir gibi; "please" eksik.' },
        { text: 'Ten is good, thank you seven.', outcome: 'bad', note: 'Cümle karıştı.' },
      ] },
      { scene: 'Kahvaltı salonu', who: 'Waiter', line: 'Tea or coffee?', tr: 'Çay mı kahve mi?', choices: [
        { text: 'Coffee, please. With milk.', outcome: 'best', note: 'Kısa ve kibar.' },
        { text: 'Yes.', outcome: 'bad', note: 'Seçim sorusuna "yes" denmez.' },
        { text: 'Coffee.', outcome: 'ok', note: '"Please" eklemek İngilizlerde çok önemli.' },
      ] },
      { scene: 'Asansör', who: 'Guest', line: 'Which floor?', tr: 'Hangi kat?', choices: [
        { text: 'Fourth, please. Thanks!', outcome: 'best', note: 'Sıra sayısı: fourth floor.' },
        { text: 'Four floor.', outcome: 'ok', note: '"Fourth floor" doğru biçim.' },
        { text: 'I don\'t like floors.', outcome: 'bad', note: 'Soru, kaçıncı katta ineceğini soruyordu.' },
      ] },
    ],
  },
  {
    id: 'city', day: 3, title: 'Şehirde kayboldun', emoji: '🗺️', level: 'A2',
    intro: 'British Museum\'u arıyorsun ama telefonunun şarjı bitti.',
    nodes: [
      { scene: 'Sokak', who: 'Stranger', line: 'You alright? Need any help?', tr: 'İyi misin? Yardım lazım mı?', choices: [
        { text: 'Yes, could you tell me how to get to the British Museum?', outcome: 'best', note: '"Could you tell me how to get to…" yol sormanın en kibar yolu.' },
        { text: 'Where museum?', outcome: 'ok', note: 'Anlaşılır ama çok kısa.' },
        { text: 'I\'m alright, thanks.', outcome: 'bad', note: 'Yardıma ihtiyacın varken reddettin.' },
      ] },
      { scene: 'Sokak', who: 'Stranger', line: 'Go straight on, then take the second left.', tr: 'Düz devam et, sonra ikinci soldan dön.', choices: [
        { text: 'Sorry, the second left?', outcome: 'best', note: 'Emin olmak için tekrar sormak çok doğal.' },
        { text: 'Okay, left two.', outcome: 'ok', note: 'Kastettiğin anlaşılır ama doğal değil.' },
        { text: 'I don\'t have a left.', outcome: 'bad', note: '"Take the second left" = ikinci soldan dön.' },
      ] },
      { scene: 'Kafe', who: 'Barista', line: 'What can I get you?', tr: 'Ne alırsınız?', choices: [
        { text: 'Could I get a flat white to take away?', outcome: 'best', note: '"To take away" İngiltere\'de "paket" demek.' },
        { text: 'I want coffee.', outcome: 'ok', note: '"I want" biraz sert; "Could I get…" daha kibar.' },
        { text: 'You can get me.', outcome: 'bad', note: 'Kalıbı ters kullandın.' },
      ] },
      { scene: 'Müze girişi', who: 'Guard', line: 'Could you open your bag, please?', tr: 'Çantanızı açabilir misiniz lütfen?', choices: [
        { text: 'Sure, here you go.', outcome: 'best', note: '"Here you go" bir şey uzatırken kullanılır.' },
        { text: 'Why?', outcome: 'ok', note: 'Güvenlik kontrolü rutin; bu soru gerginlik yaratabilir.' },
        { text: 'No, it is closed.', outcome: 'bad', note: 'Açmanı istiyordu.' },
      ] },
    ],
  },
  {
    id: 'shopping', day: 4, title: 'Camden Market', emoji: '🛍️', level: 'A2',
    intro: 'Camden\'da bir oyun mağazasında retro kulaklık gördün.',
    nodes: [
      { scene: 'Mağaza', who: 'Seller', line: 'That one\'s forty quid. Interested?', tr: 'O kırk sterlin. İlgilenir misin?', choices: [
        { text: 'Maybe. Could you do it for thirty-five?', outcome: 'best', note: 'Pazarlık kalıbı: "Could you do it for…?" ("quid" = sterlin, argo)' },
        { text: 'Too expensive. Thirty.', outcome: 'ok', note: 'Çok sert bir pazarlık.' },
        { text: 'What is quid?', outcome: 'ok', note: 'Sormak sorun değil ama pazarlık fırsatını kaçırdın.' },
      ] },
      { scene: 'Mağaza', who: 'Seller', line: 'Go on then, thirty-five. Card or cash?', tr: 'Peki o zaman, otuz beş. Kart mı nakit mi?', choices: [
        { text: 'Card, please. Can I pay contactless?', outcome: 'best', note: '"Contactless" = temassız ödeme.' },
        { text: 'Card.', outcome: 'ok', note: 'Doğru ama kısa.' },
        { text: 'Yes please.', outcome: 'bad', note: 'İkisinden birini seçmelisin.' },
      ] },
      { scene: 'Mağaza', who: 'Seller', line: 'Do you want a bag for that?', tr: 'Poşet ister misin?', choices: [
        { text: 'No thanks, I\'ll put it in my backpack.', outcome: 'best', note: 'Kibar ret + açıklama.' },
        { text: 'No.', outcome: 'ok', note: '"No thanks" çok daha kibar.' },
        { text: 'I want for that.', outcome: 'bad', note: 'Anlamsız cümle.' },
      ] },
      { scene: 'Sokak yemeği', who: 'Cook', line: 'Anything to drink with that?', tr: 'Yanında içecek ister misin?', choices: [
        { text: 'Just a bottle of water, please.', outcome: 'best', note: '"Just…" = sadece.' },
        { text: 'Drink water.', outcome: 'ok', note: 'Emir gibi oldu.' },
        { text: 'Anything.', outcome: 'bad', note: '"Herhangi bir şey" dedin; ne geleceğini bilemezsin 😄' },
      ] },
    ],
  },
  {
    id: 'friends', day: 5, title: 'Yeni arkadaşlar', emoji: '🎮', level: 'B1',
    intro: 'Bir gaming barda, League of Legends izleyen bir grupla tanıştın.',
    nodes: [
      { scene: 'Gaming bar', who: 'Jake', line: 'Mate, do you play? You\'re watching like a pro.', tr: 'Dostum, oynuyor musun? Profesyonel gibi izliyorsun.', choices: [
        { text: 'Yeah, I\'ve been playing for years. I mostly play jungle.', outcome: 'best', note: 'Present perfect continuous: "I\'ve been playing for years".' },
        { text: 'Yes, I play since many years.', outcome: 'ok', note: 'Türkçeden çeviri hatası: "I\'ve been playing for years" olmalı.' },
        { text: 'No, I am pro.', outcome: 'bad', note: 'Kendinle çeliştin 🙂' },
      ] },
      { scene: 'Gaming bar', who: 'Jake', line: 'No way! We\'re one short for a five-stack tonight. Fancy joining?', tr: 'Olamaz! Bu akşam beşli takım için bir kişi eksiğiz. Katılmak ister misin?', choices: [
        { text: 'I\'d love to! What time are you starting?', outcome: 'best', note: '"Fancy …ing?" = …ister misin? "I\'d love to" coşkulu kabul.' },
        { text: 'I fancy.', outcome: 'ok', note: 'Kastettiğin anlaşılır ama doğal değil.' },
        { text: 'I\'m not short, I\'m tall.', outcome: 'bad', note: '"One short" = bir kişi eksik.' },
      ] },
      { scene: 'Gaming bar', who: 'Mia', line: 'So what brings you to London?', tr: 'Peki seni Londra\'ya ne getirdi?', choices: [
        { text: 'I\'m on holiday, and I\'m also practising my English.', outcome: 'best', note: '"What brings you…?" = Neden geldin?' },
        { text: 'A plane brought me.', outcome: 'ok', note: 'Espri olarak komik ama soruyu cevaplamıyor 😄' },
        { text: 'Bring me London.', outcome: 'bad', note: 'Anlamsız.' },
      ] },
      { scene: 'Gaming bar', who: 'Mia', line: 'Let\'s swap Discords so we can play online later.', tr: 'Discord\'larımızı paylaşalım ki sonra online oynayalım.', choices: [
        { text: 'Sure! Here\'s mine — add me whenever.', outcome: 'best', note: '"Add me whenever" = istediğin zaman ekle.' },
        { text: 'Swap what?', outcome: 'ok', note: '"Swap" = değiş tokuş etmek.' },
        { text: 'I don\'t swap.', outcome: 'bad', note: 'Arkadaşlık teklifini reddettin 😢' },
      ] },
    ],
  },
  {
    id: 'interview', day: 6, title: 'Sürpriz iş görüşmesi', emoji: '💼', level: 'B2',
    intro: 'Mia\'nın çalıştığı yapım şirketi bir video editörü arıyor; seni kısa bir görüşmeye çağırdılar.',
    nodes: [
      { scene: 'Ofis', who: 'Producer', line: 'Thanks for coming in at such short notice. Tell me a bit about your background.', tr: 'Bu kadar kısa sürede geldiğin için teşekkürler. Biraz geçmişinden bahset.', choices: [
        { text: 'Of course. I studied Radio and TV Programming and I\'ve worked in post-production.', outcome: 'best', note: 'Kısa, ilgili ve net.' },
        { text: 'I was born in Istanbul in…', outcome: 'ok', note: 'İş görüşmesinde "background" eğitim ve deneyimi kasteder.' },
        { text: 'My background is black.', outcome: 'bad', note: 'Ekran arka planı değil 😄' },
      ] },
      { scene: 'Ofis', who: 'Producer', line: 'How do you usually handle tight deadlines?', tr: 'Sıkışık teslim tarihleriyle genelde nasıl başa çıkarsın?', choices: [
        { text: 'I break the project into smaller tasks and prioritise what matters most.', outcome: 'best', note: 'Somut yöntem anlatmak güçlü bir cevap.' },
        { text: 'I work very hard.', outcome: 'ok', note: 'Genel ve somut değil.' },
        { text: 'I don\'t like deadlines.', outcome: 'bad', note: 'Dürüst ama iş görüşmesi için kötü bir seçim.' },
      ] },
      { scene: 'Ofis', who: 'Producer', line: 'What would you say is your biggest weakness?', tr: 'En büyük zayıf yönün nedir?', choices: [
        { text: 'I can be a perfectionist, so I\'ve learnt to set time limits for each edit.', outcome: 'best', note: 'Zayıflık + nasıl geliştirdiğin: ideal kalıp.' },
        { text: 'I don\'t have any weaknesses.', outcome: 'ok', note: 'Kibirli görünebilir.' },
        { text: 'My weakness is English.', outcome: 'ok', note: 'Dürüst ama gelişim planından bahsetmek daha iyi.' },
      ] },
      { scene: 'Ofis', who: 'Producer', line: 'Do you have any questions for us?', tr: 'Bize sormak istediğin bir şey var mı?', choices: [
        { text: 'Yes — what would a typical day look like in this role?', outcome: 'best', note: 'Soru sormak ilgili olduğunu gösterir.' },
        { text: 'No.', outcome: 'ok', note: 'Fırsatı kaçırdın.' },
        { text: 'How much money?', outcome: 'bad', note: 'Maaş sorulabilir ama bu şekilde kaba duruyor.' },
      ] },
    ],
  },
  {
    id: 'goodbye', day: 7, title: 'Veda ve dönüş', emoji: '🌉', level: 'B2',
    intro: 'Son gün. Yeni arkadaşlarınla Thames kenarında vedalaşıyorsun ve bir e-posta bekliyorsun…',
    nodes: [
      { scene: 'Thames kenarı', who: 'Jake', line: 'Can\'t believe you\'re off tomorrow. It\'s gone so fast!', tr: 'Yarın gidiyor olmana inanamıyorum. Çok hızlı geçti!', choices: [
        { text: 'I know, right? I\'ve had such a great time with you guys.', outcome: 'best', note: '"I know, right?" = Değil mi ama! Doğal ve samimi.' },
        { text: 'Yes, fast.', outcome: 'ok', note: 'Duyguyu yansıtmıyor.' },
        { text: 'Where am I off?', outcome: 'bad', note: '"Be off" = ayrılmak, gitmek.' },
      ] },
      { scene: 'Thames kenarı', who: 'Mia', line: 'You have to come back next summer. Promise?', tr: 'Gelecek yaz geri gelmelisin. Söz mü?', choices: [
        { text: 'Promise! And you\'re always welcome in Istanbul.', outcome: 'best', note: 'Söz + karşılıklı davet: sıcak bir veda.' },
        { text: 'Maybe.', outcome: 'ok', note: 'Biraz soğuk kaçtı.' },
        { text: 'I promise you are summer.', outcome: 'bad', note: 'Cümle karıştı.' },
      ] },
      { scene: 'E-posta', who: 'Producer', line: 'Good news — we\'d like to offer you a remote freelance project.', tr: 'İyi haber: sana uzaktan bir serbest proje teklif etmek istiyoruz.', choices: [
        { text: 'That\'s fantastic news, thank you! I\'d be delighted to accept.', outcome: 'best', note: 'Resmi ve coşkulu kabul.' },
        { text: 'OK, cool.', outcome: 'ok', note: 'İş e-postası için fazla kayıtsız.' },
        { text: 'What is remote?', outcome: 'ok', note: '"Remote" = uzaktan. Sorabilirsin ama önce teşekkür et.' },
      ] },
      { scene: 'Havalimanı', who: 'Gate agent', line: 'We\'re now boarding all rows. Have your boarding pass ready.', tr: 'Şimdi tüm sıraları uçağa alıyoruz. Biniş kartınızı hazır tutun.', choices: [
        { text: 'Here you are. Thanks, and have a good day!', outcome: 'best', note: 'Belgeyi uzatırken "Here you are".' },
        { text: 'Boarding.', outcome: 'ok', note: 'Anlaşılır ama kısa.' },
        { text: 'I don\'t have a board.', outcome: 'bad', note: '"Boarding pass" = biniş kartı.' },
      ] },
    ],
  },
];
