// Gelistirme modu: dosyalar degistikce yeniden derler ve Electron penceresini acar.
// Degisiklikten sonra pencerede Ctrl+R ile yenileyin.
import esbuild from 'esbuild';
import { spawn } from 'node:child_process';
import { buildCss, copyHtml, esbuildOptions } from './build.mjs';

const ctx = await esbuild.context({
  ...esbuildOptions({ prod: false }),
  plugins: [{
    name: 'wecan-css',
    setup(build) {
      build.onEnd(async (result) => {
        if (result.errors.length) return;
        await buildCss();
        copyHtml();
        console.log('[we-can] derlendi - pencerede Ctrl+R ile yenileyin');
      });
    },
  }],
});
await ctx.rebuild();
await ctx.watch();

const electronPath = (await import('electron')).default;
const child = spawn(electronPath, ['.'], { stdio: 'inherit', env: { ...process.env, WECAN_DEV: '1' } });
child.on('exit', async () => { await ctx.dispose(); process.exit(0); });
