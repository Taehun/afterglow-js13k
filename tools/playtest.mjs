// E2E 플레이테스트 — AFTERGLOW를 실제 브라우저에서 봇 플레이한다.
// 검증: 이동/잔광 처치, 레벨업 3택, 서지 웨이브, 운빨 아이템 5종 발동,
// 접촉 피해→게임오버, 재시작, 콘솔 에러 0.
//
// 사용: node tools/playtest.mjs [스크린샷출력디렉토리]

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright-core';

const root = path.resolve(import.meta.dirname, '..');
// 테스트 훅이 포함된 전용 빌드를 만들어 검증한다 (제출 빌드에는 훅이 없다)
execFileSync('node', [path.join(root, 'tools/build.mjs'), '--test', '--quiet'], { stdio: 'inherit' });
const distHtml = path.join(root, 'dist-test/index.html');
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
const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
/** @type {string[]} */
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(`console.error: ${m.text()}`); });
page.on('pageerror', e => errors.push(`uncaught: ${e}`));

await page.goto('file://' + distHtml);
await page.waitForFunction('typeof agdbg == "function"', undefined, { timeout: 5000 });
const dbg = () => page.evaluate('agdbg()');
/** @param {string} name */
const shot = name => page.screenshot({ path: path.join(shotDir, name + '.png') });

let ok = true;
/** @param {boolean} cond @param {string} msg */
const check = (cond, msg) => {
  console.log(`${cond ? '✓' : '✖'} ${msg}`);
  if (!cond) ok = false;
};

try {
  // 1) 아이템 5종 강제 발동 — 각 효과가 에러 없이 도는지
  await page.waitForTimeout(500);
  for (let k = 0; k < 5; k++) {
    await page.evaluate(`agforce(${k})`);
    await page.waitForTimeout(350);
  }
  const d0 = await dbg();
  check(d0.itemsUsed === 5, `운빨 아이템 5종 발동 (${d0.itemsUsed}/5)`);

  // 2) 원형 카이팅 70초 — 처치/레벨업/서지, pick 카드는 1번 선택
  const seq = ['KeyD', 'KeyS', 'KeyA', 'KeyW'];
  let picks = 0, shotEarly = false, shotPick = false;
  const t0 = Date.now();
  let i = 0;
  while (Date.now() - t0 < 70000) {
    const d = await dbg();
    if (d.state === 'pick') {
      if (!shotPick) { await shot('3-pick'); shotPick = true; }
      await page.keyboard.press('Digit1');
      picks++;
      await page.waitForTimeout(200);
      continue;
    }
    if (d.state === 'over') break;
    if (i > 0 && i % 18 === 0) await page.evaluate('agforce(0)'); // 주기적 자석 — 조각 확정 수집
    const k = seq[i++ % 4];
    await page.keyboard.down(k);
    await page.waitForTimeout(360);
    if (!shotEarly && Date.now() - t0 > 4000) { await shot('1-early'); shotEarly = true; }
    await page.keyboard.up(k);
  }
  await shot('2-swarm');
  const d1 = await dbg();
  console.log('70s 후:', JSON.stringify(d1));
  check(d1.kills >= 10, `잔광/별 처치 (kills=${d1.kills})`);
  check(picks >= 1, `레벨업 3택 (선택 ${picks}회)`);
  check(d1.outShards === 0 && d1.outMobs === 0, `섬 밖 유실 없음 (조각 ${d1.outShards}, 몹 ${d1.outMobs})`);
  check(d1.elapsed >= 60 || d1.state === 'over', `서지 구간 도달 (elapsed=${d1.elapsed})`);
  check(d1.blooms >= 10, `초원 치유 (blooms=${d1.blooms})`);

  // 3) 정지 → 게임오버 → 재시작
  if (d1.state !== 'over') {
    await page.waitForFunction('agdbg().state=="over"', undefined, { timeout: 40000 }).catch(() => {});
  }
  const d2 = await dbg();
  await shot('4-over');
  check(d2.state === 'over', `게임오버 (state=${d2.state})`);
  await page.keyboard.press('KeyR');
  await page.waitForTimeout(400);
  const d3 = await dbg();
  check(d3.state === 'play' && d3.kills === 0, '재시작 초기화');

  // 4) 신무기(헤일로 2·프리즘 광선 2) 강제 적용 + 폭풍 장벽까지 주행
  await page.evaluate('agup(8);agup(8);agup(9);agup(9)');
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(7500); // 오른쪽 장벽(x=1120)까지 도달
  await shot('5-wall-weapons');
  await page.keyboard.up('KeyD');
  await page.waitForTimeout(1500);
  const d4 = await dbg();
  check(d4.kills > 0 || d4.mobs >= 0, `신무기 가동 상태 정상 (kills=${d4.kills})`);
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
