// Öğrenme Merkezi içerikleri: seviyeye göre dizi/film, kitap/seri, hikayeli oyun önerileri ve kelime paketleri.
// Açıklamalar We Can için yazıldı; yapımların adları yalnızca öneri amaçlı anılır.
import type { CefrLevel } from '../packages/core/src/types.ts';

export type MediaKind = 'series' | 'film' | 'doc' | 'book' | 'reader' | 'game';

export interface MediaItem {
  id: string;
  title: string;
  kind: MediaKind;
  /** Önerilen en düşük ve en yüksek seviye. */
  from: CefrLevel;
  to: CefrLevel;
  accent: string;
  why: string;
  tip: string;
}

type Raw = [title: string, kind: MediaKind, from: CefrLevel, to: CefrLevel, accent: string, why: string, tip: string];

const WATCH: Raw[] = [
  ['Peppa Pig', 'series', 'A1', 'A1', 'İngiliz', 'Kısa bölümler, yavaş ve net konuşma, günlük ev hayatı kelimeleri.', 'Bir bölümü önce izle, sonra sesini açıp yalnızca dinle.'],
  ['Extr@ English', 'series', 'A1', 'A2', 'İngiliz', 'Dil öğrenenler için çekilmiş komedi; temel kalıplar sürekli tekrar eder.', 'Her bölümden 5 cümleyi defterine yaz.'],
  ['Bluey', 'series', 'A1', 'A2', 'Avustralya', 'Aile içi gündelik konuşmalar, kısa ve eğlenceli bölümler.', 'Aksan farklıdır; kelimeleri tanıdıkça kulağın açılır.'],
  ['Toy Story', 'film', 'A2', 'B1', 'Amerikan', 'Animasyon olduğu için konuşmalar net; arkadaşlık ve günlük dil.', 'Önce Türkçe, ikinci izleyişte İngilizce altyazı.'],
  ['Friends', 'series', 'A2', 'B1', 'Amerikan', 'Günlük sohbetin klasik kalıpları; kısa sahneler ve tekrar eden şakalar.', 'Sevdiğin bir sahneyi gölge konuşmayla (aynı anda tekrar) çalış.'],
  ['Modern Family', 'series', 'A2', 'B1', 'Amerikan', 'Aile, iş ve okul hayatı; röportaj sahnelerinde konuşma yavaş ve açık.', 'Kameraya konuşulan bölümleri tekrar dinle.'],
  ['Planet Earth', 'doc', 'B1', 'B2', 'İngiliz', 'Anlatıcı net ve sakin konuşur; doğa ve bilim kelimeleri.', 'Bilmediğin hayvan ve doğa kelimelerini not al.'],
  ['How I Met Your Mother', 'series', 'B1', 'B2', 'Amerikan', 'Arkadaş ortamı, flört ve iş hayatı; bol deyim ve espri.', 'İngilizce altyazıyla izleyip deyimleri yakala.'],
  ['Brooklyn Nine-Nine', 'series', 'B1', 'B2', 'Amerikan', 'İş yeri komedisi; hızlı ama anlaşılır, bol günlük kalıp.', 'Şakaların neden komik olduğunu anlamaya çalış.'],
  ['Harry Potter (filmler)', 'film', 'B1', 'B2', 'İngiliz', 'Tanıdık hikaye sayesinde bağlamdan anlamak kolay; İngiliz aksanı.', 'Hikayeyi bildiğin için İngilizce altyazıyla rahatça takip edersin.'],
  ['Stranger Things', 'series', 'B2', 'C1', 'Amerikan', 'Gençlerin doğal ve hızlı konuşması; argo ve 80\'ler kültürü.', 'Hızlı sahneleri 0.9x hızda tekrar izle.'],
  ['The Office (US)', 'series', 'B2', 'C1', 'Amerikan', 'Ofis dili, ima ve ironi; iş İngilizcesi için çok iyi.', 'Toplantı sahnelerindeki iş kalıplarını not al.'],
  ['Sherlock', 'series', 'B2', 'C1', 'İngiliz', 'Çok hızlı ve zengin kelime dağarcığı; dinleme kasını zorlar.', 'Bir sahneyi altyazısız, sonra altyazılı izleyip farkı gör.'],
  ['Black Mirror', 'series', 'C1', 'C1', 'İngiliz/Amerikan', 'Teknoloji ve toplum üzerine soyut fikirler; tartışma dili.', 'Bölüm sonunda İngilizce 3 cümlelik yorum yaz.'],
  ['Breaking Bad', 'series', 'C1', 'C2', 'Amerikan', 'Gerilimli diyaloglar, argo ve ima; doğal hızda konuşma.', 'Altyazısız izlemeyi dene; takıldığın yerde geri sar.'],
  ['Succession', 'series', 'C1', 'C2', 'Amerikan', 'Hızlı iş ve aile kavgaları; ileri seviye iş dili ve ironi.', 'Kelime yerine ton ve imaya odaklan.'],
  ['Peaky Blinders', 'series', 'C2', 'C2', 'İngiliz (Birmingham)', 'Ağır yerel aksan ve dönem argosu; ileri seviye kulak eğitimi.', 'İngilizce altyazı neredeyse şart; aksanları karşılaştır.'],
];

const READ: Raw[] = [
  ['Oxford Bookworms (Starter–Stage 2)', 'reader', 'A1', 'A2', '—', 'Öğrenenler için sadeleştirilmiş kısa romanlar; seviyeye göre sınırlı kelime.', 'Haftada bir kitap hedefle; bilmediğin kelimelerin yalnızca 5\'ine bak.'],
  ['Penguin Readers (Level 1–3)', 'reader', 'A1', 'B1', '—', 'Klasik ve popüler hikayelerin kolaylaştırılmış halleri.', 'Varsa sesli versiyonunu dinleyerek oku.'],
  ['The Little Prince', 'book', 'A2', 'B1', '—', 'Kısa cümleler, sade dil; hikayeyi bildiğin için anlamak kolay.', 'Her bölümden sevdiğin bir cümleyi not defterine yaz.'],
  ['Diary of a Wimpy Kid (seri)', 'book', 'A2', 'B1', '—', 'Günlük formatında, çizimli ve komik; okul hayatı dili.', 'Çizimler bağlamı verir; sözlüğe az bak.'],
  ['Wonder', 'book', 'B1', 'B1', '—', 'Kısa bölümler, duygusal ve sade anlatım.', 'Karakterlerin bakış açısına göre dilin nasıl değiştiğine dikkat et.'],
  ['Holes', 'book', 'B1', 'B2', '—', 'Akıcı macera, net cümleler; merak ettirdiği için bırakması zor.', 'Bölüm sonlarında ne olacağını İngilizce tahmin et.'],
  ['Oxford Bookworms (Stage 3–6)', 'reader', 'B1', 'C1', '—', 'Orta ve ileri seviye sadeleştirilmiş klasikler.', 'Okuduktan sonra hikayeyi 5 cümleyle özetle.'],
  ['Harry Potter (kitap serisi)', 'book', 'B1', 'B2', '—', 'Seri ilerledikçe dil zorlaşır; seviyenle birlikte büyür.', 'İlk kitapla başla, Türkçesini okuduysan daha da kolay.'],
  ['The Hunger Games (seri)', 'book', 'B2', 'B2', '—', 'Birinci tekil anlatım, hızlı tempo; günümüz İngilizcesi.', 'Bölüm başına 10 dakika sesli oku.'],
  ['Animal Farm', 'book', 'B2', 'C1', '—', 'Kısa ama derin; politik kelimeler ve alegori.', 'Karakterlerin neyi temsil ettiğini İngilizce not al.'],
  ['Atomic Habits', 'book', 'B2', 'C1', '—', 'Kurgu dışı, net ve pratik dil; alışkanlık ve kişisel gelişim kelimeleri.', 'Öğrendiğin bir fikri İngilizce olarak birine anlat.'],
  ['The Hobbit', 'book', 'C1', 'C1', '—', 'Zengin betimlemeler ve eski tarz anlatım; kelime hazinesini genişletir.', 'Betimleme kelimelerini (sıfatları) ayrı listele.'],
  ['1984', 'book', 'C1', 'C2', '—', 'Soyut kavramlar ve yoğun anlatım; ileri okuma.', 'Her bölümden bir tartışma sorusu çıkar.'],
  ['Sapiens', 'book', 'C1', 'C2', '—', 'Kurgu dışı, akademik ama akıcı; tarih ve bilim dili.', 'Uzun cümleleri parçalara ayırarak oku.'],
];

const PLAY: Raw[] = [
  ['Minecraft', 'game', 'A1', 'A2', '—', 'Eşya ve tarif adları basit; somut kelimeler (wood, stone, craft).', 'Oyunu İngilizceye al; tarif adlarını yüksek sesle oku.'],
  ['Pokémon (seri)', 'game', 'A2', 'B1', '—', 'Kısa diyalog kutuları, okuma hızını sen belirlersin.', 'Bilmediğin kelimeleri oyunu durdurup not al.'],
  ['Stardew Valley', 'game', 'A2', 'B1', '—', 'Köy hayatı, günlük sohbetler; tekrar eden kısa diyaloglar.', 'Her gün kasabalılarla konuşup diyalogları oku.'],
  ['Undertale', 'game', 'B1', 'B2', '—', 'Esprili ve duygusal diyaloglar; seçimler hikayeyi değiştirir.', 'Komik cümleleri not al; mizah dili öğretir.'],
  ['League of Legends', 'game', 'B1', 'B2', '—', 'Şampiyon sözleri, yetenek açıklamaları ve hikaye metinleri İngilizce okunabilir.', 'İstemciyi İngilizceye al; oynadığın şampiyonun sözlerini anlamaya çalış.'],
  ['Life is Strange', 'game', 'B1', 'B2', '—', 'Bol diyalog ve günlük gençlik dili; seçimler önemli olduğu için dikkatle okursun.', 'İngilizce ses + İngilizce altyazıyla oyna.'],
  ['The Walking Dead (Telltale)', 'game', 'B1', 'B2', '—', 'Sinematik hikaye ve zamanlı seçimler; hızlı anlama pratiği.', 'Zaman baskısı zorlarsa önce altyazıyı okumaya odaklan.'],
  ['Firewatch', 'game', 'B2', 'C1', '—', 'Neredeyse tamamı telsizde geçen doğal diyaloglar; dinleme pratiği.', 'Altyazıyı kapatıp yalnızca dinlemeyi dene.'],
  ['Detroit: Become Human', 'game', 'B2', 'C1', '—', 'Sinema gibi; ahlaki tartışmalar ve resmi-gündelik dil karışımı.', 'Seçimlerinin nedenini İngilizce kısa bir notla yaz.'],
  ['Disco Elysium', 'game', 'C1', 'C2', '—', 'Çok yoğun ve edebi metin; ileri seviye okuma.', 'Bilmediğin kelimeleri işaretle, oturum sonunda bak.'],
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const make = (rows: Raw[]): MediaItem[] => rows.map(([title, kind, from, to, accent, why, tip]) => ({ id: `m:${slug(title)}`, title, kind, from, to, accent, why, tip }));

export const WATCH_LIST = make(WATCH);
export const READ_LIST = make(READ);
export const PLAY_LIST = make(PLAY);

export interface PackItem { en: string; tr: string; ex?: string }
export interface WordPack { id: string; title: string; description: string; level: CefrLevel; items: PackItem[] }

export const WORD_PACKS: WordPack[] = [
  {
    id: 'pack:gaming', title: 'Oyun ve yayın İngilizcesi', level: 'A2',
    description: 'Oyunlarda, yayınlarda ve montaj videolarında sık geçen kelimeler.',
    items: [
      { en: 'highlight', tr: 'öne çıkan an, en iyi kesit', ex: 'This clip is the highlight of the stream.' },
      { en: 'clip', tr: 'kısa video kesiti', ex: 'Can you send me the clip?' },
      { en: 'stream', tr: 'canlı yayın / yayın yapmak', ex: 'I stream every Friday night.' },
      { en: 'chat', tr: 'sohbet bölümü', ex: 'Thanks, chat, for the support!' },
      { en: 'follower', tr: 'takipçi', ex: 'We just reached 100 followers.' },
      { en: 'teammate', tr: 'takım arkadaşı', ex: 'My teammate saved me.' },
      { en: 'to carry', tr: 'takımı sırtlamak', ex: 'She carried the whole team.' },
      { en: 'to nerf / to buff', tr: 'zayıflatmak / güçlendirmek', ex: 'They nerfed my favourite champion.' },
      { en: 'cooldown', tr: 'bekleme süresi', ex: 'My ultimate is on cooldown.' },
      { en: 'to respawn', tr: 'yeniden doğmak', ex: 'I respawn in ten seconds.' },
      { en: 'lag', tr: 'gecikme, donma', ex: 'Sorry, I had huge lag.' },
      { en: 'patch', tr: 'güncelleme yaması', ex: 'The new patch changed everything.' },
      { en: 'rank', tr: 'lig/seviye derecesi', ex: 'I want to rank up this season.' },
      { en: 'match', tr: 'maç', ex: 'That was a close match.' },
      { en: 'to queue', tr: 'sıraya girmek, maç aramak', ex: 'Let\'s queue together.' },
      { en: 'well played', tr: 'iyi oynadın', ex: 'Well played, everyone!' },
      { en: 'to edit', tr: 'kurgulamak, düzenlemek', ex: 'I edit my videos in CapCut.' },
      { en: 'transition', tr: 'geçiş efekti', ex: 'Add a smooth transition here.' },
      { en: 'thumbnail', tr: 'video kapak görseli', ex: 'A good thumbnail gets more views.' },
      { en: 'subscriber', tr: 'abone', ex: 'Thanks to all my subscribers.' },
    ],
  },
  {
    id: 'pack:interview', title: 'İş görüşmesi İngilizcesi', level: 'B1',
    description: 'Mülakatlarda en çok kullanılan sorular ve cevap kalıpları.',
    items: [
      { en: 'Tell me about yourself.', tr: 'Bana kendinden bahset.', ex: 'I graduated in Radio and TV Programming and…' },
      { en: 'Why do you want this job?', tr: 'Bu işi neden istiyorsun?', ex: 'I want to grow in a company like yours.' },
      { en: 'What are your strengths?', tr: 'Güçlü yönlerin neler?', ex: 'I am a fast learner and a good team player.' },
      { en: 'What is your weakness?', tr: 'Zayıf yönün nedir?', ex: 'I sometimes focus too much on details, but I am working on it.' },
      { en: 'Where do you see yourself in five years?', tr: 'Beş yıl sonra kendini nerede görüyorsun?' },
      { en: 'I have experience in…', tr: '… konusunda deneyimim var.', ex: 'I have experience in video editing.' },
      { en: 'I am responsible for…', tr: '…tan/ten sorumluyum.', ex: 'I was responsible for post-production.' },
      { en: 'I worked as an intern at…', tr: '…da/de stajyer olarak çalıştım.', ex: 'I worked as an intern at a TV channel.' },
      { en: 'team player', tr: 'takım çalışmasına yatkın kişi' },
      { en: 'deadline', tr: 'teslim tarihi', ex: 'I always meet my deadlines.' },
      { en: 'to handle pressure', tr: 'baskıyla başa çıkmak', ex: 'I can handle pressure well.' },
      { en: 'customer service', tr: 'müşteri hizmetleri' },
      { en: 'shift', tr: 'vardiya', ex: 'I am available for night shifts.' },
      { en: 'Do you have any questions for us?', tr: 'Bize sormak istediğin bir şey var mı?' },
      { en: 'Could you tell me more about the role?', tr: 'Pozisyon hakkında biraz daha bilgi verebilir misiniz?' },
      { en: 'Thank you for your time.', tr: 'Zaman ayırdığınız için teşekkürler.' },
    ],
  },
  {
    id: 'pack:interview-airline', title: 'Havayolu mülakatı', level: 'B1',
    description: 'Havayolu ve havalimanı işe alım görüşmelerinde sorulan sorular, örnek cevaplar ve sektör kelimeleri.',
    items: [
      { en: 'Why do you want to work for our airline?', tr: 'Neden bizim havayolumuzda çalışmak istiyorsun?', ex: 'I admire your service quality, and I want to be part of a team that connects people around the world.' },
      { en: 'What does good customer service mean to you?', tr: 'Sence iyi müşteri hizmeti ne demek?', ex: 'It means listening carefully, staying calm and solving the problem quickly.' },
      { en: 'How would you deal with an angry passenger?', tr: 'Öfkeli bir yolcuyla nasıl ilgilenirsin?', ex: 'I would stay calm, listen without interrupting, apologise for the inconvenience and offer a solution.' },
      { en: 'Tell me about a time you worked in a team.', tr: 'Bir ekipte çalıştığın bir zamandan bahset.', ex: 'During my internship, we had to deliver a programme on time, so we shared the tasks and helped each other.' },
      { en: 'Are you comfortable working shifts, weekends and holidays?', tr: 'Vardiyalı, hafta sonu ve tatillerde çalışmak sana uyar mı?', ex: 'Yes, I am flexible, and I understand that aviation never stops.' },
      { en: 'How do you handle stress?', tr: 'Stresle nasıl başa çıkıyorsun?', ex: 'I focus on one task at a time and keep a clear head.' },
      { en: 'Safety always comes first.', tr: 'Güvenlik her zaman önce gelir.', ex: 'I would never skip a safety procedure, even under time pressure.' },
      { en: 'What would you do if a flight was delayed?', tr: 'Bir uçuş gecikirse ne yapardın?', ex: 'I would keep passengers informed and help them with connections and rebooking.' },
      { en: 'I would like to apologise for the inconvenience.', tr: 'Yaşanan aksaklık için özür dilerim.' },
      { en: 'Let me see what I can do for you.', tr: 'Sizin için ne yapabileceğime bakayım.' },
      { en: 'cabin crew', tr: 'kabin ekibi', ex: 'The cabin crew are responsible for passenger safety.' },
      { en: 'ground staff', tr: 'yer hizmetleri personeli', ex: 'Ground staff help passengers at check-in and at the gate.' },
      { en: 'boarding', tr: 'uçağa biniş', ex: 'Boarding starts forty minutes before departure.' },
      { en: 'connecting flight', tr: 'aktarmalı uçuş', ex: 'He missed his connecting flight because of the delay.' },
      { en: 'to rebook', tr: 'bileti yeniden düzenlemek', ex: 'We can rebook you on the next available flight.' },
      { en: 'baggage allowance', tr: 'bagaj hakkı', ex: 'Your baggage allowance is twenty-three kilos.' },
      { en: 'punctual', tr: 'dakik', ex: 'I am punctual and reliable.' },
      { en: 'well-groomed', tr: 'bakımlı, düzgün görünümlü', ex: 'Airline staff are expected to be well-groomed.' },
      { en: 'to go the extra mile', tr: 'beklenenden fazlasını yapmak', ex: 'I always go the extra mile for customers.' },
      { en: 'I am a quick learner and I stay calm under pressure.', tr: 'Hızlı öğrenirim ve baskı altında sakin kalırım.' },
    ],
  },
  {
    id: 'pack:interview-tv', title: 'TV kanalı mülakatı', level: 'B1',
    description: 'Televizyon kanalı ve yapım şirketi görüşmeleri için sorular, örnek cevaplar ve yayıncılık kelimeleri.',
    items: [
      { en: 'Why do you want to work in television?', tr: 'Neden televizyonda çalışmak istiyorsun?', ex: 'I love telling stories with pictures and sound, and I enjoy the energy of a live broadcast.' },
      { en: 'Tell me about your experience in post-production.', tr: 'Post prodüksiyon deneyiminden bahset.', ex: 'I worked as an intern in post-production, where I edited footage and prepared it for broadcast.' },
      { en: 'Which editing software do you use?', tr: 'Hangi kurgu programlarını kullanıyorsun?', ex: 'I mainly use CapCut and Canva, and I am learning Premiere Pro.' },
      { en: 'How do you work under tight deadlines?', tr: 'Sıkışık teslim sürelerinde nasıl çalışırsın?', ex: 'I plan my steps first, then I focus on the most important parts.' },
      { en: 'What would you do if something went wrong during a live broadcast?', tr: 'Canlı yayında bir şey ters giderse ne yapardın?', ex: 'I would stay calm, inform the director immediately and switch to the backup plan.' },
      { en: 'Describe a project you are proud of.', tr: 'Gurur duyduğun bir projeyi anlat.', ex: 'I edited a short video that reached a lot of viewers, and I learned a lot about pacing.' },
      { en: 'Can you take feedback well?', tr: 'Geri bildirimi iyi karşılar mısın?', ex: 'Yes, feedback helps me improve my work.' },
      { en: 'Which of our programmes do you watch?', tr: 'Programlarımızdan hangilerini izliyorsun?', ex: 'I follow your evening news, and I like how the stories are edited.' },
      { en: 'I pay attention to detail.', tr: 'Ayrıntılara dikkat ederim.', ex: 'In editing, one wrong frame can change the whole scene.' },
      { en: 'I am happy to work late when a programme needs it.', tr: 'Program gerektirdiğinde geç saate kadar çalışmaya hazırım.' },
      { en: 'live broadcast', tr: 'canlı yayın', ex: 'The match is a live broadcast.' },
      { en: 'control room', tr: 'reji odası', ex: 'The director sits in the control room.' },
      { en: 'footage', tr: 'ham görüntü, çekim', ex: 'We have two hours of footage to edit.' },
      { en: 'to edit', tr: 'kurgulamak', ex: 'I edited the interview down to three minutes.' },
      { en: 'rough cut', tr: 'kaba kurgu', ex: 'The rough cut will be ready tomorrow.' },
      { en: 'to go on air', tr: 'yayına girmek', ex: 'We go on air in five minutes.' },
      { en: 'running order', tr: 'yayın akışı', ex: 'Check the running order before the show.' },
      { en: 'subtitles', tr: 'altyazı', ex: 'I added subtitles to the video.' },
      { en: 'voice-over', tr: 'dış ses', ex: 'The voice-over was recorded in the studio.' },
      { en: 'ratings', tr: 'izlenme oranları, reyting', ex: 'The show has high ratings.' },
    ],
  },
  {
    id: 'pack:travel', title: 'Seyahat ve havalimanı', level: 'A2',
    description: 'Havalimanı, otel ve şehirde işine yarayacak kalıplar.',
    items: [
      { en: 'boarding pass', tr: 'biniş kartı' },
      { en: 'gate', tr: 'kapı (uçağa biniş)', ex: 'Our flight leaves from gate 12.' },
      { en: 'delayed', tr: 'rötarlı', ex: 'The flight is delayed by an hour.' },
      { en: 'check-in', tr: 'giriş/kayıt işlemi', ex: 'Where is the check-in desk?' },
      { en: 'luggage / baggage', tr: 'bagaj' },
      { en: 'carry-on', tr: 'kabin bagajı' },
      { en: 'aisle / window seat', tr: 'koridor / cam kenarı koltuk', ex: 'Can I have a window seat?' },
      { en: 'I have a reservation.', tr: 'Rezervasyonum var.' },
      { en: 'Is breakfast included?', tr: 'Kahvaltı dahil mi?' },
      { en: 'How do I get to…?', tr: '…a/e nasıl giderim?', ex: 'How do I get to the city centre?' },
      { en: 'round trip', tr: 'gidiş-dönüş' },
      { en: 'exchange rate', tr: 'döviz kuru' },
    ],
  },
];
