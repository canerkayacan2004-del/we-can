import { useEffect, useState } from 'react';
import { Notice, PageTitle, cx } from '../components/ui.tsx';
import { Icon } from '../components/Icon.tsx';
import { errorMessage, useApp } from '../lib/app.tsx';

declare const __APP_VERSION__: string;
interface DesktopBridge { getAppInfo(): Promise<{ version: string; platform: string; packaged: boolean }> }

export function StatusScreen() {
  const { backend, setState, state, go } = useApp();
  const status = backend.status();
  const [info, setInfo] = useState<string>('');
  const [message, setMessage] = useState('');
  const online = typeof navigator === 'undefined' ? true : navigator.onLine;

  useEffect(() => {
    const bridge = (window as unknown as { wecanDesktop?: DesktopBridge }).wecanDesktop;
    if (!bridge) { setInfo('Masaüstü kabuğu dışında çalışıyor (test ortamı)'); return; }
    bridge.getAppInfo().then((i) => setInfo(`Masaüstü uygulaması · ${i.platform} · ${i.packaged ? 'kurulu sürüm' : 'geliştirme sürümü'}`), () => setInfo('Bilgi alınamadı'));
  }, []);

  const makeDue = async () => {
    try {
      setState(await backend.dev!.makeReviewsDueToday());
      setMessage('Bekleyen tekrarların tarihi bugüne çekildi. "Günlük tekrar" ekranından deneyebilirsin.');
    } catch (err) {
      setMessage(errorMessage(err));
    }
  };

  const lines = [status.cloud, status.ai, status.tts, status.stt];
  return (
    <div data-screen="status">
      <button className="btn btn-ghost btn-sm mb-4" onClick={() => go({ name: 'settings' })}><Icon name="arrowLeft" size={16} /> Ayarlar</button>
      <PageTitle icon="plug" title="Servis durumu" subtitle={`We Can sürüm ${__APP_VERSION__} · ${info}`} />
      <div className="mb-4">
        <Notice tone={status.mode === 'local' ? 'warn' : 'success'}>
          {status.mode === 'local'
            ? <><b>Çalışma modu: yerel.</b> Uygulamanın bütün ders, XP, tekrar ve görev akışları çalışır; veriler bu bilgisayarda tutulur. Bulut hesabı ve canlı AI için aşağıdaki servislerin bağlanması gerekir.</>
            : <><b>Çalışma modu: bulut.</b> Hesaplar ve ilerleme bulutta saklanıyor.</>}
        </Notice>
      </div>
      <div className="space-y-3">
        {lines.map((line) => (
          <div key={line.titleTr} className="card flex items-start gap-4" data-service={line.titleTr} data-connected={String(line.connected)}>
            <span className={cx('mt-1 h-4 w-4 shrink-0 rounded-full', line.connected ? 'bg-good/100' : 'bg-bad')} />
            <div>
              <p className="font-extrabold text-fg">{line.titleTr} <span className={cx('ml-2 text-sm', line.connected ? 'text-good' : 'text-bad')}>{line.connected ? 'Çalışıyor' : 'Bağlı değil'}</span></p>
              <p className="text-sm text-fg-2">{line.detailTr}</p>
            </div>
          </div>
        ))}
        <div className="card flex items-start gap-4">
          <span className={cx('mt-1 h-4 w-4 shrink-0 rounded-full', online ? 'bg-good/100' : 'bg-bad')} />
          <div>
            <p className="font-extrabold text-fg">İnternet bağlantısı <span className={cx('ml-2 text-sm', online ? 'text-good' : 'text-bad')}>{online ? 'Var' : 'Yok'}</span></p>
            <p className="text-sm text-fg-2">Yerel modda internet gerekmez. Bulut modunda zorunludur.</p>
          </div>
        </div>
      </div>

      {backend.dev && (
        <section className="card mt-6">
          <h2 className="mb-1 text-lg font-extrabold">Test araçları (yalnızca yerel mod)</h2>
          <p className="mb-3 text-sm text-fg-2">Tekrar sistemi normalde ertesi gün devreye girer. Beklemeden denemek için bekleyen {state.reviews.filter((r) => r.status === 'active').length} öğenin tarihini bugüne çekebilirsin.</p>
          <button className="btn btn-ghost btn-sm" data-action="dev-make-due" onClick={makeDue}>Tekrarları bugüne çek</button>
          {message && <p className="mt-3 text-sm text-fg">{message}</p>}
        </section>
      )}
    </div>
  );
}
