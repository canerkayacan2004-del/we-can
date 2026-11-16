// Kayıt (onboarding) ve Profil ekranının ortak tercih alanları.
import type { StudyTime } from '@core/types.ts';
import { Icon } from './Icon.tsx';
import { cx } from './ui.tsx';

export const GOALS = [
  'Günlük hayatta rahat konuşmak',
  'Seyahatte derdimi anlatmak',
  'İş hayatında kullanmak',
  'Sınava veya okula hazırlanmak',
  'Yurt dışında yaşamak / çalışmak',
  'Dizi, film ve oyunları altyazısız anlamak',
];

export const INTERESTS = [
  'Günlük sohbet', 'Seyahat', 'İş hayatı', 'Emlak sektörü', 'Teknoloji', 'Sosyal hayat',
  'Sağlık', 'Eğitim', 'Alışveriş', 'Finans', 'Medya ve iletişim', 'Müşteri hizmetleri',
];

export const HOBBIES = [
  'Müzik', 'Film ve dizi', 'Video oyunları', 'Spor', 'Futbol', 'Kitap okumak',
  'Yemek yapmak', 'Fotoğrafçılık', 'Video kurgu', 'Yayın (stream)', 'Sanat ve çizim', 'Moda',
  'Doğa ve kamp', 'Fitness', 'Bilim', 'Tarih', 'Hayvanlar', 'Arabalar',
];

export const MINUTES = [5, 10, 15, 20, 30, 45, 60];

export const WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export const STUDY_TIME_LABELS: Record<StudyTime, { label: string; hint: string }> = {
  morning: { label: 'Sabah', hint: '06–11' },
  noon: { label: 'Öğle', hint: '11–16' },
  evening: { label: 'Akşam', hint: '16–21' },
  night: { label: 'Gece', hint: '21–02' },
  flexible: { label: 'Farketmez', hint: 'Esnek' },
};

export interface ProfileFieldValues {
  goal: string;
  interests: string[];
  hobbies: string[];
  dailyMinutes: number;
  studyDays: number[];
  studyTime: StudyTime;
}

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
}

function Chips({ items, selected, onToggle, name }: { items: string[]; selected: string[]; onToggle: (v: string) => void; name: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button key={item} type="button" data-chip={`${name}:${item}`} aria-pressed={selected.includes(item)}
          className={cx('tile', selected.includes(item) && 'option-selected')} onClick={() => onToggle(item)}>
          {selected.includes(item) && <Icon name="check" size={14} className="mr-1 inline" />}{item}
        </button>
      ))}
    </div>
  );
}

/** Seçilmiş ama listede olmayan (eski sürümden kalan) değerleri de gösterir, kaybolmasınlar. */
function withExtras(base: string[], selected: string[]) {
  return [...base, ...selected.filter((s) => !base.includes(s))];
}

export function ProfileFields({ value, onChange, numbered = false }: { value: ProfileFieldValues; onChange: (v: ProfileFieldValues) => void; numbered?: boolean }) {
  const set = (patch: Partial<ProfileFieldValues>) => onChange({ ...value, ...patch });
  const n = (i: number, text: string) => (numbered ? `${i}. ${text}` : text);
  const weeklyMinutes = value.dailyMinutes * value.studyDays.length;

  return (
    <div className="space-y-4">
      <section className="card">
        <h2 className="mb-3 text-lg font-extrabold">{n(1, 'İngilizceyi en çok ne için istiyorsun?')}</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {GOALS.map((g) => (
            <button key={g} type="button" data-goal={g} className={cx('option', value.goal === g && 'option-selected')} onClick={() => set({ goal: g })}>{g}</button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="mb-1 text-lg font-extrabold">{n(2, 'Hangi konularda İngilizce kullanacaksın?')}</h2>
        <p className="mb-3 text-sm text-fg-2">Birden fazla seçebilirsin. Senaryolar ve kelimeler buna göre ağırlıklandırılır.</p>
        <Chips name="interest" items={withExtras(INTERESTS, value.interests)} selected={value.interests} onToggle={(v) => set({ interests: toggle(value.interests, v) })} />
      </section>

      <section className="card">
        <h2 className="mb-1 text-lg font-extrabold">{n(3, 'Hobilerin neler?')}</h2>
        <p className="mb-3 text-sm text-fg-2">AI öğretmen örnekleri ve kişisel dersleri hobilerine göre hazırlar.</p>
        <Chips name="hobby" items={withExtras(HOBBIES, value.hobbies)} selected={value.hobbies} onToggle={(v) => set({ hobbies: toggle(value.hobbies, v) })} />
      </section>

      <section className="card space-y-4">
        <h2 className="text-lg font-extrabold">{n(4, 'Çalışma düzenin')}</h2>
        <div>
          <p className="label">Hangi günler çalışacaksın?</p>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((d, i) => (
              <button key={d} type="button" data-day={i} aria-pressed={value.studyDays.includes(i)}
                className={cx('tile min-w-14 justify-center', value.studyDays.includes(i) && 'option-selected')}
                onClick={() => {
                  const next = toggle(value.studyDays, i).sort();
                  if (next.length) set({ studyDays: next });
                }}>{d}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="label">Günde ne kadar?</p>
          <div className="flex flex-wrap gap-2">
            {MINUTES.map((m) => (
              <button key={m} type="button" data-minutes={m} className={cx('tile', value.dailyMinutes === m && 'option-selected')} onClick={() => set({ dailyMinutes: m })}>{m} dk</button>
            ))}
          </div>
        </div>
        <div>
          <p className="label">Genelde hangi saatlerde?</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(STUDY_TIME_LABELS) as StudyTime[]).map((t) => (
              <button key={t} type="button" data-study-time={t} className={cx('tile', value.studyTime === t && 'option-selected')} onClick={() => set({ studyTime: t })}>
                {STUDY_TIME_LABELS[t].label} <span className="ml-1 text-xs text-fg-3">{STUDY_TIME_LABELS[t].hint}</span>
              </button>
            ))}
          </div>
        </div>
        <p className="text-sm text-fg-2" data-weekly-total>
          Haftada <b className="text-acc">{value.studyDays.length} gün × {value.dailyMinutes} dk = {weeklyMinutes} dakika</b>
          {weeklyMinutes >= 150 ? ' — düzenli ilerleme için çok iyi.' : weeklyMinutes >= 75 ? ' — sağlam bir başlangıç.' : ' — küçük ama düzenli adımlar da işe yarar.'}
        </p>
      </section>
    </div>
  );
}
