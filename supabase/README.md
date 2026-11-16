# Sunucu tarafı (Supabase)

Bu klasördeki dosyalar yazıldı ama henüz gerçek bir Supabase projesinde çalıştırılmadı.

| Dosya | Görevi |
|---|---|
| `migrations/0001_init.sql` | Veritabanı tabloları ve satır düzeyinde güvenlik (RLS) kuralları |
| `functions/ai-teacher/index.ts` | Claude API'yi güvenli çağıran sunucu fonksiyonu: kimlik, günlük kota, kullanım kaydı |
| `functions/_shared/prompts.ts` | AI öğretmen talimatları (yalnızca sunucuda durur) |

## Kurulum sırası (Supabase projesi açıldıktan sonra)

1. Supabase panelinde SQL Editor'ü aç, `0001_init.sql` içeriğini çalıştır.
2. Panelde Edge Functions → Secrets bölümüne `ANTHROPIC_API_KEY` ekle.
3. `ai-teacher` fonksiyonunu yayınla.
4. İçerik tablolarını doldur (müfredat ve A1 Ünite 1); bunun için yükleme betiği yazılacak.
5. Proje adresini ve "anon" anahtarını proje kökündeki `.env` dosyasına yaz (`.env.example` şablonuna bak).

## Model adları

Fonksiyon varsayılan olarak konuşma için `claude-sonnet-5-5`, yazı değerlendirmesi için `claude-haiku-5-5` kullanır.
Yayınlamadan önce güncel model adlarını https://docs.claude.com adresinden doğrula; gerekirse
`ANTHROPIC_MODEL_CHAT` ve `ANTHROPIC_MODEL_LIGHT` gizli değişkenleriyle değiştir.

## Güvenlik notları

- `service_role` anahtarı ve Anthropic anahtarı hiçbir zaman masaüstü uygulamasına veya `.env` dosyasına konmaz.
- İstemci ilerleme, XP, seri, sınav sonucu ve AI kullanım tablolarına yazamaz; yalnızca okuyabilir.
- Sınav sorularının cevap anahtarları ve AI senaryoları istemciye kapalıdır.
