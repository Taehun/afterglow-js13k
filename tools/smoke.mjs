// 스모크 테스트 — 빌드 산출물(dist/index.html)을 실제 브라우저에서 연다.
//
// 검증 항목 (규칙 "Make sure it works" 직결):
//   1. 콘솔 에러 0 (console.error + uncaught exception)  ← 규칙상 필수
//   2. 캔버스 존재
//   3. 애니메이션 구동 (0.7초 간격 스크린샷이 서로 달라야 함)
//   4. 입력(클릭/키) 후에도 에러 0
//
// 브라우저 해석 순서: $CHROME_PATH → playwright 캐시 → 시스템 Chrome.
// Firefox는 $FIREFOX_PATH 또는 playwright 캐시의 빌드가 있을 때만 실행 (없으면 스킵).
// CI에서는 `npx playwright install chromium firefox`가 캐시를 채워준다.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium, firefox } from 'playwright-core';

const root = path.resolve(import.meta.dirname, '..');
const distHtml = path.join(root, 'dist/index.html');
if (!fs.existsSync(distHtml)) {
  console.error('dist/index.html이 없습니다 — 먼저 npm run build를 실행하세요.');
  process.exit(1);
}

/** glob 후보들 중 존재하는 가장 최신 경로 반환 @param {string[]} patterns */
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
const chromeExe = findExe([
  process.env.CHROME_PATH ?? '',
  // macOS — playwright 캐시 (구/신 레이아웃)
  `${home}/Library/Caches/ms-playwright/chromium-*/chrome-mac-arm64/*.app/Contents/MacOS/*`,
  `${home}/Library/Caches/ms-playwright/chromium-*/chrome-mac/Chromium.app/Contents/MacOS/Chromium`,
  `${home}/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-mac-arm64/chrome-headless-shell`,
  // Linux — playwright 캐시 (pre-CfT `chrome-linux`와 CfT `chrome-linux64` 레이아웃 모두)
  `${home}/.cache/ms-playwright/chromium-*/chrome-linux64/chrome`,
  `${home}/.cache/ms-playwright/chromium-*/chrome-linux/chrome`,
  `${home}/.cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell`,
  `${home}/.cache/ms-playwright/chromium_headless_shell-*/chrome-linux/headless_shell`,
  // 시스템 설치 폴백
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
]);
const firefoxExe = findExe([
  process.env.FIREFOX_PATH ?? '',
  `${home}/Library/Caches/ms-playwright/firefox-*/firefox/Nightly.app/Contents/MacOS/firefox`,
  `${home}/.cache/ms-playwright/firefox-*/firefox/firefox`,
]);

/**
 * @param {string} name
 * @param {import('playwright-core').BrowserType} type
 * @param {string} exe
 */
const run = async (name, type, exe) => {
  const browser = await type.launch({ executablePath: exe, headless: true });
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  /** @type {string[]} */
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(`console.error: ${m.text()}`); });
  page.on('pageerror', e => errors.push(`uncaught: ${e}`));

  await page.goto('file://' + distHtml);
  await page.waitForTimeout(800);

  const hasCanvas = !!(await page.$('canvas'));
  const shot1 = await page.screenshot();
  await page.waitForTimeout(700);
  const shot2 = await page.screenshot();
  const animating = !shot1.equals(shot2);

  // 입력 후 에러 없는지 확인 (오디오 언락 경로 포함)
  await page.mouse.click(400, 300);
  await page.keyboard.press('Space');
  await page.waitForTimeout(500);

  await browser.close();

  const fail = errors.length > 0 || !hasCanvas || !animating;
  console.log(`[${name}] canvas=${hasCanvas ? 'ok' : 'MISSING'} animating=${animating ? 'ok' : 'FROZEN'} consoleErrors=${errors.length}`);
  for (const e of errors) console.error(`  ${e}`);
  return !fail;
};

let ok = true;
if (chromeExe) {
  ok = (await run('chromium', chromium, chromeExe)) && ok;
} else {
  console.error('Chromium 실행 파일을 찾지 못했습니다 (CHROME_PATH를 지정하세요).');
  ok = false;
}
if (firefoxExe) {
  ok = (await run('firefox', firefox, firefoxExe)) && ok;
} else {
  console.log('[firefox] 스킵 — playwright용 Firefox 빌드 없음 (CI에서 실행, 제출 전 수동 확인 필수)');
}

process.exit(ok ? 0 : 1);
