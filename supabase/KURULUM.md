# AI öğretmeni Supabase + Gemini ile bağlama

Gemini API anahtarı **yalnızca Supabase'de** durur. Uygulamaya, `.env` dosyasına veya sohbete yapıştırılmaz.

## 1. Veritabanı (1 dakika)
Supabase paneli → **SQL Editor** → **New query** → `supabase/kurulum.sql` dosyasının tamamını yapıştır → **Run**.
("Success. No rows returned" yazması normal.)

## 2. Anonim girişi aç
**Authentication** → **Sign In / Providers** → **Allow anonymous sign-ins** → aç → **Save**.
(Uygulama her kullanıcı için arka planda anonim bir oturum açar; günlük AI hakkı buna göre sayılır.)

## 3. Sunucu fonksiyonunu yayınla
**Edge Functions** → **Deploy a new function** → **Via Editor**.
- Fonksiyon adı: `ai-teacher` (tam olarak böyle)
- Editördeki örnek kodu sil, `supabase/functions/ai-teacher/index.ts` dosyasının tamamını yapıştır
  (dosyaya sağ tık → Birlikte aç → Not Defteri → Ctrl+A, Ctrl+C).
- **Deploy function**.
- Fonksiyonun **Settings / Details** bölümünde **Verify JWT with legacy secret** kapalı olsun
  (fonksiyon oturumu kendi içinde doğruluyor).

## 4. Gemini anahtarını ekle
**Edge Functions** → **Secrets** → **Add new secret**
- Name: `GEMINI_API_KEY`
- Value: Google AI Studio'dan aldığın anahtar (https://aistudio.google.com/apikey)
- İsteğe bağlı: `GEMINI_MODEL` = `gemini-3.5-flash-lite` (hızlı; boş bırakılırsa bu kullanılır, yoksa yedek modellere geçilir)

## 5. Uygulamayı projeye bağla
**Project Settings** → **API Keys** (ve **Data API**) bölümünden:
- Project URL (https://xxxx.supabase.co)
- Publishable / anon key

Bu iki değer gizli değildir. `We-Can` klasöründe `.env` dosyası oluşturup yaz:
```
WECAN_SUPABASE_URL=https://xxxx.supabase.co
WECAN_SUPABASE_ANON_KEY=...
```
Sonra `We-Can-Baslat.bat` (kendin için) ve `Paylasim-Paketi-Olustur.bat` (arkadaşların için) çalıştır.

## Notlar
- Ücretsiz plan: kullanıcı başına günde 20 konuşma + 20 yazı değerlendirmesi (sunucuda sayılır).
- İçerik değişirse fonksiyon verisini güncellemek için: `node scripts/build-function.mjs`, sonra 3. adımdaki kodu yeniden yapıştır.
