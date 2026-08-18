// ARCLIGHT — 무지개 아치를 그려 유니콘 망아지들을 집으로 데려가는 게임.
// 상태 머신: title → intro → play → win → (다음 레벨…) → end
// main.js가 update/draw를 루프에 연결한다.

import { ctx, W, H } from '../engine/view.js';
import { ptr, keysJust } from '../engine/input.js';
import { save, load } from '../engine/save.js';
import { TAP_MAX, ERASE_R, RAINBOW } from './const.js';
import { cam, updateCam, toWorld, beginWorld, endWorld } from './cam.js';
import { LEVELS, nearGround } from './levels.js';
import {
  arcs, arcY, quantize, addArc, arcAt, removeArc, clearArcs,
  drawArc, preview, setPreview, drawPreview, staticArc,
} from './arcs.js';
import { spawnFoals, updateFoals, drawFoals, drawDecoFoal, rescue, foals } from './foals.js';
import { initRain, updateRain, drawRain, drawStormCloud } from './rain.js';
import { updateFx, drawFx, clearFx, sparkle, burstArc } from './fx.js';
import { updateMusic, music, toggleMute, winFanfare, eraseNote, rescueNoteSmall } from './music.js';
import { drawSky, drawHills, drawPlats, drawGate } from './bg.js';
import { drawHud, hitButton } from './ui.js';

let t = 0;
/** @type {'title' | 'intro' | 'play' | 'win' | 'end'} */
let state = 'title';
let levelIdx = 0;
let lv = LEVELS[0];
let ink = 0;
let inkFlash = 0;
let toastT = 0;     // "빛 회수" 온보딩 토스트
let introT = 0;
let winT = 0;
let stars = 0;
let unlocked = /** @type {number} */ (load('unlocked', 0));

/** 아치 제거 공통 경로 — 충전 보너스를 이미 받은 아치는 그만큼 차감 환급 (파밍 방지)
 * @param {import('./arcs.js').Arc} a */
const eraseArc = a => {
  removeArc(a);
  ink = Math.min(lv.ink, ink + Math.round(a.len * (a.charged ? 0.85 : 1)));
  eraseNote();
  burstArc(a.pts); // 아치가 곡선 형태 그대로 7색 파편으로 부서진다
};

const titleArc = staticArc(150, 460, 810, 460, 220);

// ── 레벨 수명주기 ──────────────────────────────────────────────────────────

const restartLevel = () => {
  clearArcs();
  clearFx();
  spawnFoals(lv);
  initRain(lv);
  ink = lv.ink;
  inkFlash = 0;
  preview.active = false;
  preview.arc = null;
};

/** @param {number} i */
const goIntro = i => {
  levelIdx = i;
  lv = LEVELS[i];
  restartLevel();
  state = 'intro';
  introT = 0;
};

// ── 입력 헬퍼 ──────────────────────────────────────────────────────────────

/** 이번 틱에 "탭"이 발생했나 (포인터 or Space/Enter) */
const tapped = () => ptr.justDown || keysJust.has('Space') || keysJust.has('Enter');

// ── 업데이트 ───────────────────────────────────────────────────────────────

/** @param {number} dt */
export const update = dt => {
  t += dt;
  updateCam();
  updateMusic();
  if (inkFlash > 0) inkFlash -= dt;
  if (keysJust.has('KeyM')) toggleMute();

  if (state === 'title') {
    music.intensity = 0;
    if (Math.random() < dt * 2) sparkle(150 + Math.random() * 660, 460 - Math.random() * 200, 1, 40);
    if (tapped()) goIntro(Math.min(unlocked, LEVELS.length - 1));
    updateFx(dt);
    return;
  }
  if (state === 'intro') {
    introT += dt;
    if (introT > 0.4 && tapped()) state = 'play';
    if (introT > 2.6) state = 'play';
    updateFx(dt);
    return;
  }
  if (state === 'win') {
    winT += dt;
    updateFoals(dt, t);
    updateRain(lv, dt); // 비가 공중에 얼어붙지 않도록 win에서도 계속 시뮬레이션
    updateFx(dt);
    if (winT > 0.7 && tapped()) {
      if (levelIdx + 1 < LEVELS.length) goIntro(levelIdx + 1);
      else state = 'end';
    }
    return;
  }
  if (state === 'end') {
    updateFx(dt);
    if (tapped()) state = 'title';
    return;
  }

  // ── play ──
  if (keysJust.has('KeyR')) restartLevel();
  if (keysJust.has('KeyZ') && arcs.length) eraseArc(arcs[arcs.length - 1]); // Undo
  if (toastT > 0) toastT -= dt;

  // 유니콘 메카닉: 망아지가 아치를 처음 건너면 무지개가 충전되어 빛(잉크) 일부 환급
  for (const a of arcs) {
    if (a.charged) continue;
    for (const f of foals) {
      if (f.air || f.wait > 0 || f.saving > 0) continue;
      if (f.x >= a.x0 && f.x <= a.x1 && Math.abs(arcY(a, f.x) - f.y) < 1) {
        a.charged = true;
        a.flash = t;
        ink = Math.min(lv.ink, ink + Math.round(a.len * 0.15));
        rescueNoteSmall();
        sparkle((a.x0 + a.x1) / 2, arcY(a, (a.x0 + a.x1) / 2), 10, 100);
        break;
      }
    }
  }

  if (ptr.justDown) {
    const b = hitButton(ptr.sx, ptr.sy);
    if (b === 'retry') restartLevel();
    else if (b === 'mute') toggleMute();
    else {
      // 시작점은 pointerdown 이벤트 시점 좌표 — 빠른 플릭에서도 정확
      const w = toWorld(ptr.sx, ptr.sy);
      preview.active = true;
      preview.arc = null;
      preview.sx = w.x;
      preview.sy = w.y;
      preview.lastGliss = -1;
    }
  }

  if (preview.active) {
    const w = toWorld(ptr.x, ptr.y);
    const dist = Math.hypot(w.x - preview.sx, w.y - preview.sy);
    if (ptr.down) {
      if (dist >= TAP_MAX) {
        const a = quantize(preview.sx, preview.sy, w.x, w.y, (x, y) => nearGround(lv, x, y));
        setPreview(a, a.len <= ink);
      } else setPreview(null, true);
    } else {
      // 릴리즈: 탭이면 지우기, 드래그면 아치 확정
      if (dist < TAP_MAX) {
        const a = arcAt(w.x, w.y, ERASE_R);
        if (a) eraseArc(a);
      } else {
        // 프레임 히치로 down·up이 같은 틱에 들어와도 드래그가 유실되지 않도록
        // 프리뷰가 없으면 릴리즈 시점에 즉석 양자화한다
        const a = preview.arc ?? quantize(preview.sx, preview.sy, w.x, w.y, (x, y) => nearGround(lv, x, y));
        if (a.len <= ink) {
          ink -= a.len;
          addArc(a, t);
          sparkle(a.x0, a.y0, 5, 70);
          sparkle(a.x1, a.y1, 5, 70);
        } else {
          inkFlash = 0.6;
          toastT = 2.5;
          eraseNote();
        }
      }
      preview.active = false;
      preview.arc = null;
    }
  }

  updateFoals(dt, t);
  updateRain(lv, dt);
  updateFx(dt);
  music.intensity = rescue.total ? rescue.count / rescue.total : 0;

  if (rescue.count >= rescue.total) {
    state = 'win';
    winT = 0;
    const frac = ink / lv.ink;
    stars = frac >= 0.4 ? 3 : frac >= 0.15 ? 2 : 1;
    unlocked = Math.max(unlocked, levelIdx + 1);
    save('unlocked', unlocked);
    winFanfare();
    sparkle(lv.gate[0], lv.gate[1] - 80, 30, 200);
  }
};

// ── 렌더 ───────────────────────────────────────────────────────────────────

export const draw = () => {
  updateCam();
  beginWorld();
  drawSky(t);
  drawHills();

  if (state === 'title' || state === 'end') {
    drawArc(titleArc, t);
    drawLogoOnArc();      // 로고와 앰비언트 망아지는 월드 좌표(아치 위)
    drawFx();
    endWorld();
    state === 'title' ? drawTitle() : drawEnd();
    return;
  }

  drawPlats(lv);
  drawStormCloud(t);
  drawGate(lv.gate[0], lv.gate[1], t);
  for (const a of arcs) drawArc(a, t);
  drawPreview(t);
  drawFoals(t);
  drawRain();
  drawFx();
  endWorld();

  drawHud({
    ink, inkMax: lv.ink, saved: rescue.count, total: rescue.total,
    inkFlash, pending: preview.arc ? preview.arc.len : 0, pendingOk: preview.ok,
    toastT, t,
  });
  if (state === 'intro') drawIntro();
  if (state === 'win') drawWin();
};

// ── 오버레이 (스크린 좌표) ─────────────────────────────────────────────────

/** @param {number} px 월드 기준 px 크기 */
const fs = px => Math.max(10, px * cam.s);

/** 타이틀/엔드 공용 — 아치 위에 올라탄 무지개 로고 + 아치를 건너는 앰비언트 망아지 (월드 좌표) */
const drawLogoOnArc = () => {
  const word = 'ARCLIGHT';
  const a = titleArc;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 76px system-ui, sans-serif';
  ctx.lineJoin = 'round';
  for (let i = 0; i < word.length; i++) {
    const u = 0.14 + (0.72 * i) / (word.length - 1);
    const x = a.x0 + (a.x1 - a.x0) * u;
    const slope = (arcY(a, x + 4) - arcY(a, x - 4)) / 8;
    const dy = Math.sin(t * 2.2 + i * 0.55) * 4;
    ctx.save();
    ctx.translate(x, arcY(a, x) - 44 + dy);
    ctx.rotate(Math.atan(slope));
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 7;
    ctx.strokeText(word[i], 0, 0);
    ctx.fillStyle = 'rgba(70,45,110,.2)';
    ctx.fillText(word[i], 2.5, 3);
    ctx.fillStyle = RAINBOW[i % 7];
    ctx.fillText(word[i], 0, 0);
    ctx.restore();
  }
  // 앰비언트 망아지 — 게임이 뭔지 타이틀이 스스로 시연한다
  const n = state === 'end' ? 3 : 1;
  const span = a.x1 - a.x0 - 50;
  for (let i = 0; i < n; i++) {
    const x = a.x0 + 25 + ((t * 72 + i * 150) % span);
    const slope = (arcY(a, x + 4) - arcY(a, x - 4)) / 8;
    drawDecoFoal(x, arcY(a, x), t + i * 2, 40 + i * 110, Math.atan(slope) * 0.6);
  }
};

const drawTitle = () => {
  const cx = W / 2;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#5d4a91';
  ctx.font = `600 ${fs(20)}px system-ui, sans-serif`;
  ctx.fillText('Draw rainbows. Bring the foals home.', cx, H * 0.13);
  ctx.globalAlpha = 0.65 + 0.35 * Math.sin(t * 3);
  ctx.font = `700 ${fs(17)}px system-ui, sans-serif`;
  ctx.fillText(unlocked > 0 ? `Tap to continue — Level ${Math.min(unlocked, LEVELS.length - 1) + 1}` : 'Tap to start', cx, H * 0.82);
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(93,74,145,.55)';
  ctx.font = `500 ${fs(12)}px system-ui, sans-serif`;
  ctx.fillText('a js13k 2026 prototype', cx, H - fs(16));
};

/**
 * 클라우드 카드 — 파스텔 세계관과 어울리는 밝은 카드. 상단 무지개 스트립,
 * 소프트 섀도, easeOutBack 팝인. 중심 y = H*0.38 (무대를 가리지 않게 위로).
 * @param {number} h 월드 px 높이 @param {number} pop 등장 후 경과 시간
 * @returns {number} 카드 중심 y (스크린)
 */
const card = (h, pop = 1) => {
  const cw = Math.min(W * 0.82, 470 * cam.s);
  const ch = h * cam.s;
  const cy = H * 0.38;
  const p = Math.min(1, pop / 0.35);
  const e = 1 + 2.7 * (p - 1) ** 3 + 1.7 * (p - 1) ** 2; // easeOutBack
  ctx.save();
  ctx.translate(W / 2, cy);
  ctx.scale(0.8 + 0.2 * e, 0.8 + 0.2 * e);
  ctx.shadowColor = 'rgba(93,74,145,.35)';
  ctx.shadowBlur = 24 * cam.s;
  ctx.shadowOffsetY = 6 * cam.s;
  ctx.fillStyle = 'rgba(255,255,255,.92)';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 18 * cam.s);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  // 상단 무지개 스트립
  ctx.save();
  ctx.clip();
  for (let b = 0; b < 7; b++) {
    ctx.fillStyle = RAINBOW[b];
    ctx.fillRect(-cw / 2 + (cw * b) / 7, -ch / 2, cw / 7 + 1, 5 * cam.s);
  }
  ctx.restore();
  ctx.restore();
  return cy;
};

const drawIntro = () => {
  ctx.globalAlpha = Math.min(1, introT * 3);
  const cy = card(160, introT);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#b48ad2';
  ctx.font = `800 ${fs(14)}px system-ui, sans-serif`;
  ctx.fillText(`LEVEL ${levelIdx + 1}`, W / 2, cy - fs(46));
  ctx.fillStyle = '#5d4a91';
  ctx.font = `800 ${fs(28)}px system-ui, sans-serif`;
  ctx.fillText(lv.name, W / 2, cy - fs(16));
  ctx.fillStyle = '#8a76b8';
  ctx.font = `500 ${fs(15)}px system-ui, sans-serif`;
  ctx.fillText(lv.hint, W / 2, cy + fs(18));
  ctx.fillStyle = 'rgba(138,118,184,.7)';
  ctx.font = `600 ${fs(11)}px system-ui, sans-serif`;
  ctx.fillText('drag = draw · tap = erase · Z undo · R retry', W / 2, cy + fs(48));
  ctx.globalAlpha = 1;
};

/** 5각 별 @param {number} x @param {number} y @param {number} r @param {boolean} lit @param {number} pop */
const star = (x, y, r, lit, pop) => {
  const s = r * Math.min(1, pop) * (pop < 1 ? 1.4 - pop * 0.4 : 1);
  ctx.fillStyle = lit ? '#ffd76e' : 'rgba(255,255,255,.25)';
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? s * 0.45 : s;
    i ? ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
};

const drawWin = () => {
  const cy = card(185, winT);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#5d4a91';
  ctx.font = `800 ${fs(29)}px system-ui, sans-serif`;
  ctx.fillText('All foals home!', W / 2, cy - fs(44));
  for (let i = 0; i < 3; i++) {
    const pop = Math.max(0, (winT - 0.25 - i * 0.22) * 4);
    if (pop > 0) star(W / 2 + (i - 1) * fs(56), cy + fs(8), fs(24), i < stars, pop);
  }
  if (winT > 0.9) {
    ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 3);
    ctx.fillStyle = '#8a76b8';
    ctx.font = `700 ${fs(15)}px system-ui, sans-serif`;
    ctx.fillText('Tap to continue', W / 2, cy + fs(56));
    ctx.globalAlpha = 1;
  }
};

// 테스트 훅 — tools/playtest.mjs가 진행 상태를 읽는다 (제출 빌드 전 제거 검토)
/** @type {any} */ (globalThis).arcdbg = () => ({
  state, saved: rescue.count, ink,
  arcs: arcs.map(a => [a.x0, a.y0, a.x1, a.y1, a.h]),
  foals: foals.map(f => [f.x | 0, f.y | 0, f.dir, f.air ? 1 : 0, +f.wait.toFixed(1)]),
});

const drawEnd = () => {
  // 로고가 아치 위에 있으므로 텍스트는 상단 빈 하늘에 배치 (겹침 방지)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#5d4a91';
  ctx.font = `800 ${fs(32)}px system-ui, sans-serif`;
  ctx.fillText('Prototype complete!', W / 2, H * 0.12);
  ctx.font = `500 ${fs(16)}px system-ui, sans-serif`;
  ctx.fillText('ARCLIGHT will keep growing — thank you for playing.', W / 2, H * 0.12 + fs(38));
  ctx.globalAlpha = 0.65 + 0.35 * Math.sin(t * 3);
  ctx.font = `700 ${fs(15)}px system-ui, sans-serif`;
  ctx.fillText('Tap to return', W / 2, H * 0.85);
  ctx.globalAlpha = 1;
};
