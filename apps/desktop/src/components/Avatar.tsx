// Kullanıcı profil fotoğrafı: fotoğraf yoksa baş harf gösterilir.
import { useRef, useState } from 'react';
import { cx } from './ui.tsx';

export function UserAvatar({ name, src, size = 40, className }: { name: string; src?: string | null; size?: number; className?: string }) {
  const initial = name.trim().charAt(0).toLocaleUpperCase('tr-TR') || '?';
  if (src) {
    return <img src={src} alt={name} width={size} height={size} draggable={false} data-avatar="photo"
      className={cx('shrink-0 rounded-full object-cover ring-2 ring-acc', className)} style={{ width: size, height: size }} />;
  }
  return (
    <span data-avatar="initial" className={cx('flex shrink-0 items-center justify-center rounded-full bg-acc font-black text-on-acc', className)}
      style={{ width: size, height: size, fontSize: size * 0.45 }}>{initial}</span>
  );
}

/** Seçilen görseli kare kırpar, 192 piksele küçültür ve JPEG data URL döndürür. */
export async function imageFileToAvatar(file: File, px = 192): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Lütfen bir resim dosyası seç (JPG, PNG, WEBP).');
  if (file.size > 15 * 1024 * 1024) throw new Error('Resim çok büyük (en fazla 15 MB).');
  // Not: Güvenlik politikası blob: adreslerine izin vermediği için dosya data URL olarak okunur.
  const url = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Dosya okunamadı.'));
    reader.readAsDataURL(file);
  });
  {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Resim açılamadı.'));
      el.src = url;
    });
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement('canvas');
    canvas.width = px; canvas.height = px;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Resim işlenemedi.');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, px, px);
    return canvas.toDataURL('image/jpeg', 0.86);
  }
}

/** Fotoğraf seç / kaldır düğmeleri. */
export function AvatarPicker({ name, src, onChange }: { name: string; src?: string | null; onChange: (dataUrl: string | null) => Promise<void> }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true); setError('');
    try { await onChange(await imageFileToAvatar(file)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Fotoğraf yüklenemedi.'); }
    finally { setBusy(false); if (input.current) input.current.value = ''; }
  };
  return (
    <div className="flex flex-col items-center gap-2">
      <button type="button" className="group relative cursor-pointer rounded-full" onClick={() => input.current?.click()} title="Profil fotoğrafını değiştir" data-action="avatar-pick">
        <UserAvatar name={name} src={src} size={88} />
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">{busy ? '…' : 'Değiştir'}</span>
      </button>
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" data-input="avatar" onChange={(e) => void pick(e.target.files?.[0])} />
      <div className="flex gap-2 text-xs">
        <button type="button" className="font-semibold text-acc hover:underline" onClick={() => input.current?.click()}>{src ? 'Fotoğrafı değiştir' : 'Fotoğraf yükle'}</button>
        {src && <button type="button" className="font-semibold text-fg-3 hover:text-bad" data-action="avatar-remove" onClick={() => void onChange(null)}>Kaldır</button>}
      </div>
      {error && <p className="max-w-48 text-center text-xs text-bad">{error}</p>}
    </div>
  );
}
