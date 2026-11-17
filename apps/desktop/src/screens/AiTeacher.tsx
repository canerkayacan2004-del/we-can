import { useState } from 'react';
import { aiAllowance, dayKey } from '@core/engine.ts';
import { TEACHERS } from '@content/teachers.ts';
import { Notice, PageTitle, cx } from '../components/ui.tsx';
import { useApp } from '../lib/app.tsx';
import type { ChatMessage } from '../lib/backend/types.ts';
import { INTERVIEW_SCENARIOS, aiScenarioLessons, allLessons } from '../lib/content.ts';

export function AiTeacherScreen() {
  const { backend, state, go } = useApp();
  const status = backend.status();
  const allowance = aiAllowance(state, 'conversation', dayKey(new Date()));
  const scenarios = aiScenarioLessons();
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const active = scenarios.find((s) => s.code === activeCode);
  const interview = INTERVIEW_SCENARIOS.find((s) => s.code === activeCode);

  return (
    <div data-screen="ai">
      <PageTitle icon="bot" title="AI öğretmen" subtitle="Dört öğretmen aynı profili ve ilerlemeni paylaşır." />

      <div className="mb-5" data-ai-connected={String(status.ai.connected)}>
        {status.ai.connected ? (
          <Notice tone="success"><b>AI öğretmen bağlı.</b> Bugünkü konuşma hakkın: {allowance.used} / {allowance.limit}.</Notice>
        ) : (
          <Notice tone="warn">
            <p><b>AI öğretmen henüz bağlı değil.</b> {status.ai.detailTr}</p>
            <p className="mt-2">Bağlamak için: Supabase projesinde <code>ai-teacher</code> fonksiyonu yayınlanır, Gemini API anahtarı Supabase gizli değişkenlerine (Secrets) eklenir, proje adresi ve anon anahtarı uygulamanın <code>.env</code> dosyasına yazılır. Adımlar: <code>supabase/KURULUM.md</code>.</p>
          </Notice>
        )}
      </div>

      <div className="mb-8 grid gap-3 md:grid-cols-2">
        {Object.values(TEACHERS).map((t) => (
          <div key={t.role} className="card flex gap-4" data-teacher={t.role}>
            <div className={cx('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl', t.color)}>{t.emoji}</div>
            <div>
              <p className="font-extrabold text-fg">{t.name} <span className="text-sm font-normal text-fg-2">· {t.titleTr}</span></p>
              <p className="text-sm text-fg-2">{t.descTr}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-1 text-xl font-black text-fg">Mülakat provası</h2>
      <p className="mb-3 text-sm text-fg-2">AI öğretmen işe alım görevlisi olur, sana gerçek mülakat sorularını sorar ve sonunda hatalarını Türkçe açıklar. Önce kelime paketine göz atman iyi olur.</p>
      <div className="mb-8 grid gap-3 md:grid-cols-2">
        {INTERVIEW_SCENARIOS.map((s) => (
          <div key={s.code} className="card" data-interview={s.code}>
            <div className="flex items-start gap-4">
              <span className="text-4xl leading-none">{s.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="font-extrabold text-fg">{s.ai.titleTr} <span className="text-sm font-normal text-fg-3">· {s.level}+ · {s.ai.maxTurns} tur</span></p>
                <p className="text-sm text-fg-2">{s.ai.situationTr}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="btn btn-primary" data-action="start-interview" disabled={!status.ai.connected || !allowance.allowed} onClick={() => setActiveCode(s.code)}>
                {!status.ai.connected ? 'AI bağlı değil' : allowance.allowed ? 'Mülakata başla' : 'Bugünkü hak doldu'}
              </button>
              <button className="btn btn-ghost" onClick={() => go({ name: 'hub', tab: 'packs' })}>Kelime paketi</button>
            </div>
          </div>
        ))}
      </div>
      {interview && <Chat key={interview.code} lessonCode={interview.code} opening={interview.ai.openingEn} maxTurns={interview.ai.maxTurns} onClose={() => setActiveCode(null)} />}

      <h2 className="mb-3 mt-8 text-xl font-black text-fg">Konuşma senaryoları</h2>
      <div className="space-y-3">
        {scenarios.map((lesson) => (
          <div key={lesson.code} className="card flex items-center gap-4" data-scenario={lesson.code}>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-fg-3">{lesson.code}</p>
              <p className="font-bold text-fg">{lesson.ai!.titleTr}</p>
              <p className="text-sm text-fg-2">{lesson.ai!.situationTr}</p>
            </div>
            {status.ai.connected ? (
              <button className="btn btn-primary shrink-0" disabled={!allowance.allowed} onClick={() => setActiveCode(lesson.code)}>
                {allowance.allowed ? 'Canlı konuş' : 'Bugünkü hak doldu'}
              </button>
            ) : (
              <button className="btn btn-ghost shrink-0" onClick={() => go({ name: 'lesson', code: lesson.code })}>Hazır diyalog pratiği</button>
            )}
          </div>
        ))}
      </div>

      {active && <Chat key={active.code} lessonCode={active.code} opening={active.ai!.openingEn} maxTurns={active.ai!.maxTurns} onClose={() => setActiveCode(null)} />}

      {status.ai.connected && <WritingReview />}
    </div>
  );
}

/** Canlı sohbet. Yalnızca AI bağlıyken açılır; mesajlar güvenli sunucu fonksiyonu üzerinden gider. */
function Chat({ lessonCode, opening, maxTurns, onClose }: { lessonCode: string; opening: string; maxTurns: number; onClose: () => void }) {
  const { backend, setState } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', text: opening }]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [corrections, setCorrections] = useState<string[]>([]);
  const userTurns = messages.filter((m) => m.role === 'user').length;
  const finished = userTurns >= maxTurns;

  const send = async () => {
    const text = draft.trim();
    if (!text || busy || finished) return;
    const next: ChatMessage[] = [...messages, { role: 'user', text }];
    setMessages(next);
    setDraft('');
    setBusy(true);
    setError('');
    const reply = await backend.aiChat({ lessonCode, messages: next });
    setBusy(false);
    setState(await backend.getState());
    if (reply.ok) {
      setMessages([...next, { role: 'assistant', text: reply.text }]);
      if (reply.correctionsTr) setCorrections(reply.correctionsTr);
    } else {
      setError(reply.messageTr);
    }
  };

  return (
    <div className="card mt-6" data-chat={lessonCode}>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-extrabold text-fg">Canlı konuşma · {userTurns} / {maxTurns} tur</p>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Kapat</button>
      </div>
      <div className="max-h-96 space-y-2 overflow-y-auto rounded-2xl bg-panel-2 p-3">
        {messages.map((m, i) => (
          <div key={i} className={cx('max-w-[80%] rounded-2xl px-4 py-2', m.role === 'user' ? 'ml-auto bg-acc text-on-acc' : 'bg-panel-3 text-fg')}>{m.text}</div>
        ))}
        {busy && <p className="text-sm text-fg-3">Öğretmen yazıyor…</p>}
      </div>
      {error && <div className="mt-3"><Notice tone="error">{error}</Notice></div>}
      {corrections.length > 0 && (
        <div className="mt-3"><Notice tone="info"><b>Düzeltmeler</b><ul className="list-inside list-disc">{corrections.map((c) => <li key={c}>{c}</li>)}</ul></Notice></div>
      )}
      <div className="mt-3 flex gap-2">
        <input className="field" value={draft} disabled={busy || finished} placeholder={finished ? 'Konuşma tamamlandı' : 'İngilizce yaz…'} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && void send()} />
        <button className="btn btn-primary" disabled={busy || finished || !draft.trim()} onClick={send}>Gönder</button>
      </div>
      <p className="mt-2 text-xs text-fg-3">Bu yazılı bir konuşma pratiğidir; telaffuz ve akıcılık ölçülmez.</p>
    </div>
  );
}

/** Yazı değerlendirmesi: hazır derslerdeki yazma görevlerinden biri seçilir, AI öğretmen Türkçe geri bildirim verir. */
function WritingReview() {
  const { backend, state, setState } = useApp();
  const allowance = aiAllowance(state, 'writing', dayKey(new Date()));
  const tasks = allLessons().flatMap((l) => l.exercises.filter((e) => e.type === 'write').map((e) => ({ lessonCode: l.code, id: e.id, prompt: e.prompt })));
  const [taskId, setTaskId] = useState(tasks[0]?.id ?? '');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const task = tasks.find((t) => t.id === taskId);

  const submit = async () => {
    if (!task || !text.trim() || busy) return;
    setBusy(true);
    setError('');
    setFeedback('');
    const reply = await backend.aiWriting({ lessonCode: task.lessonCode, taskId: task.id, text: text.trim() });
    setBusy(false);
    setState(await backend.getState());
    if (reply.ok) setFeedback(reply.text);
    else setError(reply.messageTr);
  };

  return (
    <div className="mt-8" data-writing-review>
      <h2 className="mb-1 text-xl font-black text-fg">Yazı değerlendirmesi</h2>
      <p className="mb-3 text-sm text-fg-2">Bugünkü hakkın: {allowance.used} / {allowance.limit}. AI öğretmen hatalarını Türkçe açıklar.</p>
      <div className="card space-y-3">
        <select className="field" value={taskId} onChange={(e) => { setTaskId(e.target.value); setFeedback(''); }}>
          {tasks.map((t) => <option key={t.id} value={t.id}>{t.lessonCode} · {t.prompt}</option>)}
        </select>
        <textarea className="field min-h-32" maxLength={2500} value={text} placeholder="İngilizce yaz…" onChange={(e) => setText(e.target.value)} />
        <div className="flex items-center gap-3">
          <button className="btn btn-primary" disabled={busy || !text.trim() || !allowance.allowed} onClick={submit}>
            {busy ? 'Değerlendiriliyor…' : allowance.allowed ? 'Değerlendir' : 'Bugünkü hak doldu'}
          </button>
          <span className="text-xs text-fg-3">{text.length} / 2500</span>
        </div>
        {error && <Notice tone="error">{error}</Notice>}
        {feedback && <div className="whitespace-pre-wrap rounded-2xl bg-panel-2 p-4 text-sm text-fg">{feedback}</div>}
      </div>
    </div>
  );
}
