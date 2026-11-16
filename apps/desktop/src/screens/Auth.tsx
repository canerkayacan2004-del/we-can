import { useState } from 'react';
import type { FormEvent } from 'react';
import { Logo, Mascot, Notice, cx } from '../components/ui.tsx';
import { errorMessage } from '../lib/app.tsx';
import type { Backend, Session } from '../lib/backend/types.ts';

export function AuthScreen({ backend, onSession }: { backend: Backend; onSession: (session: Session) => void }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const local = backend.status().mode === 'local';

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const session = mode === 'signup' ? await backend.signUp(email, password, name) : await backend.signIn(email, password);
      onSession(session);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-full">
      <div className="relative hidden flex-1 flex-col items-center justify-center overflow-hidden border-r border-line bg-panel px-10 text-center lg:flex">
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(600px 400px at 50% 30%, color-mix(in oklab, var(--wc-acc) 22%, transparent), transparent 70%)' }} />
        <Mascot size={160} mood="cheer" className="relative animate-float" />
        <p className="relative mt-8 font-script text-2xl text-acc">Better English, a brighter you.</p>
        <h1 className="relative mt-6 text-5xl font-black text-fg">We<span className="text-acc">Can</span></h1>
        <p className="relative mt-3 max-w-sm text-lg text-fg-2">Türkçe açıklamalarla, adım adım İngilizce. A1'den B2'ye 42 ünite, 210 ders.</p>
      </div>
      <div className="flex flex-1 items-center justify-center overflow-y-auto px-8 py-10">
        <form className="w-full max-w-md" onSubmit={submit} data-screen="auth">
          <div className="mb-6 lg:hidden"><Logo size="text-4xl" /></div>
          <h2 className="text-3xl font-black text-fg">{mode === 'signup' ? 'Hesap oluştur' : 'Tekrar hoş geldin'}</h2>
          <p className="mt-1 text-fg-2">{mode === 'signup' ? 'İlerlemen hesabına kaydedilir.' : 'Kaldığın yerden devam et.'}</p>

          <div className="mt-6 grid grid-cols-2 rounded-2xl bg-panel-3 p-1">
            {(['signup', 'signin'] as const).map((m) => (
              <button key={m} type="button" data-tab={m} onClick={() => { setMode(m); setError(''); }}
                className={cx('cursor-pointer rounded-xl py-2 font-bold transition-colors', mode === m ? 'bg-acc text-on-acc' : 'text-fg-2')}>
                {m === 'signup' ? 'Kayıt ol' : 'Giriş yap'}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="label" htmlFor="name">Adın</label>
                <input id="name" className="field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" placeholder="Sana nasıl hitap edelim?" />
              </div>
            )}
            <div>
              <label className="label" htmlFor="email">E-posta</label>
              <input id="email" type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" placeholder="ornek@eposta.com" />
            </div>
            <div>
              <label className="label" htmlFor="password">Şifre</label>
              <input id="password" type="password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="En az 6 karakter" />
            </div>
          </div>

          {error && <div className="mt-4"><Notice tone="error">{error}</Notice></div>}

          <button type="submit" className="btn btn-primary mt-6 w-full" disabled={busy} data-action="auth-submit">
            {busy ? 'Lütfen bekle…' : mode === 'signup' ? 'Hesabımı oluştur' : 'Giriş yap'}
          </button>

          {local && (
            <div className="mt-5">
              <Notice tone="warn">
                <b>Yerel mod.</b> Bulut hesabı henüz bağlı olmadığı için hesap ve ilerleme yalnızca bu bilgisayarda saklanır. E-posta doğrulaması ve şifre sıfırlama bu modda yoktur; şifreni unutma.
              </Notice>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
