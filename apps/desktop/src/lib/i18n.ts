// Arayüz dili (TR/EN). Arayüz metinleri Türkçe yazılır; İngilizce seçiliyse ekrandaki metinler sözlükten çevrilir.
// Ders içerikleri (Türkçe açıklamalar) öğrenme amaçlı olduğu için çevrilmez; [lang="en"] ve [data-no-translate] alanlarına dokunulmaz.
import { EN_PATTERNS, EN_STRINGS } from './i18n-en.ts';

export type UiLang = 'tr' | 'en';
let lang: UiLang = 'tr';
let observer: MutationObserver | null = null;

const dict = new Map<string, string>(EN_STRINGS);
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const patterns = [...EN_PATTERNS].sort((a, b) => b[0].replace(/\{\}/g, '').length - a[0].replace(/\{\}/g, '').length).map(([tr, en]) => ({ re: new RegExp('^' + tr.split('{}').map(escapeRe).join('(.+?)') + '$', 's'), en }));

export function uiLang(): UiLang { return lang; }
export function uiLocale(): string { return lang === 'en' ? 'en-GB' : 'tr-TR'; }

/** Tek bir metni çevirir (bulunamazsa olduğu gibi döner). */
export function tr2en(text: string): string {
  const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(text)!;
  const core = m[2];
  if (!core) return text;
  const hit = dict.get(core);
  if (hit !== undefined) return m[1] + hit + m[3];
  for (const p of patterns) {
    const r = p.re.exec(core);
    if (r) {
      let k = 1;
      const val = (i: number) => { const v = r[i] ?? ''; return dict.get(v.trim()) ?? v; };
      const out = p.en.replace(/\{(\d*)\}/g, (_, d: string) => (d ? val(Number(d) + 1) : val(k++)));
      return m[1] + out + m[3];
    }
  }
  return text;
}

/** Bileşenlerden çağrılabilir: dil İngilizceyse çevirir. */
export function t(text: string): string { return lang === 'en' ? tr2en(text) : text; }

const ORIG = Symbol('wcOrig');
const DONE = Symbol('wcDone');
type Tracked = Node & { [ORIG]?: string; [DONE]?: string };
const ATTRS = ['placeholder', 'title', 'aria-label'] as const;

function skipped(el: Element | null): boolean {
  for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
    if (e.tagName === 'SCRIPT' || e.tagName === 'STYLE' || e.tagName === 'TEXTAREA') return true;
    if (e.hasAttribute('data-no-translate')) return true;
    if (e.getAttribute('lang') === 'en') return true;
  }
  return false;
}

function translateText(node: Tracked) {
  const value = node.nodeValue ?? '';
  if (value === node[DONE]) return; // kendi yazdığımız
  node[ORIG] = value;
  const next = tr2en(value);
  node[DONE] = next;
  if (next !== value) node.nodeValue = next;
}

function translateAttrs(el: Element) {
  for (const a of ATTRS) {
    const v = el.getAttribute(a);
    if (!v) continue;
    const key = `data-wc-${a}`;
    if (el.getAttribute(`${key}-en`) === v) continue;
    el.setAttribute(key, v);
    const next = tr2en(v);
    el.setAttribute(`${key}-en`, next);
    if (next !== v) el.setAttribute(a, next);
  }
}

function walk(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) { if (!skipped(root.parentElement)) translateText(root as Tracked); return; }
  if (!(root instanceof Element) || skipped(root)) return;
  translateAttrs(root);
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode: (n) => (n instanceof Element && (n.hasAttribute('data-no-translate') || n.getAttribute('lang') === 'en' || n.tagName === 'SCRIPT' || n.tagName === 'STYLE' || n.tagName === 'TEXTAREA') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    if (n.nodeType === Node.TEXT_NODE) translateText(n as Tracked); else translateAttrs(n as Element);
  }
}

function restore() {
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  for (let n = tw.nextNode() as Tracked | null; n; n = tw.nextNode() as Tracked | null) {
    if (n.nodeType === Node.TEXT_NODE) {
      if (n[ORIG] !== undefined && n.nodeValue === n[DONE]) n.nodeValue = n[ORIG]!;
      delete n[ORIG]; delete n[DONE];
    } else if (n instanceof Element) {
      for (const a of ATTRS) {
        const orig = n.getAttribute(`data-wc-${a}`);
        if (orig !== null && n.getAttribute(a) === n.getAttribute(`data-wc-${a}-en`)) n.setAttribute(a, orig);
        n.removeAttribute(`data-wc-${a}`); n.removeAttribute(`data-wc-${a}-en`);
      }
    }
  }
}

export function setUiLang(next: UiLang | undefined) {
  const want: UiLang = next === 'en' ? 'en' : 'tr';
  if (typeof document === 'undefined') { lang = want; return; }
  document.documentElement.lang = want;
  if (want === lang && (want === 'tr' || observer)) return;
  lang = want;
  if (!document.body) { document.addEventListener('DOMContentLoaded', () => { lang = 'tr'; setUiLang(want); }, { once: true }); lang = want; return; }
  if (want === 'en') {
    walk(document.body);
    observer = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === 'characterData') { if (!skipped(r.target.parentElement)) translateText(r.target as Tracked); }
        else if (r.type === 'attributes') { if (r.target instanceof Element && !skipped(r.target)) translateAttrs(r.target); }
        else r.addedNodes.forEach((n) => walk(n));
      }
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...ATTRS] });
  } else {
    observer?.disconnect(); observer = null;
    restore();
  }
}
