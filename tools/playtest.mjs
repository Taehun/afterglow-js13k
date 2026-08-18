// E2E 플레이테스트 — 빌드 산출물을 실제 브라우저에서 3레벨 전부 클리어한다.
// 스모크보다 강한 검증: 아치 드로잉→망아지 횡단→구조→레벨 전환→비 우산까지
// 전체 코어 루프가 실제로 동작하는지 확인하고 단계별 스크린샷을 남긴다.
//
// 사용: node tools/playtest.mjs [스크린샷출력디렉토리]

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright-core';

const root = path.resolve(import.meta.dirname, '..');
const distHtml = path.join(root, 'dist/index.html');
const shotDir = process.argv[2] || path.join(root, '.playtest');
fs.mkdirSync(shotDir, { recursive: true });

/** @param {string[]} patterns */
const findExe = patterns => {
  for (const p of patterns) {
    if (!p) continue;
    const hits = fs.globSync(p).sort();
    const hit = hits[hits.length - 1];
    if (hit && fs.existsSync(hit)) return hit;
  }
  return null;
};
const home = os.homedir();
const exe = findExe([
  process.env.CHROME_PATH ?? '',
  `${home}/Library/Caches/ms-playwright/chromium-*/chrome-mac-arm64/*.app/Contents/MacOS/*`,
  `${home}/.cache/ms-playwright/chromium-*/chrome-linux64/chrome`,
  `${home}/.cache/ms-playwright/chromium-*/chrome-linux/chrome`,
]);
if (!exe) { console.error('Chromium 실행 파일 없음'); process.exit(1); }

const browser = await chromium.launch({ executablePath: exe, headless: true });
// 뷰포트 960×540 = 월드 1:1 스케일 → 스크린 좌표 == 월드 좌표
const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
/** @type {string[]} */
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(`console.error: ${m.text()}`); });
page.on('pageerror', e => errors.push(`uncaught: ${e}`));

await page.goto('file://' + distHtml);
await page.waitForFunction('typeof arcdbg == "function"', undefined, { timeout: 5000 });

const dbg = () => page.evaluate('arcdbg()');
/** @param {string} name */
const shot = name => page.screenshot({ path: path.join(shotDir, name + '.png') });
const tap = async (x = 480, y = 270) => { await page.mouse.click(x, y); await page.waitForTimeout(250); };
// 오버레이 전환 — win(0.7s)/intro(0.4s)의 오탭 방지 딜레이를 기다린 뒤 탭
const advance = async () => { await page.waitForTimeout(1000); await tap(); };
/**
 * 아치 드래그 @param {number} x0 @param {number} y0 @param {number} x1 @param {number} y1
 */
const drag = async (x0, y0, x1, y1) => {
  await page.mouse.move(x0, y0);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) {
    await page.mouse.move(x0 + ((x1 - x0) * i) / 10, y0 + ((y1 - y0) * i) / 10);
    await page.waitForTimeout(30);
  }
  await page.mouse.up();
  await page.waitForTimeout(150);
};
/** state가 될 때까지 대기 @param {string} s @param {number} ms */
const waitState = (s, ms) =>
  page.waitForFunction(`arcdbg().state == ${JSON.stringify(s)}`, undefined, { timeout: ms });

let ok = true;
/** @param {boolean} cond @param {string} msg */
const check = (cond, msg) => {
  console.log(`${cond ? '✓' : '✖'} ${msg}`);
  if (!cond) ok = false;
};

try {
  // ── 타이틀
  await page.waitForTimeout(700);
  await shot('1-title');
  check((await dbg()).state === 'title', '타이틀 화면');

  // ── 레벨 1: 다리
  await tap();               // title → intro
  await page.waitForTimeout(500);
  await shot('2-intro');
  await advance();           // intro → play
  await waitState('play', 3000);
  await drag(280, 430, 600, 430);
  await page.waitForTimeout(4000);
  await shot('3-level1-crossing');
  await waitState('win', 30000);
  await shot('4-level1-win');
  check(true, '레벨 1 클리어 (다리)');

  // ── 레벨 2: 경사로
  await advance();           // win → intro
  await advance();           // intro → play
  await waitState('play', 3000);
  await drag(320, 460, 560, 290);
  await waitState('win', 40000);
  await shot('5-level2-win');
  check(true, '레벨 2 클리어 (경사로)');

  // ── 레벨 3: 비 — 다리 + 우산
  await advance();           // win → intro
  await advance();           // intro → play
  await waitState('play', 3000);
  await drag(240, 440, 720, 440);  // 다리
  await drag(300, 340, 660, 340);  // 우산
  await page.waitForTimeout(5000);
  await shot('6-level3-rain');
  await waitState('win', 45000);
  await shot('7-level3-win');
  check(true, '레벨 3 클리어 (비+우산)');

  // ── 엔딩
  await advance();
  await page.waitForTimeout(400);
  await shot('8-end');
  check((await dbg()).state === 'end', '엔딩 화면');
} catch (e) {
  ok = false;
  console.error('✖ 진행 실패:', /** @type {Error} */ (e).message);
  await shot('fail');
  console.error('  마지막 상태:', JSON.stringify(await dbg().catch(() => null)));
}

check(errors.length === 0, `콘솔 에러 0 (발견: ${errors.length})`);
for (const e of errors) console.error('  ' + e);

await browser.close();
console.log(ok ? '\n플레이테스트 전체 통과' : '\n플레이테스트 실패');
process.exit(ok ? 0 : 1);
