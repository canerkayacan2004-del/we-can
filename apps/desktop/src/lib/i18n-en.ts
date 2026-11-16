// İngilizce arayüz sözlüğü. Her satır: Türkçe metin ⇒ İngilizce karşılığı. "{}" değişken yerini tutar.
const RAW = `
Pano ⇒ Dashboard
Öğrenme haritası ⇒ Learning map
Öğrenme merkezi ⇒ Learning hub
Akıllı tekrar ⇒ Smart review
Kelime defteri ⇒ Vocabulary
AI öğretmen ⇒ AI teacher
Arkadaşlar ⇒ Friends
Araçlar ⇒ Tools
Gelişim ⇒ Progress
Haftalık rapor ⇒ Weekly report
Çalışma planı ⇒ Study plan
Not defterim ⇒ My notebook
Başarılar ⇒ Achievements
Ayarlar ⇒ Settings
Profil ⇒ Profile
Yerel mod ⇒ Local mode
· ayrıntılar ⇒ · details
Ücretsiz plan ⇒ Free plan
Ücretsiz ⇒ Free
sen ⇒ you
şimdi ⇒ now
bugün ⇒ today
Bugün ⇒ Today
gün ⇒ days
1 gün ⇒ 1 day
Başla ⇒ Start
Devam ⇒ Continue
Devam et ⇒ Continue
Sonraki ⇒ Next
Sıradaki ⇒ Next
Geri ⇒ Back
⌫ Geri al ⇒ ⌫ Undo
Kapat ⇒ Close
Kaydet ⇒ Save
Ekle ⇒ Add
Sil ⇒ Delete
Kaldır ⇒ Remove
Düzenle ⇒ Edit
Vazgeç ⇒ Cancel
Çık ⇒ Quit
Çıkar ⇒ Remove
Gönder ⇒ Send
Dene ⇒ Try
Tekrar ⇒ Review
Tekrar dene ⇒ Try again
Tekrar oyna ⇒ Play again
Tekrar dinle ⇒ Listen again
Oyna ⇒ Play
Bitir ⇒ Finish
Aç ⇒ Open
Liste ⇒ List
Hepsi ⇒ All
Seviye ⇒ Level
Seviyen ⇒ Your level
Seri ⇒ Streak
Serin ⇒ Your streak
Süre ⇒ Time
Sonuç ⇒ Result
Doğru ⇒ Correct
Doğru! ⇒ Correct!
Yanlış ⇒ Wrong
Doğrusu: ⇒ Correct answer:
Doğru cevap: ⇒ Correct answer:
Kontrol et ⇒ Check
Dinle ⇒ Listen
Yavaş ⇒ Slow
🐢 Yavaş ⇒ 🐢 Slow
İpucu ⇒ Hint
İpucu: ⇒ Hint:
Pes et ⇒ Give up
Bilmiyorum ⇒ I don't know
Boş bırak ⇒ Leave blank
Kopyalandı ⇒ Copied
Kopyalandı ✓ ⇒ Copied ✓
Yükleniyor… ⇒ Loading…
Lütfen bekle… ⇒ Please wait…
Tamamlandı ⇒ Completed
✓ tamamlandı ⇒ ✓ completed
Kilitli ⇒ Locked
Sırada ⇒ Up next
Takılı ⇒ Equipped
Tümünü gör ⇒ See all
Keşfet ⇒ Explore
Tarih ⇒ Date
XP ⇒ XP
Ders ⇒ Lesson
Kelime ⇒ Vocabulary
Gramer ⇒ Grammar
Okuma ⇒ Reading
Dinleme ⇒ Listening
Yazma ⇒ Writing
Konuşma ⇒ Speaking
Konuşma* ⇒ Speaking*
Konuşma (yazılı) ⇒ Speaking (written)
Konuşma (metin tabanlı) ⇒ Speaking (text-based)
metin tabanlı ⇒ text-based
Ünite ⇒ Unit
Oyun ⇒ Game
İş ⇒ Work
diğer ⇒ other
Pzt ⇒ Mon
Sal ⇒ Tue
Çar ⇒ Wed
Per ⇒ Thu
Cum ⇒ Fri
Cmt ⇒ Sat
Paz ⇒ Sun
Pazartesi ⇒ Monday
Salı ⇒ Tuesday
Çarşamba ⇒ Wednesday
Perşembe ⇒ Thursday
Cuma ⇒ Friday
Cumartesi ⇒ Saturday
Pazar ⇒ Sunday
Sabah ⇒ Morning
Öğle ⇒ Midday
Akşam ⇒ Evening
Gece ⇒ Night
bugün ⇒ today
Dinlenme günü ⇒ Rest day

Tekrar hoş geldin ⇒ Welcome back
Tekrar hoş geldin, ⇒ Welcome back,
Bugün de bir adım ileri gidelim. ⇒ Let's take another step today.
Kaldığın yerden devam et. ⇒ Pick up where you left off.
Derse devam et ⇒ Continue lesson
Günlük hedef ⇒ Daily goal
Günlük seri ⇒ Daily streak
Becerilerin ⇒ Your skills
Haftalık ilerleme ⇒ Weekly progress
Son ders ⇒ Last lesson
Sıradaki ders ⇒ Next lesson
Sonraki ders ⇒ Next lesson
Yeni ders ⇒ New lesson
Bugünün planı ⇒ Today's plan
Günün 10 kelimesi ⇒ Today's 10 words
Günün cümlesi ⇒ Phrase of the day
Bugünkü kelimeler tamam ✓ ⇒ Today's words done ✓
Seri ödülleri ⇒ Streak rewards
Seri hedefleri ⇒ Streak goals
Günlük plan ⇒ Daily plan
Gelişim özeti ⇒ Progress summary
Panoyu düzenle ⇒ Edit dashboard
Panoda neler görünsün? ⇒ What should the dashboard show?
Pano bölümleri ⇒ Dashboard sections
Ana panoda görmek istediklerini seç. Kapattıkların sol menüden açılabilir. ⇒ Choose what you want on the dashboard. Hidden items stay available from the left menu.
Hepsini ana ekrana koymak zorunda değilsin. Kapattıkların menüden her zaman açılabilir. ⇒ You don't have to show everything. Hidden items are always available from the menu.
Kelime oyunları ⇒ Word games
Oyun salonu ⇒ Game room
Oynayarak öğren: kelime, dinleme ve konuşma oyunları tek yerde. ⇒ Learn by playing: word, listening and speaking games in one place.
Günün Wordle’ı ⇒ Daily Wordle
Günün Wordle’ı oynandı. ⇒ Today's Wordle played.
Günün Wordle’ı seni bekliyor. ⇒ Today's Wordle is waiting for you.
Günün Wordle’ını bildin! ⇒ You solved today's Wordle!
Günün Wordle’ını bugün oynadın. Serbest oyunla devam edebilirsin. ⇒ You've played today's Wordle. Keep going in free play.
Serbest oyun ⇒ Free play
5 harf yazmalısın. ⇒ You need to type 5 letters.
5 harfli İngilizce kelimeyi 6 denemede bul. ⇒ Find the 5-letter English word in 6 tries.
Bu kelime sözlükte yok. Gerçek bir İngilizce kelime dene. ⇒ That word isn't in the dictionary. Try a real English word.
Bu sefer olmadı ⇒ Not this time
Bu sefer olmadı. ⇒ Not this time.
Kelime Avı ⇒ Word Hunt
Harfleri diz ⇒ Arrange the letters
5 harfli kelimeyi bul ⇒ Find the 5-letter word
Türkçe anlamı: ⇒ Turkish meaning:
Hızlı tur ⇒ Speed round
60 saniye ⇒ 60 seconds
60 saniyede olabildiğince çok kelimenin Türkçesini seç. 5 doğru üst üste = kombo, her doğru 2 puan. ⇒ Pick the Turkish meaning of as many words as you can in 60 seconds. 5 in a row = combo, each correct answer worth 2 points.
Klavyede 1–4 tuşlarıyla da seçebilirsin. ⇒ You can also use keys 1–4.
Kaçırdıkların ⇒ You missed
Dikte yarışı ⇒ Dictation race
Dinle ve yaz ⇒ Listen and write
Duyduğunu buraya yaz… ⇒ Type what you hear…
Büyük harf ve noktalama önemli değil. İstediğin kadar tekrar dinleyebilirsin. ⇒ Capitals and punctuation don't matter. Listen as many times as you like.
Yayıncı modu ⇒ Streamer mode
Sohbete cevap ver ⇒ Reply to chat
🔴 Yayını başlat ⇒ 🔴 Go live
Doğru cevaplar izleyici kazandırır, hızlı cevaplar ekstra puan. ⇒ Good replies win viewers, fast replies earn bonus points.
Harika cevap! ⇒ Great reply!
Sıradaki mesaj ⇒ Next message
Yayını bitir ⇒ End stream
Yeni yayın ⇒ New stream
Altyazı görevi ⇒ Subtitle task
Dinle, altyazıyı seç ⇒ Listen, pick the subtitle
Bir sahne seç. Her repliği dinle ve doğru altyazıyı seç; birbirine çok benzeyen seçenekler var. Sonunda zamanlı bir altyazı dosyası (SRT) oluşur. ⇒ Pick a scene. Listen to each line and choose the right subtitle — the options sound very similar. At the end you get a timed subtitle file (SRT).
Sonraki replik ⇒ Next line
Başka sahne ⇒ Another scene
ZAMAN ÇİZELGESİ (.srt) ⇒ TIMELINE (.srt)
Replikleri doğru seçtikçe burada altyazı dosyası oluşacak. ⇒ Your subtitle file will build up here as you pick the right lines.
Hikaye modu ⇒ Story mode
Londra'da 7 gün ⇒ 7 days in London
Hikaye modu · Londra'da 7 Gün ⇒ Story mode · 7 Days in London
Londra'ya tatile gittin. Her gün karşına çıkan insanlara en doğal İngilizce cevabı seç; iyi cevaplar hikayeyi ilerletir. Bölümü geçmek için en az 1 yıldız gerekir. ⇒ You're on holiday in London. Each day, choose the most natural English reply to the people you meet; good replies move the story forward. You need at least 1 star to pass a chapter.
Bölümler ⇒ Chapters
Türkçesini göster ⇒ Show Turkish
Mükemmel! +2 ⇒ Perfect! +2
Olur ama daha iyisi var. +1 ⇒ OK, but there's a better one. +1
Günü bitir ⇒ Finish the day
Bu günü tekrar dene ⇒ Try this day again
Hikayeyi bitirdin! 🎉 ⇒ You finished the story! 🎉
Boss savaşı ⇒ Boss battle
Savaşa başla ⇒ Start the battle
Saldır ⚔️ ⇒ Attack ⚔️
Kritik vuruş! 💥 ⇒ Critical hit! 💥
Boss kazandı… ⇒ The boss won…
Tekrar savaş ⇒ Fight again
Bu ünitenin konularına hakimsin. ⇒ You've mastered this unit.
Dersleri tekrar edip yeniden dene. ⇒ Review the lessons and try again.
Bu ünitenin boss savaşı henüz açılmadı. ⇒ This unit's boss battle isn't open yet.
Ünitenin sorularıyla süreli savaş · 3 kalp · kazanırsan +8 XP ⇒ Timed battle with the unit's questions · 3 hearts · +8 XP if you win
Kelime Canavarı ⇒ Word Monster
Zaman Bükücü ⇒ Time Bender
Üniteye dön ⇒ Back to unit

Öğrenme merkezi ⇒ Learning hub
Kelimeler, oyunlar, dinleme, dizi-film, kitaplar ve paketler tek yerde ⇒ Words, games, listening, shows, books and packs in one place
Dizi & film ⇒ Shows & films
Kitap & seri ⇒ Books & series
Hikayeli oyunlar ⇒ Story games
Kelime paketleri ⇒ Word packs
Wordle, hızlı tur, dikte, altyazı, hikaye… ⇒ Wordle, speed round, dictation, subtitles, story…
Dikte, ses ayırt etme, gölge konuşma ⇒ Dictation, sound discrimination, shadowing
Dikte, ses ayırt etme ve gölge konuşma pratiği. ⇒ Dictation, sound discrimination and shadowing practice.
Konuşma pratiği ve yazı değerlendirme ⇒ Speaking practice and writing feedback
Öğrendiğin tüm kelimeler ⇒ All the words you've learned
Zamanı gelen kartlar ve hatalar ⇒ Cards and mistakes that are due
Seviyene uygun dizi & film ⇒ Shows & films for your level
Seviyene uygun kitap & seri ⇒ Books & series for your level
İngilizce öğreten hikayeli oyunlar ⇒ Story games that teach English
İzleme sırası önerisi: önce Türkçe altyazı, sonra İngilizce altyazı, en son altyazısız. ⇒ Suggested order: Turkish subtitles first, then English subtitles, then none.
Seviyeli okuma serileri (graded readers) öğrenenler için sadeleştirilmiştir; kendi seviyenden başla. ⇒ Graded readers are simplified for learners; start at your own level.
Oyunun dilini ve altyazısını İngilizceye al. Hikaye seni sürükler, kelimeler kendiliğinden gelir. ⇒ Switch the game's language and subtitles to English. The story pulls you in and the words follow.
Bu seviye için öneri yok; "Hepsi"ni seç. ⇒ No suggestions for this level; choose "All".
Bu seviye için öneri yok; seviye filtresini değiştir. ⇒ No suggestions for this level; change the level filter.
Kartlarla çalış ⇒ Study with cards
Başa dön ⇒ Start over
Anlamını göster ⇒ Show meaning
Dizi ⇒ Series
Film ⇒ Film
Belgesel ⇒ Documentary
Kitap ⇒ Book
Seviyeli okuma serisi ⇒ Graded reader series

Günün kelimeleri ⇒ Today's words
Anlamını hatırlıyor musun? Aklından söyle, sonra kontrol et. ⇒ Do you remember the meaning? Say it in your head, then check.
Biliyordum ⇒ I knew it
Öğren · deftere ekle ⇒ Learn · add to vocabulary
Bugünün listesi ⇒ Today's list
Bugünün kelimeleri tamam! ⇒ Today's words are done!
Önce anlamını hatırlamaya çalış, sonra kartı çevir. Bilmediklerin deftere ve akıllı tekrara eklenir. ⇒ Try to recall the meaning first, then flip the card. Words you don't know go to your vocabulary and smart review.

Haftalık rapor ⇒ Weekly report
Çalışma süresi ⇒ Study time
Kazanılan XP ⇒ XP earned
Tamamlanan ders ⇒ Lessons completed
Doğruluk ⇒ Accuracy
Bu haftanın özeti ⇒ This week's summary
Düzenlilik ⇒ Consistency
Bu hafta ⇒ This week
Geçen hafta ⇒ Last week
Aktif gün ⇒ Active days
Hedefe ulaşılan gün ⇒ Days goal reached
Tekrar kartı ⇒ Review cards
Hata telafisi ⇒ Mistake practice
Hata analizi ⇒ Mistake analysis
Açık hata ⇒ Open mistakes
Çözülen hata ⇒ Fixed mistakes
Tekrarlayan ⇒ Repeating
hâlâ bilinmeyen ⇒ still unknown
Toplam ⇒ Total
Önerilen adımlar ⇒ Suggested steps
Beceriye göre ⇒ By skill
Soru türüne göre ⇒ By question type
Konuya göre ⇒ By topic
Henüz hata yok. ⇒ No mistakes yet.
Açık hatalar ⇒ Open mistakes
Açık hatan yok. Harika! 🎉 ⇒ No open mistakes. Great! 🎉
Hataları şimdi çalış ⇒ Practise mistakes now
tekrarlayan ⇒ repeating
tekrar zamanı ⇒ due for review
Bu hafta henüz çalışma kaydı yok. Küçük bir başlangıç: Günün 10 kelimesi 5 dakika sürer. ⇒ No study recorded this week yet. A small start: today's 10 words take 5 minutes.
Bu hafta başladın; düzenli küçük oturumlar en hızlı ilerletir. ⇒ You've started this week; small regular sessions make the fastest progress.
Cümle kurma hataları öne çıkıyor: AI yazı değerlendirmesiyle kısa metinler yaz. ⇒ Sentence-building mistakes stand out: write short texts with AI writing feedback.
Dinleme kaynaklı hatalar öne çıkıyor: Dinleme odasında dikte yap. ⇒ Listening mistakes stand out: do dictation in the listening room.
Çoktan seçmeli ⇒ Multiple choice
Boşluk doldurma ⇒ Fill in the blank
Doğru / yanlış ⇒ True / false
Eşleştirme ⇒ Matching
Kelime sıralama ⇒ Word order
Çeviri ⇒ Translation
Dinle ve seç ⇒ Listen and choose
Duyduğunu yaz ⇒ Write what you hear

Plan; sıradaki derslerinden, tekrar kartlarından ve en zayıf becerinden otomatik oluşur. Günleri Profil'den değiştirebilirsin. ⇒ The plan is built automatically from your next lessons, review cards and weakest skill. Change your days in Profile.
Bugünün görevleri ⇒ Today's tasks
Günün görevleri (ödüllü) ⇒ Today's tasks (rewarded)
Görev ödülü ⇒ Task reward
Hafta sonu: Wordle ⇒ Weekend: Wordle
✓ Hedef tamam ⇒ ✓ Goal done
○ Hedef tamamlanmadı ⇒ ○ Goal not reached
Bugünün ilerlemesi ⇒ Today's progress

Arkadaş ekle ⇒ Add a friend
Arkadaş kodunla arkadaşlarını ekle, seviyelerini ve haftalık XP'lerini gör. ⇒ Add friends with your friend code and see their levels and weekly XP.
Senin arkadaş kodun ⇒ Your friend code
Kodun hazırlanıyor… ⇒ Preparing your code…
Kod alınamadı. ⇒ Couldn't get a code.
Bu kodu arkadaşına gönder; o da kendi We Can'inde ⇒ Send this code to a friend; when they enter it in
ekranına yazınca birbirinizi görürsünüz. ⇒ in their own We Can, you'll see each other.
Sıralama ⇒ Leaderboard
Henüz arkadaşın yok. Kodunu paylaş ya da bir arkadaşının kodunu ekle. ⇒ No friends yet. Share your code or add a friend's code.
Arkadaşlıktan çıkar ⇒ Remove friend
Bu senin kendi kodun 🙂 ⇒ That's your own code 🙂
Kod "WC-" ve 6 karakterden oluşur. Örnek: WC-7K3MPQ ⇒ A code is "WC-" plus 6 characters. Example: WC-7K3MPQ
Arkadaş listesi alınamadı. ⇒ Couldn't load the friends list.
Arkadaşların yalnızca adını, fotoğrafını, seviyeni, XP'ni ve serini görür. Ders ayrıntıların ve e-postan paylaşılmaz. Sohbet mesajları yalnızca karşılıklı arkadaşlar arasında görünür ve 90 gün sonra silinir. ⇒ Friends only see your name, photo, level, XP and streak. Your lesson details and email are never shared. Chat messages are only visible between mutual friends and are deleted after 90 days.
Henüz mesaj yok. İlk mesajı sen gönder! ⇒ No messages yet. Send the first one!
Mesaj yaz… (Enter ile gönder) ⇒ Type a message… (Enter to send)
İngilizce yazmaya çalışın 😉 ⇒ try writing in English 😉
Kelime düellosu ⇒ Word duel
⚔️ Düellolar ⇒ ⚔️ Duels
kazandın ⇒ won
kaybettin ⇒ lost
Kazandın! 🏆 ⇒ You won! 🏆
Berabere ⇒ Draw
Sohbet ⇒ Chat

Panda dolabı ⇒ Panda wardrobe
🐼 Panda dolabı ⇒ 🐼 Panda wardrobe
XP kazandıkça yeni aksesuarlar açılır. Her bölmeye (baş, göz, boyun, el, aura) bir tane takabilirsin. ⇒ New accessories unlock as you earn XP. You can wear one per slot (head, eyes, neck, hand, aura).
Tak ⇒ Wear
Şapka ⇒ Cap
Güneş gözlüğü ⇒ Sunglasses
Oyun kolu ⇒ Controller
Papyon ⇒ Bow tie
Atkı ⇒ Scarf
Yayıncı mikrofonu ⇒ Streamer mic
Mor neon aura ⇒ Purple neon aura
Pilot gözlüğü ⇒ Goggles
Mezuniyet kepi ⇒ Graduation cap
Kitap yığını ⇒ Book stack
Altın aura ⇒ Gold aura
Taç ⇒ Crown
Günlük hedef tamam! ⇒ Daily goal complete!
hedefini bitirdin. Harika gidiyorsun 🐼 ⇒ goal done. You're doing great 🐼

Fotoğraf yükle ⇒ Upload photo
Fotoğrafı değiştir ⇒ Change photo
Profil fotoğrafını değiştir ⇒ Change profile photo
Profil fotoğrafın güncellendi. ⇒ Profile photo updated.
Profil fotoğrafın kaldırıldı. ⇒ Profile photo removed.
Fotoğraf yüklenemedi. ⇒ Couldn't upload the photo.
Lütfen bir resim dosyası seç (JPG, PNG, WEBP). ⇒ Please choose an image file (JPG, PNG, WEBP).
Resim çok büyük (en fazla 15 MB). ⇒ Image is too large (max 15 MB).
Resim açılamadı. ⇒ Couldn't open the image.
Resim işlenemedi. ⇒ Couldn't process the image.
Dosya okunamadı. ⇒ Couldn't read the file.
Profil ve hesap ⇒ Profile and account
Profili düzenle ⇒ Edit profile
Hedef seçilmedi ⇒ No goal chosen
Toplam XP ⇒ Total XP
En uzun seri ⇒ Longest streak
Hesap ⇒ Account
Şifreyi değiştir ⇒ Change password
Mevcut şifre ⇒ Current password
Yeni şifre ⇒ New password
Şifren değiştirildi. ⇒ Your password was changed.
Hesabımı sil ⇒ Delete my account
Hesabın ve bütün ilerlemen silinir. Onaylamak için şifreni yaz. ⇒ Your account and all progress will be deleted. Type your password to confirm.
Kalıcı olarak sil ⇒ Delete permanently
Bu işlem geri alınamaz. ⇒ This can't be undone.
Çıkış yap ⇒ Sign out
Plan ve AI kullanım hakkı ⇒ Plan and AI allowance
Seviye tespiti ⇒ Placement test
Çalışma düzenin ⇒ Your study routine
Haftada ⇒ Per week

İngilizceyi en çok ne için istiyorsun? ⇒ What do you mainly want English for?
Hangi konularda İngilizce kullanacaksın? ⇒ Which topics will you use English for?
Birden fazla seçebilirsin. Senaryolar ve kelimeler buna göre ağırlıklandırılır. ⇒ You can choose several. Scenarios and words are weighted accordingly.
Günde ne kadar? ⇒ How much per day?
Hangi günler çalışacaksın? ⇒ Which days will you study?
Sana nasıl hitap edelim? ⇒ What should we call you?
Sana uygun bir yol çizebilmem için birkaç kısa soru. ⇒ A few quick questions so I can plan the right path for you.
Sonra Ayarlar'dan istediğin zaman değiştirebilirsin. ⇒ You can change this any time in Settings.
5. Görünümünü seç ⇒ 5. Choose your look
AI öğretmen örnekleri ve kişisel dersleri hobilerine göre hazırlar. ⇒ The AI teacher tailors examples and personal lessons to your hobbies.
En az bir çalışma günü seçmelisin. ⇒ Choose at least one study day.
Günlük hayatta rahat konuşmak ⇒ Speaking comfortably in daily life
İş hayatında kullanmak ⇒ Using it at work
Dizi, film ve oyunları altyazısız anlamak ⇒ Understanding shows, films and games without subtitles
Sınava veya okula hazırlanmak ⇒ Preparing for an exam or school
Yurt dışında yaşamak / çalışmak ⇒ Living / working abroad
Günlük sohbet ⇒ Everyday conversation
Seyahat ⇒ Travel
İş hayatı ⇒ Business
Emlak sektörü ⇒ Real estate
Teknoloji ⇒ Technology
Sosyal hayat ⇒ Social life
Sağlık ⇒ Health
Eğitim ⇒ Education
Alışveriş ⇒ Shopping
Finans ⇒ Finance
Medya ve iletişim ⇒ Media and communication
Müşteri hizmetleri ⇒ Customer service
Müzik ⇒ Music
Film ve dizi ⇒ Films and series
Video oyunları ⇒ Video games
Spor ⇒ Sport
Futbol ⇒ Football
Kitap okumak ⇒ Reading books
Yemek yapmak ⇒ Cooking
Fotoğrafçılık ⇒ Photography
Video kurgu ⇒ Video editing
Yayın (stream) ⇒ Streaming
Sanat ve çizim ⇒ Art and drawing
Moda ⇒ Fashion
Doğa ve kamp ⇒ Nature and camping
Hobiler ⇒ Hobbies

Seviyeni bulalım ⇒ Let's find your level
Teste başla ⇒ Start the test
A1'den başla ⇒ Start from A1
Baştan, sağlam bir temelle başlıyoruz. ⇒ We'll start from the beginning with a solid foundation.
Seviye tespit sonucun: ⇒ Your placement result:
Başlangıç seviyen ⇒ Your starting level
Seviye tespit yapmadın; A1'den başladın. ⇒ You skipped the placement test and started from A1.
Seviye tespitiyle atlandı ⇒ Skipped by placement
atlandı ⇒ skipped
(kısa ön tespit, kesin değildir). ⇒ (a short estimate, not definitive).
ön tespittir ⇒ is an estimate

Ünite geçildi ⇒ Unit passed
Pekiştirme gerekli ⇒ Needs reinforcement
Sınav tekrarlanmalı ⇒ Exam must be retaken
Ünite görevi ⇒ Unit task
Ünite sınavı ⇒ Unit exam
Kelime ve beceri ⇒ Vocabulary and skills
Senaryo ve yazma ⇒ Scenario and writing
Haritaya dön ⇒ Back to map
Haritaya git ⇒ Go to map
Bu ünite kilitli. Açmak için bir önceki ünitenin sınavını geçmelisin. ⇒ This unit is locked. Pass the previous unit's exam to open it.
Bu ünitenin alıştırmaları henüz hazırlanmadı. ⇒ This unit's exercises aren't ready yet.
Aşağıda derslerin hedeflerini görebilirsin. ⇒ You can see the lesson goals below.
Bu ünite seviye tespitiyle atlandı. Emin değilsen doğrudan ünite sınavına girebilir veya dersleri baştan çalışabilirsin. ⇒ This unit was skipped by placement. If you're not sure, take the unit exam or study the lessons from the start.
Başlamaya hazır ⇒ Ready to start
Üniteyi geçtin! ⇒ You passed the unit!
Üniteyi tekrar çalışalım ⇒ Let's study the unit again
Ders tamamlandı! ⇒ Lesson complete!
Eksikler var ⇒ Some gaps
Sınavı bitir ⇒ Finish exam
Çıkarsan bu denemedeki cevapların kaydedilmez. Çıkmak istiyor musun? ⇒ If you quit, this attempt won't be saved. Do you want to quit?
Bu dersin içeriği henüz hazır değil ⇒ This lesson's content isn't ready yet
Bu dersin içeriği henüz hazır değil. ⇒ This lesson's content isn't ready yet.
Ders müfredatta tanımlı, ancak alıştırmaları henüz üretilmedi. ⇒ The lesson is in the curriculum, but its exercises haven't been made yet.
Sonuçların kaydediliyor… ⇒ Saving your results…
Kelimelere sırayla tıkla ⇒ Click the words in order
Anlamını görmek için karta dokun ⇒ Tap the card to see the meaning
İngilizcesini yaz ⇒ Write it in English
İngilizce yaz… ⇒ Write in English…
Önceki hatan ⇒ Your previous mistake
Sınavda anında geri bildirim yoktur. Geçme eşiği ⇒ There's no instant feedback in exams. Pass mark
Hazır derslerin bitti; haritadan bir ünite seç veya bir dersi tekrarla. ⇒ You've finished the available lessons; pick a unit on the map or repeat a lesson.
Sıradaki dersini tamamla. ⇒ Complete your next lesson.
Henüz bir ders yapmadın. ⇒ You haven't done a lesson yet.
Henüz ders yapmadın. ⇒ You haven't done a lesson yet.
Göndermeden önce kendin kontrol et ⇒ Check it yourself before sending
Bu yalnızca temel bir kontroldür. Gramer ve doğallık değerlendirmesi AI öğretmen bağlandığında yapılır. ⇒ This is only a basic check. Grammar and naturalness are evaluated when the AI teacher is connected.
Temel kontrolden geçti ⇒ Passed the basic check

Bugün tekrar edilecek kart yok ⇒ No cards to review today
Bugünün tekrarları bitti! ⇒ Today's reviews are done!
Kart basamakları ⇒ Card stages
Aralıklı tekrar: 1, 3, 7, 14, 30 gün. ⇒ Spaced review: 1, 3, 7, 14, 30 days.
Cevabı göster ⇒ Show answer
Biliyorum ⇒ I know it
Zorlandım ⇒ It was hard
Zor hatırladım ⇒ Barely remembered
Rahat tekrar ettim ⇒ Repeated it easily
Hatalarını telafi et ⇒ Fix your mistakes
Telafi edilecek hatan yok ⇒ No mistakes to fix
Telafi edilecek hatan yok. ⇒ No mistakes to fix.
Derslerde yanlış yaptığın sorular burada toplanır ve sen onları doğru yapana kadar aralıklarla geri gelir. ⇒ Questions you got wrong in lessons collect here and come back at intervals until you get them right.
Dersleri tamamladıkça öğrendiğin kelimeler ve yaptığın hatalar buraya eklenir. ⇒ Words you learn and mistakes you make are added here as you complete lessons.
Akıllı tekrara dön ⇒ Back to smart review
Akıllı tekrara geç ⇒ Go to smart review
Akıllı tekrar → Hata telafisi ⇒ Smart review → Mistake practice
Bu hatalar "Akıllı tekrar → Hata telafisi" bölümüne eklendi. ⇒ These mistakes were added to "Smart review → Mistake practice".
Her oturum 8 sorudur. Her doğru cevap 1 XP. ⇒ Each session has 8 questions. Each correct answer is 1 XP.
Tekrar kartları ⇒ Review cards
Öğrenildi ⇒ Learned
✓ Öğrenildi ⇒ ✓ Learned
öğrenildi ⇒ learned
Öğrenilen kelime ⇒ Words learned
Yeni kelime ⇒ New word
Kelime ara… ⇒ Search words…
Kelime bulunamadı. ⇒ No words found.
Derslerde öğrendiğin kelimeler burada birikir. Liste sen öğrendikçe büyür. ⇒ Words you learn in lessons collect here. The list grows as you learn.
Defterin henüz boş. Kelime derslerini (her ünitenin 3. dersi) tamamladığında kelimeler buraya eklenir. ⇒ Your vocabulary is empty. Words are added when you complete vocabulary lessons (lesson 3 of each unit).
Kişisel notun ⇒ Your note
Hafıza ipucu: ⇒ Memory tip:
Kalıp ⇒ Pattern
Bu kelime defterinde yok. ⇒ This word isn't in your vocabulary.

Dinleme odası ⇒ Listening room
Dinleme odası: dikte ⇒ Listening room: dictation
Dinleme odasına dön ⇒ Back to listening room
Ses ayırt etme ⇒ Sound discrimination
Gölge konuşma ⇒ Shadowing
Cümleyi dinle, duyduğunu yaz. Kulağını ve yazımını birlikte çalıştırır. ⇒ Listen to the sentence and write what you hear. Trains your ear and spelling together.
Cümleyi dinle ve aynı ritimle yüksek sesle tekrar et. Kendini değerlendir. ⇒ Listen to the sentence and repeat it aloud with the same rhythm. Rate yourself.
ship / sheep gibi birbirine benzeyen kelimelerden hangisini duyduğunu seç. ⇒ Choose which of two similar words (like ship / sheep) you hear.
Bu öz değerlendirmedir; uygulama sesini dinlemez. ⇒ This is a self-assessment; the app doesn't listen to your voice.
Metni göster ⇒ Show text
metni göster ⇒ show text
Duyduğun: ⇒ You heard:
Henüz dinleme cümlesi yok. ⇒ No listening sentences yet.
Bir dikte veya ses ayırt etme oturumu. ⇒ A dictation or sound discrimination session.
Ses, bilgisayarın kendi sesidir; gerçek bir konuşma kaydı değildir. ⇒ The voice is your computer's own voice, not a real recording.
Bilgisayarın kendi sesleriyle çalışıyor. Bu gerçek bir insan kaydı değildir. ⇒ Uses your computer's own voices. This isn't a real human recording.
Sesler bilgisayarın kendi İngilizce sesiyle üretilir; gerçek insan kaydı değildir. Telaffuzun dinlenmez ve puanlanmaz. ⇒ Audio is produced by your computer's English voice, not a human recording. Your pronunciation isn't recorded or scored.
Bu bilgisayarda seslendirme bulunamadı. "Metni göster" ile devam edebilirsin. ⇒ No voice found on this computer. Continue with "Show text".
Bu bilgisayarda seslendirme bulunamadı; dinleme alıştırmalarında metin gösterilebilir. ⇒ No voice found on this computer; listening exercises can show the text.
Bu bilgisayarda İngilizce ses bulunamadı. Dikte ve gölge konuşmada "metni göster" ile devam edebilirsin. ⇒ No English voice found on this computer. Use "show text" in dictation and shadowing.
Dinleme kaynaklı hatalar ⇒ Listening mistakes

AI yazı değerlendirmesi ⇒ AI writing feedback
AI öğretmenle konuşma ⇒ Conversation with the AI teacher
AI öğretmen bağlı. ⇒ AI teacher connected.
AI öğretmen henüz bağlı değil. ⇒ AI teacher isn't connected yet.
Canlı AI öğretmen bağlı değil. ⇒ Live AI teacher isn't connected.
Canlı konuş ⇒ Talk live
Konuşma pratiği ⇒ Speaking practice
Konuşma senaryoları ⇒ Speaking scenarios
Konuşma tamamlandı ⇒ Conversation complete
Sohbete hazır mısın? ⇒ Ready to chat?
Öğretmen yazıyor… ⇒ Teacher is typing…
Öğretmenin: ⇒ Your teacher:
Yazı değerlendirmesi ⇒ Writing feedback
Değerlendir ⇒ Evaluate
Değerlendiriliyor… ⇒ Evaluating…
Düzeltmeler ⇒ Corrections
Bugünkü hak doldu ⇒ Today's allowance is used up
Hazır diyalog pratiği ⇒ Ready-made dialogue practice
Bağlanana kadar hazır diyaloglarla pratik yapabilirsin. ⇒ Until it's connected, you can practise with ready-made dialogues.
Bu derste hazır diyalog pratiği yapacaksın. AI bağlandığında aynı senaryoyu öğretmenle canlı konuşabileceksin. ⇒ In this lesson you'll practise a ready-made dialogue. When AI is connected you can do the same scenario live with the teacher.
Bu yazılı bir konuşma pratiğidir; telaffuz ve akıcılık ölçülmez. ⇒ This is written speaking practice; pronunciation and fluency aren't measured.
Dört öğretmen aynı profili ve ilerlemeni paylaşır. ⇒ All four teachers share the same profile and progress.

Görünümü kendine göre düzenle. Değişiklikler anında uygulanır ve hesabına kaydedilir. ⇒ Customise the look. Changes apply instantly and are saved to your account.
Tema ⇒ Theme
Temanın rengi ⇒ Theme colour
Vurgu rengi ⇒ Accent colour
Özel renk ⇒ Custom colour
Okunabilirlik ve efektler ⇒ Readability and effects
Yazı ve arayüz boyutu ⇒ Text and interface size
Bütün ekranı büyütür veya küçültür. ⇒ Makes the whole screen bigger or smaller.
Ölçek ⇒ Scale
Animasyonlar ⇒ Animations
Kapatırsan geçişler ve hareketli öğeler durur. ⇒ Turning this off stops transitions and moving elements.
Ses efektleri ⇒ Sound effects
Doğru, yanlış ve ders bitişi sesleri. ⇒ Sounds for correct, wrong and lesson finished.
Verilerim ve uygulama ⇒ My data and app
Verilerimi dışa aktar ⇒ Export my data
Yedek dosyası indirildi. ⇒ Backup file downloaded.
Servis durumu ⇒ Service status
Uygulama dili ⇒ App language
🌐 Uygulama dili ⇒ 🌐 App language
Menüler ve düğmeler bu dilde görünür. Ders açıklamaları Türkçe kalır. ⇒ Menus and buttons appear in this language. Lesson explanations stay in Turkish.
Neon ⇒ Neon
Gece Yeşili ⇒ Night Green
Zümrüt ⇒ Emerald
Gök ⇒ Sky
Kırmızı ⇒ Red
Sarı ⇒ Yellow
Yeşil ⇒ Green
Altın ⇒ Gold

Giriş yap ⇒ Sign in
Kayıt ol ⇒ Sign up
Hesap oluştur ⇒ Create account
Hesabımı oluştur ⇒ Create my account
Adın ⇒ Your name
Görünen ad ⇒ Display name
E-posta ⇒ Email
Şifre ⇒ Password
Şifren ⇒ Your password
Lütfen adını yaz. ⇒ Please enter your name.
Ad boş olamaz. ⇒ Name can't be empty.
Geçerli bir e-posta adresi yaz. ⇒ Enter a valid email address.
Şifre en az 6 karakter olmalı. ⇒ Password must be at least 6 characters.
Yeni şifre en az 6 karakter olmalı. ⇒ New password must be at least 6 characters.
E-posta veya şifre hatalı. ⇒ Wrong email or password.
Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene. ⇒ An account with this email already exists. Try signing in.
Mevcut şifre hatalı. ⇒ Current password is wrong.
Şifre hatalı. Hesap silinmedi. ⇒ Wrong password. Account not deleted.
Oturum bulunamadı. Lütfen yeniden giriş yap. ⇒ Session not found. Please sign in again.
Türkçe açıklamalarla, adım adım İngilizce. A1'den B2'ye 42 ünite, 210 ders. ⇒ English step by step, explained in Turkish. 42 units and 210 lessons from A1 to B2.
A1'den B2'ye 4 seviye, 42 ünite, 210 ders. ⇒ 4 levels from A1 to B2, 42 units, 210 lessons.
İlerlemen hesabına kaydedilir. ⇒ Your progress is saved to your account.
Bulut hesabı henüz bağlı olmadığı için hesap ve ilerleme yalnızca bu bilgisayarda saklanır. E-posta doğrulaması ve şifre sıfırlama bu modda yoktur; şifreni unutma. ⇒ The cloud account isn't connected yet, so your account and progress are only stored on this computer. There's no email verification or password reset in this mode — don't forget your password.
We Can açılıyor… ⇒ We Can is starting…
Uygulama başlatılamadı. ⇒ The app couldn't start.
Beklenmeyen bir hata oluştu. ⇒ An unexpected error occurred.
İşlem tamamlanamadı. ⇒ The action couldn't be completed.

Not defterim ⇒ My notebook
Yeni not ⇒ New note
Henüz notun yok ⇒ No notes yet
Başlıksız ⇒ Untitled
Başlık (ör. Kısa cevaplar) ⇒ Title (e.g. Short answers)
Öğrendiklerini kendi cümlelerinle not al. ⇒ Write down what you learn in your own words.
Öğrendiğin kuralları, kalıpları ve kendi örnek cümlelerini kendi sözlerinle yaz. ⇒ Write the rules, patterns and your own example sentences in your own words.
Bir kuralı kendi cümlelerinle yazmak, onu hatırlamanın en iyi yollarından biridir. ⇒ Writing a rule in your own words is one of the best ways to remember it.
+ Kişisel not ekle ⇒ + Add a personal note
Etiket: ⇒ Tag:

Gelişim tablosu ⇒ Progress table
Genel doğruluk ⇒ Overall accuracy
Beceri doğruluğu ⇒ Skill accuracy
Beceri bazında sonuç ⇒ Results by skill
Ortalama başarı ⇒ Average score
Son denemeler ⇒ Recent attempts
Son XP hareketleri ⇒ Recent XP
Son 7 gün XP ⇒ XP in last 7 days
Son 30 günün XP'si ⇒ XP over the last 30 days
Son 8 haftanın XP'si ⇒ XP over the last 8 weeks
Günlük çalışma süresi (dakika, son 14 gün) ⇒ Daily study time (minutes, last 14 days)
İlerleme ⇒ Progress
Şu an ⇒ Now
Şu anki seviye ⇒ Current level
Yüzdeler alıştırmalardaki doğruluk oranındır. *Konuşma yazılı pratikle ölçülür; telaffuz ve akıcılık ölçülmez. ⇒ Percentages are accuracy in exercises. *Speaking is measured through written practice; pronunciation and fluency aren't measured.
*Konuşma yazılı pratikle ölçülür; telaffuz ve akıcılık ölçülmez. ⇒ *Speaking is measured through written practice; pronunciation and fluency aren't measured.
Henüz XP kazanmadın. İlk dersini tamamla! ⇒ You haven't earned XP yet. Complete your first lesson!
Rozetler ⇒ Badges
Ulaşıldı ⇒ Reached
Az kaldı ⇒ Almost there
Serini başlat! ⇒ Start your streak!

Çalışma modu: yerel. ⇒ Mode: local.
Çalışma modu: bulut. ⇒ Mode: cloud.
Çevrim içi ⇒ Online
Çalışıyor ⇒ Working
bağlı ⇒ connected
bağlı değil ⇒ not connected
Bağlı değil ⇒ Not connected
İnternet bağlantısı ⇒ Internet connection
Bulut hesabı (Supabase) ⇒ Cloud account (Supabase)
AI öğretmen (Gemini, sunucu üzerinden) ⇒ AI teacher (Gemini, via server)
Sesli konuşma ve telaffuz ölçümü ⇒ Voice conversation and pronunciation scoring
Yerel modda internet gerekmez. Bulut modunda zorunludur. ⇒ Local mode doesn't need internet. Cloud mode does.
Veriler bu bilgisayarda. AI öğretmen bağlı değil. ⇒ Data is on this computer. AI teacher isn't connected.
Ölçülmeyenler: ⇒ Not measured:
kurulu sürüm ⇒ installed version
geliştirme sürümü ⇒ development version
Bilgi alınamadı ⇒ Couldn't get info
Masaüstü kabuğu dışında çalışıyor (test ortamı) ⇒ Running outside the desktop shell (test environment)
Test araçları (yalnızca yerel mod) ⇒ Test tools (local mode only)
Test: bekleyen kartları bugüne çek ⇒ Test: move pending cards to today
Tekrarları bugüne çek ⇒ Move reviews to today
Bekleyen tekrarların tarihi bugüne çekildi. "Günlük tekrar" ekranından deneyebilirsin. ⇒ Pending reviews were moved to today. Try them in "Daily review".
Yok. Konuşma pratiği yazılı yapılır; telaffuz ve akıcılık ölçülmez. ⇒ No. Speaking practice is written; pronunciation and fluency aren't measured.
dk ⇒ min
dk / ⇒ min /
dk · ⇒ min ·
dk = ⇒ min =
gün × ⇒ days ×
gün. Her gün en az bir ders veya tekrar yap. ⇒ days. Do at least one lesson or review every day.
Sıradaki: ⇒ Next:
Sıradaki hedef: ⇒ Next goal:
Son 7 günün XP'si · En uzun seri: ⇒ XP in the last 7 days · Longest streak:
Kelime Avı ile harflerden kelime bul. ⇒ Find words from letters in Word Hunt.
· Ders ⇒ · Lesson
ünite · ⇒ units ·
ünite ⇒ units
ders ⇒ lessons
ünitenin alıştırmaları hazır. Diğer ünitelerin hedeflerini görebilirsin; içerikleri eklendikçe açılır. ⇒ units have exercises ready. You can see the goals of the other units; they open as content is added.
Bugünkü konuşma hakkın: ⇒ Today's conversation allowance:
Bugünkü hakkın: ⇒ Today's allowance:
. AI öğretmen hatalarını Türkçe açıklar. ⇒ . The AI teacher explains your mistakes in Turkish.
Gramer öğretmeni ⇒ Grammar teacher
Konuşma öğretmeni ⇒ Speaking teacher
Dinleme ve okuma öğretmeni ⇒ Listening & reading teacher
Sınav öğretmeni ⇒ Exam teacher
Sunucuya bağlanılamadı. İnternet bağlantını kontrol et. ⇒ Couldn't reach the server. Check your internet connection.
Açık ⇒ On
We Can sürüm ⇒ We Can version
. Görünüm ayarların hesabına kaydedilir; aynı bilgisayardaki diğer hesapları etkilemez. ⇒ . Appearance settings are saved to your account and don't affect other accounts on this computer.
Değiştir ⇒ Change
Üyelik: ⇒ Member since:
XP kaldı ⇒ XP to go
Planın: ⇒ Your plan:
. Hazır dersler sınırsızdır. ⇒ . Built-in lessons are unlimited.
AI ile konuşma dersi: bugün ⇒ AI conversation lessons: today
AI yazı değerlendirmesi: bugün ⇒ AI writing feedback: today
Ücretsiz planda günde ⇒ The free plan includes, per day,
konuşma dersi ve ⇒ conversation lessons and
yazı değerlendirmesi. AI öğretmen şu an ⇒ writing reviews. The AI teacher is currently
Bu haftanın hedefi: ⇒ This week's goal:
Bugün: ⇒ Today:
Tekrar ve ünite değerlendirmesi ⇒ Review and unit assessment
Kelime ve okuma ⇒ Vocabulary and reading
: doğru yerde · ⇒ : right spot ·
: kelimede var, yeri yanlış · Gri: yok. ⇒ : in the word, wrong spot · Grey: not in the word.
. gün · ⇒ . day ·
cümle dinleyeceksin; her birinde duyduğunu yaz. Doğru yazdığın her kelime 1 puan. ⇒ sentences to listen to; write what you hear each time. Each correct word is 1 point.
Canlı yayındasın! Sohbetten gelen mesajlara en doğal İngilizce cevabı ⇒ You're live! Pick the most natural English reply to chat messages within
saniye içinde seç. ⇒ seconds.
Kazanım: ⇒ Outcome:
ünitesine dön ⇒ unit
boss savaşı ⇒ boss battle
Ünitenin sorularıyla ⇒ Beat
'ı yen. Her doğru cevap boss'a vurur; yanlış cevap ya da süre bitişi bir kalbine mal olur. 3 kalbin var, soru başına ⇒ with this unit's questions. Each correct answer hits the boss; a wrong answer or running out of time costs a heart. You have 3 hearts, per question:
Bugün 1 ders tamamla ⇒ Complete 1 lesson today
Bugün 10 dakika çalış ⇒ Study 10 minutes today
Bugün 20 XP kazan ⇒ Earn 20 XP today
Heathrow Havalimanı ⇒ Heathrow Airport
Otel ve kahvaltı ⇒ Hotel and breakfast
Şehirde kayboldun ⇒ Lost in the city
Camden Market ⇒ Camden Market
Yeni arkadaşlar ⇒ New friends
Sürpriz iş görüşmesi ⇒ Surprise job interview
Veda ve dönüş ⇒ Goodbye and home
Kafede sipariş ⇒ Ordering at a café
Yayın başlangıcı ⇒ Stream intro
İş görüşmesi ⇒ Job interview
Havalimanında rötar ⇒ Delay at the airport
Oyun ve yayın İngilizcesi ⇒ Gaming & streaming English
İş görüşmesi İngilizcesi ⇒ Job interview English
Seyahat ve havalimanı ⇒ Travel and airport
Oyunlarda, yayınlarda ve montaj videolarında sık geçen kelimeler. ⇒ Words that come up a lot in games, streams and edits.
Mülakatlarda en çok kullanılan sorular ve cevap kalıpları. ⇒ The most common interview questions and answer patterns.
Havalimanı, otel ve şehirde işine yarayacak kalıplar. ⇒ Useful phrases for airports, hotels and the city.
İngiliz ⇒ British
Amerikan ⇒ American
Avustralya ⇒ Australian
İngiliz (Birmingham) ⇒ British (Birmingham)
İngiliz/Amerikan ⇒ British/American
İlk adım ⇒ First step
İlk dersini tamamladın. ⇒ You completed your first lesson.
Bir dersi %100 doğrulukla bitirdin. ⇒ You finished a lesson with 100% accuracy.
Ünite tamam ⇒ Unit complete
Bir ünite sınavını geçtin. ⇒ You passed a unit exam.
3 günlük seri ⇒ 3-day streak
Üç gün üst üste çalıştın. ⇒ You studied three days in a row.
7 günlük seri ⇒ 7-day streak
Bir hafta boyunca her gün çalıştın. ⇒ You studied every day for a week.
30 günlük seri ⇒ 30-day streak
Bir ay boyunca her gün çalıştın. ⇒ You studied every day for a month.
Toplam 50 XP topladın. ⇒ You've earned 50 XP in total.
Toplam 200 XP topladın. ⇒ You've earned 200 XP in total.
Toplam 1000 XP topladın. ⇒ You've earned 1000 XP in total.
Kelime avcısı ⇒ Word hunter
Kelime defterinde 10 kelime birikti. ⇒ 10 words in your vocabulary.
Kelime koleksiyoncusu ⇒ Word collector
Kelime defterinde 25 kelime birikti. ⇒ 25 words in your vocabulary.
Hatadan ders ⇒ Learning from mistakes
Hatalarını ilk kez telafi ettin. ⇒ You fixed your mistakes for the first time.
Kulak dolgunluğu ⇒ Good ear
Dinleme odasında ilk oturumunu bitirdin. ⇒ You finished your first listening room session.
Not alan öğrenci ⇒ Note-taker
Not defterine ilk notunu yazdın. ⇒ You wrote your first note.
Toplam 60 dakika çalıştın. ⇒ You've studied 60 minutes in total.
Yolunu çizdin ⇒ You found your path
Seviye tespit sınavını tamamladın. ⇒ You completed the placement test.
Tanışma ve kişisel bilgiler ⇒ Introductions and personal info
Ailem ve eşyalarım ⇒ My family and things
Sayılar, saat ve tarih ⇒ Numbers, time and dates
Günlük rutin ⇒ Daily routine
Sorular, olumsuzlar ve sevdiklerimiz ⇒ Questions, negatives and likes
Ev ve şehir ⇒ Home and city
Yeme içme ve alışveriş ⇒ Food, drink and shopping
Yön, ulaşım ve yetenekler ⇒ Directions, transport and abilities
Geçmişte ne oldu (1) ⇒ What happened (1)
Geçmişte ne oldu (2) ⇒ What happened (2)
Şu an ve genelde ⇒ Now and in general
Planlar ve davetler ⇒ Plans and invitations
Karşılaştırma ⇒ Comparisons
Kurallar, zorunluluk ve tavsiye ⇒ Rules, obligation and advice
İş ve günlük yazışmalar ⇒ Work and everyday messages
Fikir belirtme ve gerekçe sunma ⇒ Giving opinions and reasons
Present Perfect ve Past Simple ⇒ Present Perfect and Past Simple
Ne zamandır? ⇒ How long?
Geçmişi anlatma ⇒ Talking about the past
Gelecek biçimleri ⇒ Future forms
Koşullar ve pazarlık ⇒ Conditions and negotiating
Zorunluluk, izin ve olasılık ⇒ Obligation, permission and possibility
Edilgen yapı ve ilan dili ⇒ Passive voice and ad language
Tarif etme ve tanımlama ⇒ Describing and defining
Söylenenleri aktarma ⇒ Reported speech
Fiil kalıpları ⇒ Verb patterns
Bağlantılı konuşma ve yazma ⇒ Connected speech and writing
Anlatı zamanları ve zaman uyumu ⇒ Narrative tenses and sequence
Geleceğe bakış ⇒ Looking ahead
Koşul cümleleri 0–3 ⇒ Conditionals 0–3
Karma koşullar ve dilekler ⇒ Mixed conditionals and wishes
Geçmişe dair çıkarım ve eleştiri ⇒ Past deduction and criticism
İleri edilgen ve ettirgen yapılar ⇒ Advanced passive and causative
Aktarma fiilleri ve raporlama ⇒ Reporting verbs
Yoğun ve akıcı anlatım ⇒ Dense and fluent expression
Gelişmiş bağlaçlar ve tartışma ⇒ Advanced linkers and debate
Phrasal verbs ve collocations ⇒ Phrasal verbs and collocations
Deyimler ve üslup ⇒ Idioms and style
İş ve Emlak ⇒ Work and real estate
Akıcılık, sunum ve problem çözme ⇒ Fluency, presenting and problem solving
— düzenli ilerleme için çok iyi. ⇒ — great for steady progress.
— küçük ama düzenli adımlar da işe yarar. ⇒ — small but regular steps work too.
— sağlam bir başlangıç. ⇒ — a solid start.
isim ⇒ noun
fiil ⇒ verb
sıfat ⇒ adjective
zarf ⇒ adverb
edat ⇒ preposition
bağlaç ⇒ conjunction
zamir ⇒ pronoun
ifade ⇒ phrase
deyim ⇒ idiom
öbek fiil ⇒ phrasal verb
bağlaç öbeği ⇒ conjunction phrase
edat öbeği ⇒ prepositional phrase
edat/sıfat ⇒ preposition/adjective
fiil/isim ⇒ verb/noun
fiil/sıfat ⇒ verb/adjective
isim/fiil ⇒ noun/verb
isim/sıfat ⇒ noun/adjective
isim/zarf ⇒ noun/adverb
kalıp ⇒ pattern
sıfat/fiil ⇒ adjective/verb
Meyveler ⇒ Fruits
Sebzeler ⇒ Vegetables
Hayvanlar ⇒ Animals
Ülkeler ⇒ Countries
Renkler ⇒ Colours
Vücut ⇒ The body
Yiyecek ve içecek ⇒ Food and drink
Giysiler ⇒ Clothes
Meslekler ⇒ Jobs
Aile ⇒ Family
Ev ve eşyalar ⇒ Home
Mutfak ⇒ Kitchen
Hava durumu ⇒ Weather
Ulaşım ⇒ Transport
Duygular ⇒ Feelings
Okul ⇒ School
Doğa ⇒ Nature
Müzik aletleri ⇒ Instruments
Şehirde yerler ⇒ Places in town
Günlük fiiller ⇒ Everyday verbs
Şekiller ve sayılar ⇒ Shapes and numbers
Kategoriler ⇒ Categories
Ülkeler, meyveler… ⇒ Countries, fruits…
Bir konu seç: önce kelimelere göz at, sonra emojiden İngilizcesini seç ya da Türkçesinden İngilizcesini yaz. Her turda 10 soru. ⇒ Pick a topic: look through the words, then choose the English from the emoji or type the English from the Turkish. 10 questions per round.
🎯 Seçmeli oyna ⇒ 🎯 Multiple choice
⌨️ Yazarak oyna ⇒ ⌨️ Type the answer
İngilizcesini yaz… ⇒ Type the English…
Başka kategori ⇒ Another category
seçmeli ⇒ multiple choice
yazarak ⇒ typing
Günaydın ⇒ Good morning
İyi günler ⇒ Good afternoon
İyi akşamlar ⇒ Good evening
İyi geceler ⇒ Good night
📍 İstanbul · Hava durumu ⇒ 📍 Istanbul · Weather
`;

const PATTERNS = `
Aralıklı tekrar: {} gün. Bildiğin kart bir sonraki aralığa geçer. ⇒ Spaced review: {} days. Cards you know move to the next interval.
Bugün {} dakika çalıştın. ⇒ You studied {} minutes today.
Cevap: {} ⇒ Answer: {}
Ders {} ⇒ Lesson {}
Ders: {} ⇒ Lesson: {}
Doğrusu: {} ⇒ Correct: {}
Doğruluğun %{}: dersleri tekrar etmek ve hata telafisi yapmak iyi olur. ⇒ Your accuracy is {}%: repeating lessons and fixing mistakes will help.
Doğruluğun %{}: hatalarını telafi ederek %85'e çıkabilirsin. ⇒ Your accuracy is {}%: fix your mistakes to reach 85%.
Doğruluğun %{}: çok iyi, bir sonraki üniteye hazırsın. ⇒ Your accuracy is {}%: great, you're ready for the next unit.
En çok gelişmeye açık becerin: {}. ⇒ Skill with most room to grow: {}.
En çok zorlandığın konu: {}. Bu ünitenin gramer dersini tekrar et. ⇒ Hardest topic for you: {}. Repeat this unit's grammar lesson.
Geçen haftadan {} dakika az çalıştın; hafta bitmeden telafi edebilirsin. ⇒ You studied {} minutes less than last week; you can catch up before the week ends.
Geçen haftaya göre {} dakika daha fazla çalıştın. ⇒ You studied {} more minutes than last week.
Günlük hedef: {} dakika ⇒ Daily goal: {} minutes
Hafta başı: {} ⇒ Week starting: {}
Planladığın {} günün {} gününde çalıştın. ⇒ You studied on {1} of your {0} planned days.
Senaryo alanı: {} ⇒ Scenario: {}
Sonraki tekrar: {} ⇒ Next review: {}
Sıradaki tekrar: {} ({} kart). ⇒ Next review: {} ({} cards).
Toplam {} XP · {} ders tamamlandı. ⇒ {} XP total · {} lessons completed.
Yanlış yaptığın {} soruyu gerçek alıştırma olarak yeniden çöz. ⇒ Solve the {} questions you got wrong again as real exercises.
Zayıf alan · {} ⇒ Weak area · {}
güncelleme: {} ⇒ updated: {}
{} / {} rozet kazanıldı ⇒ {} / {} badges earned
{} / {} rozet kazanıldı. ⇒ {} / {} badges earned.
{} aktif gün ⇒ {} active days
{} arkadaş olarak eklendi! ⇒ {} was added as a friend!
{} açık hatayı "Hatalarını telafi et" ile çalış (her turda en fazla {} soru). ⇒ Practise {} open mistakes with "Fix your mistakes" (up to {} questions per round).
{} cevap ⇒ {} answers
{} ders + {} görev ⇒ {} lessons + {} tasks
{} gün ⇒ {} days
{} gün kaldı ⇒ {} days left
{} günlük serin var! ⇒ You're on a {}-day streak!
{} kart ve {} hata seni bekliyor. ⇒ {} cards and {} mistakes are waiting for you.
{} tekrar kartı ⇒ {} review cards
{} ünite geçildi ⇒ {} units passed
{}. gün tamamlandı! ⇒ Day {} complete!
{}. gün ⇒ Day {}
{}. gün: {} ⇒ Day {}: {}
{}. güne geç ⇒ Go to day {}
{}/{} görüldü · Türkçe anlam ve örnek cümle ⇒ {}/{} seen · Turkish meaning and example sentence
· yine de {} dk çalıştın 💪 ⇒ · you still studied {} min 💪
· {} aksanı ⇒ · {} accent
· {} kart ⇒ · {} cards
· {} yeni kelime ⇒ · {} new words
Ünite sınavı: %{}. Bir sonraki ünitenin kilidi açıldı. ⇒ Unit exam: {}%. The next unit is unlocked.
Şu anki seviyen: {} ⇒ Your current level: {}
🔥 {} gün ⇒ 🔥 {} days
{} dk ⇒ {} min
{} dakika ⇒ {} minutes
{} sn ⇒ {} s
{} puan ⇒ {} points
Rekor {} ⇒ Best {}
Rekorun: {} ⇒ Your best: {}
Yeni rekor! ⇒ New record!
Soru {}/{} ⇒ Question {}/{}
Cümle {} / {} ⇒ Sentence {} / {}
{} doğru ⇒ {} correct
{} / {} kelime ⇒ {} / {} words
{} / {} doğru altyazı ⇒ {} / {} correct subtitles
{} / {} puan ⇒ {} / {} points
{} replik ⇒ {} lines
Rüzgar {} km/s ⇒ Wind {} km/h
Veri: Open-Meteo · {} ⇒ Data: Open-Meteo · {}
{} kelime · {} ⇒ {} words · {}
{} ifade · {}+ ⇒ {} phrases · {}+
{} · {} ⇒ {} · {}
Ders {} · {} ⇒ Lesson {} · {}
Lesson {} · {} ⇒ Lesson {} · {}
{}: {} XP ⇒ {}: {} XP
Sıradaki: {} · {} XP kaldı ⇒ Next: {} · {} XP to go
{} XP ⇒ {} XP
Hafta başı: {} ⇒ Week of {}
Bu haftanın hedefi: {} gün × {} dk = {} dakika ⇒ This week's goal: {} days × {} min = {} minutes
Bugün: {} / {} dk ⇒ Today: {} / {} min
{} ünitesine dön ⇒ Back to unit {}
{} boss savaşı ⇒ {} boss battle
{} yenildi! ⇒ {} defeated!
Seri {} · En iyi {} ⇒ Streak {} · Best {}
`;

function parse(text: string): [string, string][] {
  return text.split('\n').map((l) => l.trim()).filter((l) => l.includes(' ⇒ ')).map((l) => {
    const i = l.indexOf(' ⇒ ');
    return [l.slice(0, i).trim(), l.slice(i + 3).trim()] as [string, string];
  });
}

export const EN_STRINGS = parse(RAW);
export const EN_PATTERNS = parse(PATTERNS).map(([tr, en]) => {
  // "{0}" / "{1}" biçimindeki sıralı yer tutucuları destekle
  return [tr, en] as [string, string];
});
