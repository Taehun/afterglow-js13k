// 프로덕션 빌드 파이프라인:
//   esbuild(bundle) → terser(3-pass, unsafe, property mangle /^_/)
//   → Roadroller(self-extracting 압축) vs terser 결과 중 작은 쪽 선택
//   → 최소 HTML에 인라인 → zip -9 -X → advzip -z -4 (zopfli 재압축)
//
// 사용법:
//   node tools/build.mjs            # 기본 빌드 (Roadroller -O1)
//   node tools/build.mjs --max      # 제출용 (Roadroller -O2 + advzip 반복 증가, 느림)
//   node tools/build.mjs --fast     # Roadroller 생략 (개발 중 빠른 사이즈 확인)
//   node tools/build.mjs --log      # size-history.csv에 결과 기록
//   node tools/build.mjs --quiet    # 한 줄 요약만 출력
//
// zip이 13,312바이트를 넘으면 exit 1 → CI가 실패한다.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import esbuild from 'esbuild';
import { minify } from 'terser';
import { Packer } from 'roadroller';

const BUDGET = 13312; // 13 × 1024 — js13k 하드 리밋
const WARN_AT = 12800; // 96% — 여기 넘으면 경고
const TITLE = 'AFTERGLOW';
const MAX = process.argv.includes('--max');
const FAST = process.argv.includes('--fast');
const LOG = process.argv.includes('--log');
const QUIET = process.argv.includes('--quiet');
const TEST = process.argv.includes('--test'); // 테스트 훅 포함 빌드 → dist-test/ (zip 없음)

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
fs.mkdirSync(dist, { recursive: true });

// ── 1. esbuild: 번들 + 1차 미니파이 ────────────────────────────────────────
const bundle = await esbuild.build({
  entryPoints: [path.join(root, 'src/main.js')],
  bundle: true,
  format: 'iife',
  target: ['chrome120', 'firefox120'],
  minify: true,
  charset: 'utf8',
  write: false,
  legalComments: 'none',
  define: { TEST_HOOKS: TEST ? 'true' : 'false' }, // 제출 빌드에선 훅이 DCE로 사라진다
});
const rawJs = bundle.outputFiles[0].text;

// 테스트 빌드: dist-test/index.html만 생성 (roadroller/zip 생략 — 봇 검증용)
if (TEST) {
  const td = path.join(root, 'dist-test');
  fs.mkdirSync(td, { recursive: true });
  fs.writeFileSync(path.join(td, 'index.html'),
    `<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1,user-scalable=no">` +
    `<title>${TITLE}</title><link rel=icon href=data:,>` +
    `<style>html,body{margin:0;height:100%;background:#000;overflow:hidden}canvas{display:block;width:100%;height:100%;touch-action:none}</style>` +
    `<canvas id=c></canvas><script>${rawJs}</script>`);
  if (!QUIET) console.log('dist-test/index.html (테스트 훅 포함) 생성');
  process.exit(0);
}

// ── 2. terser: 3-pass 압축 + 프로퍼티 맹글링 (_프리픽스 컨벤션) ────────────
const terserOut = await minify(rawJs, {
  ecma: 2020,
  compress: {
    passes: 3,
    unsafe: true,
    unsafe_arrows: true,
    unsafe_math: true,
    unsafe_methods: true,
    booleans_as_integers: true, // 소스에 불리언 엄격비교(===true 등) 없음을 확인함
    hoist_funs: true,
    pure_getters: true,
    toplevel: true,
  },
  mangle: {
    toplevel: true,
    properties: { regex: /^_/ }, // '_'로 시작하는 프로퍼티만 안전하게 맹글링
  },
  format: { comments: false },
});
if (!terserOut.code) throw new Error('terser가 빈 출력을 반환했습니다');
const minJs = terserOut.code;

// ── 3. Roadroller: self-extracting 압축 후보 생성 ──────────────────────────
// 주의: Roadroller 출력은 자체 엔트로피 코딩된 고엔트로피 데이터라 zip 단계에서
// 거의 더 안 줄어드는 반면, terser 출력은 deflate가 크게 줄인다. 따라서 후보
// 선택은 반드시 "최종 zip 크기" 기준으로 한다 — 예산(13,312B)이 재는 것이 그것이다.
// Roadroller의 -O1 파라미터 탐색은 랜덤이라 실행/머신마다 출력 크기가 ±20B쯤
// 흔들린다(CI에서만 예산 초과하는 사고의 원인). 그래서 --max(-O2)가 찾은 최적
// 파라미터를 JSON으로 캐시해 두고, 평소 빌드는 그 파라미터로 결정적으로 압축한다.
// 캐시가 없으면 1회 -O1 탐색으로 생성한다. 코드가 크게 바뀌면 --max로 갱신할 것.
const PARAMS_FILE = path.join(root, 'tools/roadroller-params.json');
/** @type {{name: string, js: string}[]} */
const candidates = [{ name: 'terser', js: minJs }];
if (!FAST) {
  try {
    /** @type {import('roadroller').OptimizedPackerOptions | {}} */
    let params = {};
    if (!MAX && fs.existsSync(PARAMS_FILE)) {
      params = JSON.parse(fs.readFileSync(PARAMS_FILE, 'utf8'));
    }
    const packer = new Packer([{ data: minJs, type: 'js', action: 'eval' }], params);
    const res = await packer.optimize(MAX ? 2 : 'sparseSelectors' in params ? 0 : 1);
    if (MAX || !('sparseSelectors' in params)) {
      fs.writeFileSync(PARAMS_FILE, JSON.stringify(res.best) + '\n');
    }
    const { firstLine, secondLine } = packer.makeDecoder();
    candidates.push({ name: 'roadroller', js: firstLine + '\n' + secondLine });
  } catch (e) {
    console.warn('⚠ Roadroller 실패 — terser 출력으로 진행:', /** @type {Error} */ (e).message);
  }
}

// ── 4. 각 후보를 HTML로 감싸 동일한 zip 경로로 압축 → 작은 zip 선택 ────────
/** @param {string} js */
const wrapHtml = js =>
  `<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1,user-scalable=no">` +
  `<title>${TITLE}</title><link rel=icon href=data:,>` +
  `<style>body{overflow:hidden}canvas{position:fixed;inset:0;width:100%;height:100%;touch-action:none}</style>` +
  `<canvas id=c></canvas><script>${js}</script>`;

let advzipUsed = false;
/** zip -9 -X → advzip. 파일명은 반드시 index.html (zip 엔트리명도 크기에 포함) @param {string} html @param {string} dir */
const makeZip = (html, dir) => {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const h = path.join(dir, 'index.html');
  const z = path.join(dir, 'game.zip');
  fs.writeFileSync(h, html);
  execFileSync('zip', ['-9', '-X', '-j', '-q', z, h]);
  try {
    execFileSync('advzip', ['-z', '-4', '-i', MAX ? '512' : '64', '-q', z]);
    advzipUsed = true;
  } catch { /* advzip 미설치 — brew install advancecomp */ }
  return { htmlPath: h, zipPath: z, zipSize: fs.statSync(z).size };
};

const built = candidates
  .filter(c => {
    if (/<\/script/i.test(c.js)) { // 인라인 <script> 안전성
      console.warn(`⚠ ${c.name} 출력에 </script> 포함 — 후보 제외`);
      return false;
    }
    return true;
  })
  .map(c => ({ ...c, ...makeZip(wrapHtml(c.js), path.join(dist, `.cand-${c.name}`)) }));
if (!built.length) throw new Error('사용 가능한 빌드 후보가 없습니다');

built.sort((a, b) => a.zipSize - b.zipSize);
const winner = built[0];
const packed = winner.name === 'roadroller';
const finalJs = winner.js;

const htmlPath = path.join(dist, 'index.html');
const zipPath = path.join(dist, 'game.zip');
fs.copyFileSync(winner.htmlPath, htmlPath);
fs.copyFileSync(winner.zipPath, zipPath);
for (const c of built) fs.rmSync(path.dirname(c.htmlPath), { recursive: true, force: true });

// ── 6. 리포트 ──────────────────────────────────────────────────────────────
const bytes = (/** @type {string} */ p) => fs.statSync(p).size;
const zipSize = bytes(zipPath);
const htmlSize = bytes(htmlPath);
const remaining = BUDGET - zipSize;
const pct = ((zipSize / BUDGET) * 100).toFixed(1);

fs.writeFileSync(path.join(dist, 'size.json'), JSON.stringify({
  js: Buffer.byteLength(minJs), packedJs: Buffer.byteLength(finalJs),
  html: htmlSize, zip: zipSize, budget: BUDGET, remaining, packed, advzipUsed,
}, null, 2));

if (QUIET) {
  console.log(`zip ${zipSize} / ${BUDGET} bytes (${pct}%) — ${remaining} bytes 남음`);
} else {
  console.log(`── 사이즈 리포트 ─────────────────────────────`);
  for (const c of built) {
    console.log(`  ${c.name.padEnd(10)} js ${Buffer.byteLength(c.js).toLocaleString().padStart(7)} B → zip ${c.zipSize.toLocaleString().padStart(7)} B${c === winner ? '  ← 선택' : ''}`);
  }
  if (FAST) console.log(`  (fast — roadroller 후보 생략)`);
  console.log(`  index.html      ${htmlSize.toLocaleString()} B`);
  console.log(`  game.zip        ${zipSize.toLocaleString()} B ${advzipUsed ? '(advzip)' : '(zip -9만 — advzip 미설치)'}`);
  console.log(`  예산            ${BUDGET.toLocaleString()} B 중 ${pct}% 사용, ${remaining.toLocaleString()} B 남음`);
  console.log(`──────────────────────────────────────────────`);
}

if (LOG) {
  let sha = 'nogit', dirty = '';
  try {
    sha = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root }).toString().trim();
    dirty = execFileSync('git', ['status', '--porcelain'], { cwd: root }).toString().trim() ? '+dirty' : '';
  } catch { /* 커밋 전 */ }
  const csv = path.join(root, 'size-history.csv');
  if (!fs.existsSync(csv)) fs.writeFileSync(csv, 'date,commit,js,html,zip,remaining\n');
  fs.appendFileSync(csv, `${new Date().toISOString()},${sha}${dirty},${Buffer.byteLength(finalJs)},${htmlSize},${zipSize},${remaining}\n`);
}

if (zipSize > BUDGET) {
  console.error(`✖ 예산 초과! ${zipSize - BUDGET} bytes 줄여야 합니다.`);
  process.exit(1);
}
if (zipSize > WARN_AT) {
  console.warn(`⚠ 예산의 96%를 넘었습니다 — 지금부터 모든 추가는 사이즈와 교환입니다.`);
}
