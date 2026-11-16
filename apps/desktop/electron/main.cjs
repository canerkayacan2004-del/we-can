// We Can - Electron ana sureci.
// Guvenlik: arayuz kodunun bilgisayara dogrudan erisimi yoktur (contextIsolation + sandbox),
// dis web sayfasi yuklenmez, yeni pencere acilmasina izin verilmez.
const { app, BrowserWindow, ipcMain, shell, dialog, net } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');

// Tum surumler (gelistirme, tasinabilir, kurulu) ayni veri klasorunu kullanir; ilerleme kaybolmaz.
app.setPath('userData', path.join(app.getPath('appData'), 'we-can'));

// Otomatik guncelleme: GitHub'daki en son surum kontrol edilir.
const UPDATE_REPO = 'canerkayacan2004-del/we-can';

const isDev = process.env.WECAN_DEV === '1';
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1000,
    minHeight: 680,
    title: 'We Can',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    backgroundColor: '#050907',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));

  // Uygulama disina gezinmeyi ve yeni pencereleri engelle.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) event.preventDefault();
  });

  if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });
  mainWindow.on('closed', () => { mainWindow = null; });
}

function isNewer(latest, current) {
  const a = String(latest).split('.').map((n) => parseInt(n, 10) || 0);
  const b = String(current).split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) > (b[i] ?? 0);
  }
  return false;
}

async function checkForUpdates() {
  if (!app.isPackaged || process.platform !== 'win32') return;
  // Yalnizca kurulumla gelen surum kendini gunceller (tasinabilir klasor surumu degil).
  if (!fs.existsSync(path.join(path.dirname(process.execPath), 'Uninstall We Can.exe'))) return;
  try {
    const res = await net.fetch(`https://api.github.com/repos/${UPDATE_REPO}/releases/latest`, {
      headers: { 'User-Agent': 'WeCan-Updater', Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) return;
    const rel = await res.json();
    const latest = String(rel.tag_name || '').replace(/^v/i, '');
    if (!latest || !isNewer(latest, app.getVersion())) return;
    const asset = (rel.assets || []).find((a) => /^We-Can-Kurulum-.*\.exe$/i.test(a.name));
    if (!asset || !/^https:\/\/github\.com\//.test(asset.browser_download_url)) return;

    const { response } = await dialog.showMessageBox(mainWindow, {
      type: 'info',
      buttons: ['Şimdi güncelle', 'Sonra'],
      defaultId: 0,
      cancelId: 1,
      title: 'Güncelleme var',
      message: `We Can ${latest} hazır.`,
      detail: 'Güncelleme indirilip kurulacak. Uygulama kısa bir süre kapanıp yeniden açılacak; ilerlemen korunur.',
    });
    if (response !== 0) return;

    if (mainWindow) mainWindow.setProgressBar(2); // belirsiz ilerleme
    const dl = await net.fetch(asset.browser_download_url);
    if (!dl.ok) throw new Error(`İndirme başarısız (${dl.status})`);
    const buf = Buffer.from(await dl.arrayBuffer());
    if (asset.size && buf.length !== asset.size) throw new Error('İndirilen dosya eksik.');
    if (typeof asset.digest === 'string' && asset.digest.startsWith('sha256:')) {
      const hash = crypto.createHash('sha256').update(buf).digest('hex');
      if (hash !== asset.digest.slice(7).toLowerCase()) throw new Error('İndirilen dosya doğrulanamadı.');
    }
    const file = path.join(os.tmpdir(), asset.name);
    fs.writeFileSync(file, buf);
    spawn(file, ['/S', '--force-run'], { detached: true, stdio: 'ignore' }).unref();
    app.quit();
  } catch (err) {
    if (mainWindow) mainWindow.setProgressBar(-1);
    dialog.showMessageBox(mainWindow, { type: 'warning', title: 'Güncelleme', message: 'Güncelleme şu an yapılamadı.', detail: String(err && err.message ? err.message : err) });
  }
}

ipcMain.handle('app:info', () => ({
  version: app.getVersion(),
  platform: process.platform,
  packaged: app.isPackaged,
}));

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
  app.whenReady().then(() => {
    createWindow();
    setTimeout(() => { void checkForUpdates(); }, 4000);
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
