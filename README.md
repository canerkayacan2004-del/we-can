# We Can

Türkçe açıklamalı İngilizce öğrenme masaüstü uygulaması (Windows). A1'den B2'ye 42 ünite, 210 ders.

Sürüm 0.2.0. Güncel durum ve eksikler için `docs/DURUM.md` dosyasına bak.

## Çalıştırma

**`We-Can-Baslat.bat`** dosyasına çift tıkla.

- Bilgisayarda Node.js yoksa, kurulum yapmadan yalnızca bu klasöre (`.runtime`) resmî siteden indirir ve doğrular.
- İlk açılışta gerekli paketleri indirir (yaklaşık 150 MB, birkaç dakika).
- Sonraki açılışlarda doğrudan uygulama penceresini açar.
- İnternet yalnızca ilk kurulumda gerekir.

## Başkalarıyla paylaşmak için kurulum dosyası

**`Kurulum-Dosyasi-Olustur.bat`** dosyasına çift tıkla. `release` klasöründe `We-Can-Kurulum-0.2.0.exe` oluşur.
Bu dosyayı paylaşabilirsin; açan kişi normal bir program gibi kurar, masaüstüne kısayol gelir.

Kurulum dosyası dijital olarak imzalı olmadığı için Windows ilk açılışta "Windows bilgisayarınızı korudu" uyarısı gösterebilir.
"Ek bilgi → Yine de çalıştır" ile devam edilir. Uyarının kalkması için ücretli bir kod imzalama sertifikası gerekir.

## Komutlar (geliştirici)

| Komut | Ne yapar |
|---|---|
| `npm install` | Paketleri indirir |
| `npm start` | Derler ve uygulamayı açar |
| `npm run dev` | Geliştirme modu (Ctrl+R ile yenile) |
| `npm test` | Kural testleri |
| `npm run typecheck` | Tip kontrolü |
| `npm run content` | Müfredat dosyalarından `content/data/curriculum.json` üretir |
| `npm run dist` | Windows kurulum dosyasını üretir |

## Klasör yapısı

```
we-can/
├── apps/desktop/
│   ├── electron/        Masaüstü penceresi (ana süreç, güvenlik ayarları)
│   ├── build/           Uygulama simgesi
│   └── src/             Arayüz (React + TypeScript + Tailwind)
│       ├── screens/     Ekranlar
│       ├── components/  Ortak parçalar, alıştırma türleri, grafikler, simgeler
│       └── lib/         İçerik kaydı, veri katmanı, tema, ses
├── packages/core/       Kurallar: XP, seri, tekrar, puanlama, kilitler, görevler, rozetler, kota
├── content/
│   ├── source/          Müfredat ve öğretmen dosyaları
│   ├── data/            Müfredattan üretilen veri
│   └── exercises/       Alıştırma kartları (ünite başına bir dosya)
├── supabase/            Bulut veritabanı şeması ve AI öğretmen sunucu fonksiyonu
├── scripts/             Derleme ve başlatma betikleri
└── docs/                Durum notları
```

## Kişiselleştirme

- Uygulama içinden: **Ayarlar** → tema (6 hazır tema), vurgu rengi (8 hazır + özel renk), yazı boyutu, animasyon, ses, pano bölümleri.
- Yeni tema eklemek için: `apps/desktop/src/lib/theme.ts` içindeki `THEMES` listesi.
- Maskot ("Can"): `apps/desktop/src/components/ui.tsx` içindeki `Mascot`.
- Simgeler: `apps/desktop/src/components/Icon.tsx`.

## Yeni ünite içeriği eklemek

1. `content/exercises/A1/unit03.ts` gibi bir dosya oluştur (örnek: `unit02.ts`).
2. `apps/desktop/src/lib/content.ts` içindeki listelere ekle.
3. `npm test` ile içerik bütünlüğünü kontrol et.

## Güvenlik kuralları

- Claude (Anthropic) API anahtarı **asla** bu klasöre, `.env` dosyasına veya uygulamanın içine konmaz. Yalnızca Supabase'in gizli değişkenlerinde durur.
- `.env` dosyasına yalnızca herkese açık iki değer yazılır: Supabase adresi ve "anon" anahtarı. Derleme betiği başka hiçbir değeri uygulamaya aktarmaz.
- XP, seri, sınav sonucu ve kilit kuralları `packages/core` içindedir ve bulut modunda sunucuda çalışır.

## Arkadaşına göndermek için

Kaynak klasörü (bu klasör) başka bilgisayarda ilk açılışta Node.js ve paket indirmek zorundadır. Başkasına göndermek için bunun yerine hazır sürümü kullan:

1. `Paylasim-Paketi-Olustur.bat` dosyasına çift tıkla (internet gerekmez).
2. `release\We-Can-<sürüm>-Windows.zip` oluşur (~110 MB).
3. Bu zip'i gönder. Karşı taraf zip'i **çıkarır** ve `We Can.exe` dosyasını açar. Kurulum veya Node.js gerekmez.
