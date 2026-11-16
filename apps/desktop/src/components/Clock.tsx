// Üst çubuk: solda günün saatine göre selamlama, sağda canlı saat ve tarih.
import { useEffect, useState } from 'react';
import { uiLocale } from '../lib/i18n.ts';

function useNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(t); }, []);
  return now;
}

export function greetingFor(hour: number): { text: string; emoji: string } {
  if (hour >= 5 && hour < 12) return { text: 'Günaydın', emoji: '☀️' };
  if (hour >= 12 && hour < 17) return { text: 'İyi günler', emoji: '🌤️' };
  if (hour >= 17 && hour < 22) return { text: 'İyi akşamlar', emoji: '🌆' };
  return { text: 'İyi geceler', emoji: '🌙' };
}

export function Greeting({ name }: { name: string }) {
  const now = useNow();
  const g = greetingFor(now.getHours());
  return (
    <p className="mr-auto truncate font-bold text-fg" data-greeting>
      <span aria-hidden="true">{g.emoji} </span><span>{g.text}</span><span>, </span><span className="text-acc" data-no-translate>{name.split(' ')[0]}</span>
    </p>
  );
}

export function LiveClock() {
  const now = useNow();
  const loc = uiLocale();
  const time = now.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const date = now.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <span className="flex items-center gap-2 rounded-full border border-line bg-panel-2 px-3 py-1 text-sm max-[900px]:hidden" data-clock title={date} data-no-translate>
      <span className="text-fg-2">{date}</span>
      <span className="font-mono-num font-black text-acc" data-clock-time>{time}</span>
    </span>
  );
}
