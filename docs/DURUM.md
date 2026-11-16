# We Can — Durum (sürüm 0.2.0)

Son güncelleme: 16 Kasım 2026

## 0.2.0'da gelenler

- Koyu, kişiselleştirilebilir arayüz: 6 tema (Gece Yeşili, Gece Mavisi, Mor Nebula, Kor, Saf Siyah, Açık), 8 vurgu rengi ve özel renk, yazı boyutu, animasyon ve ses ayarı. Her hesabın kendi görünümü.
- Yeni ana pano: günlük hedef (dakika), seviye, seri grafiği, beceri halkaları, haftalık XP, sıradaki ders, günün planı, bugünün kelimeleri, AI öğretmen kartı, seri ödülleri. Bölümler açılıp kapatılabilir.
- Yeni alıştırma türleri: kelime tanıtım kartı ve hafıza ipucu (Memrise yöntemi), diyalog tamamlama (Babbel yöntemi), dinle ve seç, doğru / yanlış. Derste "üst üste doğru" sayacı ve ses efektleri.
- Hata telafisi: yanlış yapılan sorular gerçek alıştırma olarak yeniden sorulur (Duolingo yöntemi).
- Akıllı tekrar ekranı: Anki tarzı kart tekrarı, basamak dağılımı, her düğmede sonraki tekrar günü.
- Dinleme odası: dikte, ses ayırt etme (ship / sheep gibi 10 çift), gölge konuşma.
- Gelişim ekranı: 30 günlük XP grafiği, günlük çalışma süresi, 6 beceri doğruluğu, gelişim tablosu, son denemeler.
- Profilde gelişim tablosu ve 8 haftalık XP grafiği; şifre değiştirme.
- Not defteri (etiket, arama, sabitleme), günlük plan, başarılar ekranı (16 rozet, 7 görev türü, seri hedefleri).
- Verileri dışa aktarma (yedek).
- **A1 Ünite 2** (Ailem ve eşyalarım) baştan sona hazır. Toplam 2 ünite, 10 ders, 130'dan fazla kart.
- Çalışma süresi ve beceri istatistikleri kaydediliyor.
- Başlatıcı Node.js'i gerekirse yalnızca klasöre indiriyor; `.exe` kurulum dosyası üretme betiği eklendi.

## Test edilenler

- 15 kural testi (`npm test`): XP, seri, tekrar aralıkları, sınav eşikleri, hata telafisi, dinleme odası, not defteri, eski kayıt yükseltmesi, iki ünitenin içerik bütünlüğü.
- 52 adımlı arayüz testi (Chromium): kayıt, anket, seviye tespiti, 10 dersin tamamı, sınavda başarısızlık ve tekrar, tekrar kartları, hata telafisi, dinleme odası, not defteri, tema ve renk değişiminin kalıcılığı, iki hesabın verilerinin ayrılığı, hesap silme. Konsolda hata yok.

## Henüz yok

- **Bulut hesabı:** Uygulama "yerel modda" çalışır; hesaplar ve ilerleme yalnızca o bilgisayarda durur. Supabase projesi açıldığında istemcinin bulut bağlantısı yazılacak. Şema (`0001`, `0002`) ve AI fonksiyonu hazır, hiç çalıştırılmadı.
- **Canlı AI öğretmen:** Konuşma derslerinde hazır diyalog pratiği var; canlı sohbet ve AI yazı değerlendirmesi bulut bağlantısıyla gelecek.
- **Kalan 40 ünitenin alıştırmaları.**
- **Otomatik güncelleme:** Güncellemelerin dağıtılacağı bir sunucu (ör. GitHub sürümleri) gerekiyor.
- **Kod imzalama:** Kurulum dosyası imzasız; Windows uyarı gösterebilir.
- **Sesli konuşma ve telaffuz ölçümü.**
- Müfredatla ilgili üç açık karar (B2'deki C1'e yakın konular, eksik gramer başlıkları, edilgen yapının yeri) hâlâ onay bekliyor.
