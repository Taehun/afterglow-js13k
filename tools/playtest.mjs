// E2E 플레이테스트 — SUNSHOWER 5레벨을 설계 정답 수순으로 전부 클리어한다.
// 레벨 설계가 실제로 풀리는지(솔버 검증)와 콘솔 에러 0을 함께 보장한다.
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

// 설계 정답 수순 (levels.js와 동기 유지)
const SOLUTIONS = [
  'RRRRDRRU',
  'RRRRRRDRRU',
  'RRRDD',
  'DDDRRR',
  'RRRRRURDDDRR',
];
/** @type {Record<string, string>} */
const KEY = { R: 'ArrowRight', L: 'ArrowLeft', U: 'ArrowUp', D: 'ArrowDown' };

const browser = await chromium.launch({ executablePath: exe, headless: true });
const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
/** @type {string[]} */
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(`console.error: ${m.text()}`); });
page.on('pageerror', e => errors.push(`uncaught: ${e}`));

await page.goto('file://' + distHtml);
await page.waitForFunction('typeof sundbg == "function"', undefined, { timeout: 5000 });
const dbg = () => page.evaluate('sundbg()');
/** @param {string} name */
const shot = name => page.screenshot({ path: path.join(shotDir, name + '.png') });

let ok = true;
/** @param {boolean} cond @param {string} msg */
const check = (cond, msg) => {
  console.log(`${cond ? '✓' : '✖'} ${msg}`);
  if (!cond) ok = false;
};

try {
  await page.waitForTimeout(600);
  await shot('1-level1-start');

  for (let i = 0; i < SOLUTIONS.length; i++) {
    const d0 = await dbg();
    check(d0.level === i && d0.state === 'play', `레벨 ${i + 1} 시작`);
    for (const mv of SOLUTIONS[i]) {
      await page.keyboard.press(KEY[mv]);
      await page.waitForTimeout(190);
    }
    if (i === 0) await shot('2-level1-rainbow');
    await page.waitForFunction(`sundbg().state == "win" || sundbg().state == "end"`, undefined, { timeout: 4000 });
    check(true, `레벨 ${i + 1} 클리어 (${SOLUTIONS[i].length}수)`);
    if (i === 2) await shot('3-level3-win');
    await page.waitForTimeout(1000);
    await page.mouse.click(480, 480); // 카드 진행 (카드 밖 탭)
    await page.waitForTimeout(400);
  }

  const dEnd = await dbg();
  await shot('4-end');
  check(dEnd.state === 'end', '전체 클리어 (엔딩 화면)');

  // Undo·재시작 동작 확인 (엔딩에서 재시작 → 한 수 → Z 언두)
  await page.mouse.click(480, 480);
  await page.waitForTimeout(400);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(250);
  const m1 = (await dbg()).ux;
  await page.keyboard.press('KeyZ');
  await page.waitForTimeout(250);
  const m2 = (await dbg()).ux;
  check(m1 === 2 && m2 === 1, 'Undo(Z) 동작');
  await shot('5-restart');
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
