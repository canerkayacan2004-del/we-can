// Hava durumu: İstanbul'un havası İngilizce kelimelerle (Open-Meteo, ücretsiz, anahtar gerektirmez). 30 dakikada bir yenilenir.
import { useEffect, useRef, useState } from 'react';
import { uiLocale } from '../lib/i18n.ts';
import { speak } from '../lib/tts.ts';
import { cx } from './ui.tsx';

const CITY = { name: 'İstanbul', lat: 41.01, lon: 28.98 };
const CACHE_KEY = 'wecan.weather.v1';
const TTL = 30 * 60 * 1000;

/** WMO hava kodu → emoji, İngilizce, Türkçe */
export function describeWeather(code: number, isDay = true): { emoji: string; en: string; tr: string } {
  if (code === 0) return isDay ? { emoji: '☀️', en: 'sunny', tr: 'güneşli' } : { emoji: '🌙', en: 'clear', tr: 'açık' };
  if (code === 1 || code === 2) return { emoji: isDay ? '🌤️' : '☁️', en: 'partly cloudy', tr: 'parçalı bulutlu' };
  if (code === 3) return { emoji: '☁️', en: 'cloudy', tr: 'bulutlu' };
  if (code === 45 || code === 48) return { emoji: '🌫️', en: 'foggy', tr: 'sisli' };
  if (code >= 51 && code <= 57) return { emoji: '🌦️', en: 'drizzly', tr: 'çiseli' };
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { emoji: '🌧️', en: 'rainy', tr: 'yağmurlu' };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { emoji: '❄️', en: 'snowy', tr: 'karlı' };
  if (code >= 95) return { emoji: '⛈️', en: 'stormy', tr: 'fırtınalı' };
  return { emoji: '🌡️', en: 'mild', tr: 'ılıman' };
}

export function tempWord(t: number): { en: string; tr: string } {
  if (t <= 0) return { en: 'freezing', tr: 'dondurucu' };
  if (t <= 9) return { en: 'cold', tr: 'soğuk' };
  if (t <= 17) return { en: 'cool', tr: 'serin' };
  if (t <= 24) return { en: 'warm', tr: 'ılık' };
  return { en: 'hot', tr: 'sıcak' };
}

interface WeatherData {
  at: number;
  current: { temp: number; code: number; wind: number; isDay: boolean };
  days: { date: string; code: number; max: number; min: number }[];
}

async function fetchWeather(): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${CITY.lat}&longitude=${CITY.lon}`
    + '&current=temperature_2m,weather_code,wind_speed_10m,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=3';
  const res = await fetch(url);
  if (!res.ok) throw new Error('weather');
  const j = await res.json();
  return {
    at: Date.now(),
    current: { temp: Math.round(j.current.temperature_2m), code: j.current.weather_code, wind: Math.round(j.current.wind_speed_10m), isDay: j.current.is_day === 1 },
    days: j.daily.time.map((d: string, i: number) => ({ date: d, code: j.daily.weather_code[i], max: Math.round(j.daily.temperature_2m_max[i]), min: Math.round(j.daily.temperature_2m_min[i]) })),
  };
}

function readCache(): WeatherData | null {
  try { const v = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); return v && typeof v.at === 'number' ? v : null; } catch { return null; }
}

export function WeatherChip() {
  const [data, setData] = useState<WeatherData | null>(readCache);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    const load = () => {
      const c = readCache();
      if (c && Date.now() - c.at < TTL) { setData(c); return; }
      fetchWeather().then((d) => { if (!alive) return; setData(d); try { localStorage.setItem(CACHE_KEY, JSON.stringify(d)); } catch { /* yoksay */ } }).catch(() => { /* çevrim dışı: eski veri kalır */ });
    };
    load();
    const t = window.setInterval(load, 5 * 60 * 1000);
    return () => { alive = false; window.clearInterval(t); };
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [open]);

  if (!data) return null;
  const now = describeWeather(data.current.code, data.current.isDay);
  const feel = tempWord(data.current.temp);
  const sentence = `It's ${now.en} and ${feel.en} in Istanbul today.`;

  return (
    <div ref={box} className="relative">
      <button type="button" onClick={() => setOpen(!open)} data-weather title={`${CITY.name}: ${now.tr}, ${data.current.temp}°C`}
        className={cx('flex items-center gap-1.5 rounded-full border border-line bg-panel-2 px-3 py-1 text-sm hover:border-acc/40', open && 'border-acc/50')}>
        <span aria-hidden="true">{now.emoji}</span>
        <span lang="en" className="font-semibold capitalize text-fg">{now.en}</span>
        <span className="font-mono-num font-black text-acc">{data.current.temp}°C</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-80 rounded-2xl border border-line bg-panel p-4 shadow-2xl" data-weather-panel>
          <p className="text-xs font-bold uppercase tracking-wide text-fg-3">📍 {CITY.name} · Hava durumu</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-5xl leading-none">{now.emoji}</span>
            <div>
              <p className="text-3xl font-black text-fg">{data.current.temp}°C</p>
              <p className="text-sm text-fg-2">Rüzgar {data.current.wind} km/s</p>
            </div>
          </div>
          <div className="mt-3 rounded-xl bg-panel-2 p-3">
            <div className="flex items-start gap-2">
              <button type="button" className="rounded-lg bg-panel-3 px-2 py-1 text-acc hover:brightness-125" onClick={() => speak(sentence)} title="Dinle">🔊</button>
              <div>
                <p lang="en" className="font-semibold text-fg">{sentence}</p>
                <p className="text-xs text-fg-3">Bugün İstanbul'da hava {now.tr} ve {feel.tr}.</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-fg-2">
              <b lang="en" className="text-acc">{now.en}</b> = {now.tr} · <b lang="en" className="text-acc">{feel.en}</b> = {feel.tr}
            </p>
          </div>
          <ul className="mt-3 grid grid-cols-3 gap-2 text-center">
            {data.days.map((d) => {
              const w = describeWeather(d.code);
              return (
                <li key={d.date} className="rounded-xl border border-line p-2" data-weather-day>
                  <p className="text-xs text-fg-3">{new Date(`${d.date}T12:00:00`).toLocaleDateString(uiLocale(), { weekday: 'short' })}</p>
                  <p className="text-2xl">{w.emoji}</p>
                  <p lang="en" className="text-[0.7rem] font-semibold text-fg">{w.en}</p>
                  <p className="font-mono-num text-xs text-fg-2">{d.max}° / {d.min}°</p>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-[0.65rem] text-fg-3">Veri: Open-Meteo · {new Date(data.at).toLocaleTimeString(uiLocale(), { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      )}
    </div>
  );
}
