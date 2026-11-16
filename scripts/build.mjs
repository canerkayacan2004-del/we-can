// We Can derleme betigi: arayuzu (esbuild) ve stilleri (Tailwind) apps/desktop/dist icine uretir.
import esbuild from 'esbuild';
import { compile } from 'tailwindcss';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(root, 'package.json'));
const srcDir = path.join(root, 'apps/desktop/src');
const outDir = path.join(root, 'apps/desktop/dist');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

// .env icinden YALNIZCA herkese acik degerler arayuze aktarilir.
const PUBLIC_KEYS = ['WECAN_SUPABASE_URL', 'WECAN_SUPABASE_ANON_KEY'];
function readPublicConfig() {
  const cfg = {};
  const envPath = path.join(root, '.env');
  if (!fs.existsSync(envPath)) return cfg;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const [, key, value] = m;
    if (/ANTHROPIC|SERVICE_ROLE|SECRET/i.test(key)) {
      console.warn(`[UYARI] .env icinde gizli gorunen bir anahtar var (${key}). Bu deger uygulamaya AKTARILMAZ ve burada durmamalidir.`);
      continue;
    }
    if (PUBLIC_KEYS.includes(key) && value) cfg[key] = value.replace(/^["']|["']$/g, '');
  }
  return cfg;
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (/\.(tsx?|html)$/.test(entry.name)) out.push(p);
  }
  return out;
}

export async function buildCss({ prod = false } = {}) {
  const input = fs.readFileSync(path.join(srcDir, 'styles.css'), 'utf8');
  const compiler = await compile(input, {
    base: srcDir,
    loadStylesheet: async (id, base) => {
      const p = id === 'tailwindcss'
        ? require.resolve('tailwindcss/index.css')
        : id.startsWith('.') ? path.resolve(base, id) : require.resolve(id);
      return { path: p, base: path.dirname(p), content: fs.readFileSync(p, 'utf8') };
    },
    loadModule: async (id) => { throw new Error(`Tailwind eklentisi desteklenmiyor: ${id}`); },
  });
  const candidates = new Set();
  for (const file of [...walk(srcDir), ...walk(path.join(root, 'content'))]) {
    for (const token of fs.readFileSync(file, 'utf8').split(/[\s"'`]+/)) {
      if (token && token.length < 80) candidates.add(token);
    }
  }
  let css = compiler.build([...candidates]);
  if (prod) css = (await esbuild.transform(css, { loader: 'css', minify: true })).code;
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'app.css'), css);
}

export function copyHtml() {
  fs.mkdirSync(outDir, { recursive: true });
  fs.copyFileSync(path.join(srcDir, 'index.html'), path.join(outDir, 'index.html'));
}

export function esbuildOptions({ prod = false } = {}) {
  return {
    entryPoints: [path.join(srcDir, 'main.tsx')],
    bundle: true,
    outfile: path.join(outDir, 'app.js'),
    format: 'iife',
    platform: 'browser',
    target: ['chrome120'],
    jsx: 'automatic',
    tsconfig: path.join(root, 'tsconfig.json'),
    minify: prod,
    sourcemap: prod ? false : 'inline',
    logLevel: 'info',
    define: {
      'process.env.NODE_ENV': JSON.stringify(prod ? 'production' : 'development'),
      __APP_VERSION__: JSON.stringify(pkg.version),
      __WECAN_CONFIG__: JSON.stringify(readPublicConfig()),
    },
  };
}

export async function buildAll({ prod = false } = {}) {
  await esbuild.build(esbuildOptions({ prod }));
  await buildCss({ prod });
  copyHtml();
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const prod = process.argv.includes('--prod');
  buildAll({ prod }).then(
    () => console.log(`We Can derlendi (${prod ? 'yayin' : 'gelistirme'} modu).`),
    (err) => { console.error(err); process.exit(1); },
  );
}
