// Kategori oyunu: konu konu temel kelimeler. Biçim: [emoji, İngilizce, Türkçe]
// Not: Windows bayrak emojilerini göstermediği için ülkelerde bayrak yerine kıta/simge kullanılır.
import type { CefrLevel } from '../../packages/core/src/types.ts';

export interface CategoryWord { emoji: string; en: string; tr: string }
export interface Category { id: string; emoji: string; title: string; titleEn: string; level: CefrLevel; words: CategoryWord[] }

type Row = [emoji: string, en: string, tr: string];
const cat = (id: string, emoji: string, title: string, titleEn: string, level: CefrLevel, rows: Row[]): Category =>
  ({ id, emoji, title, titleEn, level, words: rows.map(([e, en, tr]) => ({ emoji: e, en, tr })) });

export const CATEGORIES: Category[] = [
  cat('fruits', '🍎', 'Meyveler', 'Fruits', 'A1', [
    ['🍎', 'apple', 'elma'], ['🍌', 'banana', 'muz'], ['🍊', 'orange', 'portakal'], ['🍋', 'lemon', 'limon'], ['🍇', 'grapes', 'üzüm'],
    ['🍓', 'strawberry', 'çilek'], ['🍉', 'watermelon', 'karpuz'], ['🍈', 'melon', 'kavun'], ['🍐', 'pear', 'armut'], ['🍑', 'peach', 'şeftali'],
    ['🍒', 'cherry', 'kiraz'], ['🍍', 'pineapple', 'ananas'], ['🥝', 'kiwi', 'kivi'], ['🥭', 'mango', 'mango'], ['🫐', 'blueberry', 'yaban mersini'],
    ['🥥', 'coconut', 'hindistan cevizi'], ['🍏', 'green apple', 'yeşil elma'], ['🍅', 'tomato', 'domates'],
  ]),
  cat('vegetables', '🥕', 'Sebzeler', 'Vegetables', 'A1', [
    ['🥕', 'carrot', 'havuç'], ['🥔', 'potato', 'patates'], ['🧅', 'onion', 'soğan'], ['🧄', 'garlic', 'sarımsak'], ['🥒', 'cucumber', 'salatalık'],
    ['🌶️', 'chilli pepper', 'acı biber'], ['🫑', 'pepper', 'biber'], ['🍆', 'aubergine', 'patlıcan'], ['🥦', 'broccoli', 'brokoli'], ['🥬', 'lettuce', 'marul'],
    ['🌽', 'corn', 'mısır'], ['🍄', 'mushroom', 'mantar'], ['🫛', 'peas', 'bezelye'], ['🎃', 'pumpkin', 'balkabağı'], ['🫘', 'beans', 'fasulye'],
    ['🥗', 'salad', 'salata'],
  ]),
  cat('animals', '🐶', 'Hayvanlar', 'Animals', 'A1', [
    ['🐶', 'dog', 'köpek'], ['🐱', 'cat', 'kedi'], ['🐦', 'bird', 'kuş'], ['🐟', 'fish', 'balık'], ['🐴', 'horse', 'at'],
    ['🐄', 'cow', 'inek'], ['🐑', 'sheep', 'koyun'], ['🐔', 'chicken', 'tavuk'], ['🐭', 'mouse', 'fare'], ['🐰', 'rabbit', 'tavşan'],
    ['🐻', 'bear', 'ayı'], ['🦁', 'lion', 'aslan'], ['🐯', 'tiger', 'kaplan'], ['🐘', 'elephant', 'fil'], ['🐒', 'monkey', 'maymun'],
    ['🐍', 'snake', 'yılan'], ['🐢', 'turtle', 'kaplumbağa'], ['🦋', 'butterfly', 'kelebek'], ['🐝', 'bee', 'arı'], ['🦊', 'fox', 'tilki'],
    ['🐼', 'panda', 'panda'], ['🐺', 'wolf', 'kurt'], ['🦅', 'eagle', 'kartal'], ['🐬', 'dolphin', 'yunus'],
  ]),
  cat('countries', '🌍', 'Ülkeler', 'Countries', 'A1', [
    ['🧿', 'Turkey', 'Türkiye'], ['🏴', 'England', 'İngiltere'], ['🗽', 'the United States', 'Amerika Birleşik Devletleri'], ['🥨', 'Germany', 'Almanya'],
    ['🗼', 'France', 'Fransa'], ['🍕', 'Italy', 'İtalya'], ['💃', 'Spain', 'İspanya'], ['🗻', 'Japan', 'Japonya'], ['🐉', 'China', 'Çin'],
    ['🪆', 'Russia', 'Rusya'], ['⚽', 'Brazil', 'Brezilya'], ['🍁', 'Canada', 'Kanada'], ['🦘', 'Australia', 'Avustralya'], ['🌮', 'Mexico', 'Meksika'],
    ['🕌', 'Egypt', 'Mısır'], ['🏛️', 'Greece', 'Yunanistan'], ['🌷', 'the Netherlands', 'Hollanda'], ['🛕', 'India', 'Hindistan'],
    ['🎎', 'South Korea', 'Güney Kore'], ['🏔️', 'Switzerland', 'İsviçre'], ['☘️', 'Ireland', 'İrlanda'], ['🧇', 'Belgium', 'Belçika'],
  ]),
  cat('colors', '🎨', 'Renkler', 'Colours', 'A1', [
    ['🔴', 'red', 'kırmızı'], ['🔵', 'blue', 'mavi'], ['🟢', 'green', 'yeşil'], ['🟡', 'yellow', 'sarı'], ['🟠', 'orange', 'turuncu'],
    ['🟣', 'purple', 'mor'], ['🟤', 'brown', 'kahverengi'], ['⚫', 'black', 'siyah'], ['⚪', 'white', 'beyaz'], ['🩷', 'pink', 'pembe'],
    ['🩶', 'grey', 'gri'], ['🥇', 'gold', 'altın rengi'], ['🩵', 'light blue', 'açık mavi'], ['🌌', 'dark blue', 'lacivert'],
  ]),
  cat('body', '🖐️', 'Vücut', 'The body', 'A1', [
    ['👁️', 'eye', 'göz'], ['👂', 'ear', 'kulak'], ['👃', 'nose', 'burun'], ['👄', 'mouth', 'ağız'], ['🦷', 'tooth', 'diş'],
    ['👅', 'tongue', 'dil'], ['💇', 'hair', 'saç'], ['🖐️', 'hand', 'el'], ['☝️', 'finger', 'parmak'], ['💪', 'arm', 'kol'],
    ['🦵', 'leg', 'bacak'], ['🦶', 'foot', 'ayak'], ['🫀', 'heart', 'kalp'], ['🧠', 'brain', 'beyin'], ['🦴', 'bone', 'kemik'], ['🗣️', 'head', 'baş'],
  ]),
  cat('food', '🍔', 'Yiyecek ve içecek', 'Food and drink', 'A1', [
    ['🍞', 'bread', 'ekmek'], ['🧀', 'cheese', 'peynir'], ['🥚', 'egg', 'yumurta'], ['🍚', 'rice', 'pirinç'], ['🍝', 'pasta', 'makarna'],
    ['🍗', 'chicken', 'tavuk eti'], ['🥩', 'meat', 'et'], ['🍲', 'soup', 'çorba'], ['🍰', 'cake', 'pasta (tatlı)'], ['🍫', 'chocolate', 'çikolata'],
    ['🍦', 'ice cream', 'dondurma'], ['🍯', 'honey', 'bal'], ['🧈', 'butter', 'tereyağı'], ['🥛', 'milk', 'süt'], ['☕', 'coffee', 'kahve'],
    ['🍵', 'tea', 'çay'], ['💧', 'water', 'su'], ['🧃', 'juice', 'meyve suyu'], ['🍕', 'pizza', 'pizza'], ['🍟', 'chips', 'patates kızartması'],
  ]),
  cat('clothes', '👕', 'Giysiler', 'Clothes', 'A1', [
    ['👕', 'T-shirt', 'tişört'], ['👔', 'shirt', 'gömlek'], ['👖', 'jeans', 'kot pantolon'], ['👗', 'dress', 'elbise'], ['🧥', 'coat', 'mont'],
    ['🧣', 'scarf', 'atkı'], ['🧤', 'gloves', 'eldiven'], ['🧦', 'socks', 'çorap'], ['👟', 'trainers', 'spor ayakkabı'], ['👞', 'shoes', 'ayakkabı'],
    ['👢', 'boots', 'bot, çizme'], ['🧢', 'cap', 'şapka (kep)'], ['👒', 'hat', 'şapka'], ['🩳', 'shorts', 'şort'], ['👜', 'bag', 'çanta'],
    ['🕶️', 'sunglasses', 'güneş gözlüğü'], ['⌚', 'watch', 'kol saati'], ['🩱', 'swimsuit', 'mayo'],
  ]),
  cat('jobs', '👩‍⚕️', 'Meslekler', 'Jobs', 'A1', [
    ['👨‍⚕️', 'doctor', 'doktor'], ['👩‍⚕️', 'nurse', 'hemşire'], ['👨‍🏫', 'teacher', 'öğretmen'], ['👩‍🍳', 'cook', 'aşçı'], ['👮', 'police officer', 'polis'],
    ['👨‍🚒', 'firefighter', 'itfaiyeci'], ['👨‍✈️', 'pilot', 'pilot'], ['👩‍🌾', 'farmer', 'çiftçi'], ['👨‍🔧', 'mechanic', 'tamirci'], ['👩‍💻', 'developer', 'yazılımcı'],
    ['👨‍🎨', 'artist', 'sanatçı'], ['🧑‍🎤', 'singer', 'şarkıcı'], ['👷', 'builder', 'inşaat işçisi'], ['🧑‍⚖️', 'judge', 'hakim'], ['💇', 'hairdresser', 'kuaför'],
    ['🎬', 'video editor', 'video kurgucu'], ['📺', 'presenter', 'sunucu'], ['🧾', 'accountant', 'muhasebeci'],
  ]),
  cat('family', '👨‍👩‍👧', 'Aile', 'Family', 'A1', [
    ['👨', 'father', 'baba'], ['👩', 'mother', 'anne'], ['👦', 'brother', 'erkek kardeş'], ['👧', 'sister', 'kız kardeş'], ['👴', 'grandfather', 'dede'],
    ['👵', 'grandmother', 'nine, babaanne'], ['🧒', 'son', 'oğul'], ['👱‍♀️', 'daughter', 'kız evlat'], ['🤵', 'husband', 'koca'], ['👰', 'wife', 'eş (kadın)'],
    ['👨‍🦱', 'uncle', 'amca, dayı'], ['👩‍🦱', 'aunt', 'teyze, hala'], ['🧑', 'cousin', 'kuzen'], ['👶', 'baby', 'bebek'],
  ]),
  cat('house', '🏠', 'Ev ve eşyalar', 'Home', 'A1', [
    ['🛏️', 'bed', 'yatak'], ['🪑', 'chair', 'sandalye'], ['🛋️', 'sofa', 'kanepe'], ['🚪', 'door', 'kapı'], ['🪟', 'window', 'pencere'],
    ['🚿', 'shower', 'duş'], ['🛁', 'bath', 'küvet'], ['🚽', 'toilet', 'tuvalet'], ['🪞', 'mirror', 'ayna'], ['💡', 'lamp', 'lamba'],
    ['🔑', 'key', 'anahtar'], ['🧹', 'broom', 'süpürge'], ['🗑️', 'bin', 'çöp kutusu'], ['🧺', 'basket', 'sepet'], ['🖼️', 'picture', 'tablo, resim'],
    ['🏠', 'house', 'ev'], ['🏢', 'flat', 'apartman dairesi'],
  ]),
  cat('kitchen', '🍳', 'Mutfak', 'Kitchen', 'A2', [
    ['🍳', 'frying pan', 'tava'], ['🥄', 'spoon', 'kaşık'], ['🍴', 'fork', 'çatal'], ['🔪', 'knife', 'bıçak'], ['🍽️', 'plate', 'tabak'],
    ['🥣', 'bowl', 'kase'], ['🥛', 'glass', 'bardak'], ['☕', 'cup', 'fincan'], ['🫖', 'teapot', 'demlik'], ['🧂', 'salt', 'tuz'],
    ['🫙', 'jar', 'kavanoz'], ['🧊', 'ice', 'buz'], ['🥢', 'chopsticks', 'yemek çubukları'], ['🍶', 'bottle', 'şişe'],
  ]),
  cat('weather', '⛅', 'Hava durumu', 'Weather', 'A1', [
    ['☀️', 'sunny', 'güneşli'], ['☁️', 'cloudy', 'bulutlu'], ['🌧️', 'rainy', 'yağmurlu'], ['❄️', 'snowy', 'karlı'], ['🌬️', 'windy', 'rüzgarlı'],
    ['⛈️', 'stormy', 'fırtınalı'], ['🌫️', 'foggy', 'sisli'], ['🌈', 'rainbow', 'gökkuşağı'], ['⚡', 'lightning', 'şimşek'], ['🌡️', 'temperature', 'sıcaklık'],
    ['🥵', 'hot', 'sıcak'], ['🥶', 'cold', 'soğuk'], ['🌂', 'umbrella', 'şemsiye'], ['🌪️', 'tornado', 'hortum'],
  ]),
  cat('sports', '⚽', 'Spor', 'Sports', 'A1', [
    ['⚽', 'football', 'futbol'], ['🏀', 'basketball', 'basketbol'], ['🏐', 'volleyball', 'voleybol'], ['🎾', 'tennis', 'tenis'], ['🏊', 'swimming', 'yüzme'],
    ['🚴', 'cycling', 'bisiklet sürme'], ['🏃', 'running', 'koşu'], ['🥊', 'boxing', 'boks'], ['⛷️', 'skiing', 'kayak'], ['🏋️', 'weightlifting', 'halter'],
    ['🧘', 'yoga', 'yoga'], ['🏓', 'table tennis', 'masa tenisi'], ['🥅', 'goal', 'gol, kale'], ['🏆', 'trophy', 'kupa'], ['🎮', 'esports', 'e-spor'],
  ]),
  cat('transport', '🚗', 'Ulaşım', 'Transport', 'A1', [
    ['🚗', 'car', 'araba'], ['🚌', 'bus', 'otobüs'], ['🚕', 'taxi', 'taksi'], ['🚆', 'train', 'tren'], ['🚇', 'underground', 'metro'],
    ['✈️', 'plane', 'uçak'], ['🚢', 'ship', 'gemi'], ['⛴️', 'ferry', 'vapur'], ['🚲', 'bike', 'bisiklet'], ['🏍️', 'motorbike', 'motosiklet'],
    ['🚚', 'lorry', 'kamyon'], ['🚑', 'ambulance', 'ambulans'], ['🚁', 'helicopter', 'helikopter'], ['🛴', 'scooter', 'scooter'], ['🚦', 'traffic lights', 'trafik ışıkları'],
  ]),
  cat('feelings', '😊', 'Duygular', 'Feelings', 'A2', [
    ['😊', 'happy', 'mutlu'], ['😢', 'sad', 'üzgün'], ['😠', 'angry', 'kızgın'], ['😨', 'scared', 'korkmuş'], ['😴', 'tired', 'yorgun'],
    ['😮', 'surprised', 'şaşırmış'], ['😕', 'confused', 'kafası karışık'], ['😳', 'embarrassed', 'utanmış'], ['😌', 'relaxed', 'rahat'], ['😰', 'nervous', 'gergin'],
    ['🥱', 'bored', 'sıkılmış'], ['🤩', 'excited', 'heyecanlı'], ['😎', 'confident', 'kendinden emin'], ['🥺', 'lonely', 'yalnız'], ['🤒', 'ill', 'hasta'],
  ]),
  cat('school', '🎒', 'Okul', 'School', 'A1', [
    ['📚', 'book', 'kitap'], ['📓', 'notebook', 'defter'], ['✏️', 'pencil', 'kurşun kalem'], ['🖊️', 'pen', 'tükenmez kalem'], ['📏', 'ruler', 'cetvel'],
    ['✂️', 'scissors', 'makas'], ['🎒', 'backpack', 'sırt çantası'], ['🧮', 'maths', 'matematik'], ['🔬', 'science', 'fen bilimleri'], ['🗺️', 'geography', 'coğrafya'],
    ['📜', 'history', 'tarih'], ['🎓', 'graduation', 'mezuniyet'], ['📝', 'exam', 'sınav'], ['🏫', 'school', 'okul'],
  ]),
  cat('tech', '💻', 'Teknoloji', 'Technology', 'A2', [
    ['💻', 'laptop', 'dizüstü bilgisayar'], ['🖥️', 'screen', 'ekran'], ['⌨️', 'keyboard', 'klavye'], ['🖱️', 'mouse', 'fare (bilgisayar)'], ['📱', 'smartphone', 'akıllı telefon'],
    ['🎧', 'headphones', 'kulaklık'], ['🎙️', 'microphone', 'mikrofon'], ['📷', 'camera', 'fotoğraf makinesi'], ['🔋', 'battery', 'pil, batarya'], ['🔌', 'charger', 'şarj aleti'],
    ['📶', 'signal', 'sinyal'], ['🖨️', 'printer', 'yazıcı'], ['💾', 'save', 'kaydetmek'], ['🔒', 'password', 'şifre'], ['📡', 'satellite dish', 'uydu anteni'],
  ]),
  cat('nature', '🌳', 'Doğa', 'Nature', 'A2', [
    ['🌳', 'tree', 'ağaç'], ['🌸', 'flower', 'çiçek'], ['🌿', 'leaf', 'yaprak'], ['⛰️', 'mountain', 'dağ'], ['🌊', 'sea', 'deniz'],
    ['🏞️', 'river', 'nehir'], ['🏝️', 'island', 'ada'], ['🏜️', 'desert', 'çöl'], ['🌲', 'forest', 'orman'], ['🌋', 'volcano', 'yanardağ'],
    ['🌙', 'moon', 'ay'], ['⭐', 'star', 'yıldız'], ['☀️', 'sun', 'güneş'], ['🪨', 'rock', 'kaya'], ['🏖️', 'beach', 'kumsal'], ['🌾', 'field', 'tarla'],
  ]),
  cat('music', '🎸', 'Müzik aletleri', 'Instruments', 'A2', [
    ['🎸', 'guitar', 'gitar'], ['🎹', 'piano', 'piyano'], ['🥁', 'drums', 'davul'], ['🎻', 'violin', 'keman'], ['🎺', 'trumpet', 'trompet'],
    ['🎷', 'saxophone', 'saksafon'], ['🪕', 'banjo', 'banjo'], ['🪈', 'flute', 'flüt'], ['🪗', 'accordion', 'akordeon'], ['🎤', 'microphone', 'mikrofon'],
    ['🎧', 'headphones', 'kulaklık'], ['🎼', 'sheet music', 'nota'],
  ]),
  cat('places', '🏙️', 'Şehirde yerler', 'Places in town', 'A1', [
    ['🏥', 'hospital', 'hastane'], ['🏦', 'bank', 'banka'], ['🏪', 'shop', 'dükkan'], ['🛒', 'supermarket', 'süpermarket'], ['🏨', 'hotel', 'otel'],
    ['🍽️', 'restaurant', 'restoran'], ['☕', 'café', 'kafe'], ['💊', 'pharmacy', 'eczane'], ['📮', 'post office', 'postane'], ['🏛️', 'museum', 'müze'],
    ['🎬', 'cinema', 'sinema'], ['🌳', 'park', 'park'], ['🚉', 'station', 'istasyon'], ['🛫', 'airport', 'havalimanı'], ['🕌', 'mosque', 'cami'], ['📚', 'library', 'kütüphane'],
  ]),
  cat('verbs', '🏃', 'Günlük fiiller', 'Everyday verbs', 'A1', [
    ['🍽️', 'eat', 'yemek'], ['🥤', 'drink', 'içmek'], ['😴', 'sleep', 'uyumak'], ['🏃', 'run', 'koşmak'], ['🚶', 'walk', 'yürümek'],
    ['📖', 'read', 'okumak'], ['✍️', 'write', 'yazmak'], ['🗣️', 'speak', 'konuşmak'], ['👂', 'listen', 'dinlemek'], ['👀', 'look', 'bakmak'],
    ['🎵', 'sing', 'şarkı söylemek'], ['💃', 'dance', 'dans etmek'], ['🏊', 'swim', 'yüzmek'], ['🧑‍🍳', 'cook', 'yemek pişirmek'], ['🛒', 'buy', 'satın almak'],
    ['🎮', 'play', 'oynamak'], ['🤔', 'think', 'düşünmek'], ['😂', 'laugh', 'gülmek'], ['😭', 'cry', 'ağlamak'], ['🧳', 'travel', 'seyahat etmek'],
  ]),
  cat('shapes', '🔷', 'Şekiller ve sayılar', 'Shapes and numbers', 'A1', [
    ['🔵', 'circle', 'daire'], ['🟥', 'square', 'kare'], ['🔺', 'triangle', 'üçgen'], ['⭐', 'star', 'yıldız'], ['❤️', 'heart', 'kalp'],
    ['🔷', 'diamond', 'karo, elmas'], ['1️⃣', 'one', 'bir'], ['2️⃣', 'two', 'iki'], ['3️⃣', 'three', 'üç'], ['5️⃣', 'five', 'beş'],
    ['7️⃣', 'seven', 'yedi'], ['🔟', 'ten', 'on'], ['💯', 'hundred', 'yüz'], ['➕', 'plus', 'artı'], ['➖', 'minus', 'eksi'],
  ]),
];
