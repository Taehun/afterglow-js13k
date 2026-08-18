// 개발 서버 — esbuild watch + 라이브 리로드.
// http://localhost:1313 에서 소스맵 포함 번들이 서빙된다. 저장하면 자동 새로고침.

import fs from 'node:fs';
import path from 'node:path';
import esbuild from 'esbuild';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, '.dev');
fs.mkdirSync(out, { recursive: true });

// dev 셸: src/index.html + esbuild 라이브 리로드 스니펫
const srcHtml = path.join(root, 'src/index.html');
const copyHtml = () => {
  const html = fs.readFileSync(srcHtml, 'utf8').replace(
    '</body>',
    '<script>new EventSource("/esbuild").addEventListener("change",()=>location.reload())</script></body>',
  );
  fs.writeFileSync(path.join(out, 'index.html'), html);
};
copyHtml();
// esbuild watch는 JS만 감시하므로 HTML은 직접 감시한다.
// (자동 리로드 이벤트까지는 못 쏘니 브라우저는 수동 새로고침)
fs.watch(srcHtml, () => {
  try { copyHtml(); } catch { return; }
  console.log('src/index.html 갱신됨 — 브라우저를 새로고침하세요');
});

const ctx = await esbuild.context({
  entryPoints: [path.join(root, 'src/main.js')],
  bundle: true,
  format: 'iife',
  target: ['chrome120', 'firefox120'],
  sourcemap: 'inline',
  outdir: out,
  logLevel: 'warning',
  define: { TEST_HOOKS: 'true' }, // dev에서는 디버그 훅 활성
});

await ctx.watch();
const { port } = await ctx.serve({ servedir: out, port: 1313 });
console.log(`dev server → http://localhost:${port}`);
console.log(`(사이즈 확인은 별도로: npm run size)`);
