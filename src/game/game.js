// SUNSHOWER — "젖은 틈에 빛이 들면 무지개 다리가 뜬다."
// 소코반라이크 턴제 퍼즐. main.js가 update/draw를 루프에 연결한다.

import { ctx, W, H } from '../engine/view.js';
import { ptr, keysJust } from '../engine/input.js';
import { save, load } from '../engine/save.js';
import { VW, VH, RAINBOW } from './const.js';
import { cam, updateCam, beginWorld, endWorld } from './cam.js';
import { drawSky, drawHills } from './bg.js';
import { updateFx, drawFx, clearFx, sparkle, ring } from './fx.js';
import {
  updateMusic, music, toggleMute, glissNote, rescueChord, winFanfare, eraseNote, poofNote,
} from './music.js';
import { LEVELS } from './levels.js';
import { board, loadLevel, tryMove, undo, cloudAt, tile } from './board.js';
import { TS, org, px, drawIsland, drawTiles, drawBeams, drawSuns, drawRainbows, drawCloud } from './art.js';
import { drawUnicorn, drawFoalGoal } from './unicorn.js';

let t = 0;
/** @type {'play' | 'win' | 'end'} */
let state = 'play';
let levelIdx = /** @type {number} */ (load('level', 0)) % LEVELS.length;
let unlocked = /** @type {number} */ (load('unlocked', 0));
let winT = 0;
let introT = 0;      // 레벨 시작 후 경과 — 힌트 표시용
let moved = false;   // 첫 조작 여부
let facing = 1;
let gx = 0, gy = 0;  // 골(망아지) 위치

// 이동 애니메이션 (보드는 즉시 갱신, 시각만 보간)
const anim = { p: 1, fx: 0, fy: 0, kind: '' };
const cloudAnim = { p: 1, fx: 0, fy: 0, tx: 0, ty: 0 };
const bump = { p: 1, dx: 0, dy: 0 };
/** @type {[number, number] | null} 버퍼된 입력 */
let queued = null;
let prevDown = false;

/** @param {number} i */
const startLevel = i => {
  levelIdx = i;
  loadLevel(LEVELS[i]);
  clearFx();
  save('level', i);
  state = 'play';
  introT = 0;
  moved = false;
  anim.p = 1;
  cloudAnim.p = 1;
  facing = 1;
  for (let y = 0; y < board.h; y++) {
    const x = board.rows[y].indexOf('G');
    if (x >= 0) { gx = x; gy = y; }
  }
};
startLevel(levelIdx);

// ── 입력 ───────────────────────────────────────────────────────────────────

const DIRS = /** @type {[string, string, number, number][]} */ ([
  ['ArrowLeft', 'KeyA', -1, 0],
  ['ArrowRight', 'KeyD', 1, 0],
  ['ArrowUp', 'KeyW', 0, -1],
  ['ArrowDown', 'KeyS', 0, 1],
]);

/** 이번 틱의 방향 입력 (키 + 스와이프) @returns {[number, number] | null} */
const dirInput = () => {
  for (const [k1, k2, dx, dy] of DIRS) {
    if (keysJust.has(k1) || keysJust.has(k2)) return [dx, dy];
  }
  // 스와이프: 릴리즈 시점에 판정
  if (prevDown && !ptr.down) {
    const dx = ptr.x - ptr.sx, dy = ptr.y - ptr.sy;
    if (Math.hypot(dx, dy) >= 24) {
      return Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)];
    }
  }
  return null;
};

/** 버튼 (스크린 좌표) */
const BTNS = () => [
  { id: 'undo', x: W - 156, y: 36 },
  { id: 'retry', x: W - 96, y: 36 },
  { id: 'mute', x: W - 36, y: 36 },
];

/** @param {number} sx @param {number} sy */
const hitBtn = (sx, sy) => {
  let best = null, bd = 32;
  for (const b of BTNS()) {
    const d = Math.hypot(sx - b.x, sy - b.y);
    if (d < bd) { bd = d; best = b.id; }
  }
  return best;
};

const doUndo = () => { if (undo()) { eraseNote(); anim.p = 1; cloudAnim.p = 1; } };

/** @param {number} dx @param {number} dy */
const step = (dx, dy) => {
  const beforeRb = board.rainbows.size;
  const fx2 = board.ux, fy2 = board.uy;
  const pushed = cloudAt(board.ux + dx, board.uy + dy);
  const res = tryMove(dx, dy);
  if (dx) facing = dx;
  moved = true;
  if (!res) {
    bump.p = 0;
    bump.dx = dx;
    bump.dy = dy;
    poofNote();
    return;
  }
  anim.p = 0;
  anim.fx = fx2;
  anim.fy = fy2;
  anim.kind = res;
  if (res === 'push' && pushed) {
    cloudAnim.p = 0;
    cloudAnim.fx = pushed[0] - dx;
    cloudAnim.fy = pushed[1] - dy;
    cloudAnim.tx = pushed[0];
    cloudAnim.ty = pushed[1];
    const c = px(pushed[0], pushed[1]);
    sparkle(c.x, c.y + 14, 3, 50);
  }
  glissNote(res === 'push' ? 2 : (board.moves % 4) + 4);
  // 새 무지개가 떴다 — 시그니처 순간
  if (board.rainbows.size > beforeRb) {
    for (const k of board.rainbows) {
      const [rx, ry] = k.split(',').map(Number);
      const c = px(rx, ry);
      sparkle(c.x, c.y, 14, 110);
      ring(c.x, c.y);
    }
    rescueChord();
  }
  if (res === 'win') {
    state = 'win';
    winT = 0;
    unlocked = Math.max(unlocked, levelIdx + 1);
    save('unlocked', unlocked);
    winFanfare();
    const g = px(gx, gy);
    sparkle(g.x, g.y - 20, 26, 170);
  }
};

// ── 업데이트 ───────────────────────────────────────────────────────────────

/** @param {number} dt */
export const update = dt => {
  t += dt;
  introT += dt;
  updateCam();
  updateMusic();
  updateFx(dt);
  music.intensity = Math.min(1, levelIdx * 0.25);
  if (keysJust.has('KeyM')) toggleMute();

  // 버튼 탭
  if (ptr.justDown) {
    const b = hitBtn(ptr.sx, ptr.sy);
    if (b === 'undo') doUndo();
    else if (b === 'retry') startLevel(levelIdx);
    else if (b === 'mute') toggleMute();
  }

  if (state === 'win') {
    winT += dt;
    if (anim.p < 1) anim.p = Math.min(1, anim.p + dt / 0.13);
    if (winT > 0.7 && (ptr.justDown || keysJust.has('Space') || keysJust.has('Enter'))) {
      if (levelIdx + 1 < LEVELS.length) startLevel(levelIdx + 1);
      else { state = 'end'; save('level', 0); }
    }
    prevDown = ptr.down;
    return;
  }
  if (state === 'end') {
    if (ptr.justDown || keysJust.has('Space')) { startLevel(0); }
    prevDown = ptr.down;
    return;
  }

  if (keysJust.has('KeyR')) startLevel(levelIdx);
  if (keysJust.has('KeyZ')) doUndo();

  const d = dirInput();
  if (d) {
    if (anim.p < 1) queued = d;
    else step(d[0], d[1]);
  }
  if (anim.p < 1) {
    anim.p = Math.min(1, anim.p + dt / 0.13);
    if (anim.p >= 1 && queued) { const q = queued; queued = null; step(q[0], q[1]); }
  }
  if (cloudAnim.p < 1) cloudAnim.p = Math.min(1, cloudAnim.p + dt / 0.13);
  if (bump.p < 1) bump.p = Math.min(1, bump.p + dt / 0.18);

  prevDown = ptr.down;
};

// ── 렌더 ───────────────────────────────────────────────────────────────────

export const draw = () => {
  updateCam();
  // 보드 원점 (매 프레임 — 리사이즈 대응)
  org.x = (VW - board.w * TS) / 2;
  org.y = (VH - board.h * TS) / 2 + 12;

  beginWorld();
  drawSky(t);
  drawHills();
  drawIsland();
  drawTiles(t);
  drawBeams(t);
  drawRainbows(t);
  drawSuns(t);

  // 골 망아지
  const g = px(gx, gy);
  ctx.save();
  ctx.translate(g.x, g.y + 16);
  drawFoalGoal(t, state !== 'play');
  ctx.restore();

  // 구름들 (밀리는 중인 구름은 보간)
  for (const [cx, cy] of board.clouds) {
    let wx, wy;
    if (cloudAnim.p < 1 && cx === cloudAnim.tx && cy === cloudAnim.ty) {
      const e = 1 - (1 - cloudAnim.p) ** 2;
      wx = org.x + (cloudAnim.fx + (cx - cloudAnim.fx) * e) * TS + TS / 2;
      wy = org.y + (cloudAnim.fy + (cy - cloudAnim.fy) * e) * TS + TS / 2;
    } else {
      wx = org.x + cx * TS + TS / 2;
      wy = org.y + cy * TS + TS / 2;
    }
    drawCloud(wx, wy - 4, t, cx * 7 + cy, tile(cx, cy) === 'O');
  }

  // 유니콘 — 호핑 보간 + 막힘 범프
  const e = 1 - (1 - anim.p) ** 2;
  let uxw = org.x + (anim.fx + (board.ux - anim.fx) * e) * TS + TS / 2;
  let uyw = org.y + (anim.fy + (board.uy - anim.fy) * e) * TS + TS / 2;
  const hop = anim.p < 1 ? Math.sin(anim.p * Math.PI) * 9 : 0;
  if (bump.p < 1) {
    const b = Math.sin(bump.p * Math.PI) * 7;
    uxw += bump.dx * b;
    uyw += bump.dy * b;
  }
  ctx.save();
  ctx.translate(uxw, uyw + 18 - hop);
  const sq = anim.p < 1 ? 1 : 1;
  ctx.scale(facing * (anim.p > 0.85 && anim.p < 1 ? 1.06 : sq), anim.p > 0.85 && anim.p < 1 ? 0.94 : 1);
  drawUnicorn(t, { walk: anim.p < 1 ? anim.p * Math.PI * 2 : 0, happy: state !== 'play' });
  ctx.restore();

  drawFx();
  endWorld();

  drawHud();
  if (state === 'win') drawWin();
  if (state === 'end') drawEnd();
};

// ── HUD / 오버레이 (스크린 좌표) ───────────────────────────────────────────

/** @param {number} v */
const fs = v => Math.max(10, v * cam.s);

const drawHud = () => {
  const lv = LEVELS[levelIdx];
  ctx.textBaseline = 'middle';
  // 레벨 칩 (상단 중앙)
  ctx.textAlign = 'center';
  const label = `${levelIdx + 1} · ${lv.name}`;
  ctx.font = `700 ${fs(15)}px system-ui, sans-serif`;
  const tw = ctx.measureText(label).width;
  ctx.fillStyle = 'rgba(40,25,70,.35)';
  ctx.beginPath();
  ctx.roundRect(W / 2 - tw / 2 - 14, 14, tw + 28, 30, 15);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillText(label, W / 2, 29 + 0.5);

  // 힌트 (첫 조작 전 또는 시작 4초)
  if (!moved || introT < 4) {
    ctx.globalAlpha = moved ? Math.max(0, Math.min(1, 4 - introT)) : 0.75 + 0.25 * Math.sin(t * 3);
    ctx.fillStyle = '#5d4a91';
    ctx.font = `600 ${fs(15)}px system-ui, sans-serif`;
    ctx.fillText(lv.hint, W / 2, H - fs(48));
    if (!moved && levelIdx === 0) {
      ctx.font = `500 ${fs(12)}px system-ui, sans-serif`;
      ctx.fillText('swipe or arrow keys · Z undo · R retry', W / 2, H - fs(24));
    }
    ctx.globalAlpha = 1;
  }

  // 버튼 3개
  for (const b of BTNS()) {
    ctx.fillStyle = 'rgba(40,25,70,.35)';
    ctx.beginPath();
    ctx.arc(b.x, b.y, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.fillStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    if (b.id === 'undo') {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 9, -2.6, 1.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(b.x - 13, b.y - 8);
      ctx.lineTo(b.x - 3, b.y - 10);
      ctx.lineTo(b.x - 9, b.y - 1);
      ctx.closePath();
      ctx.fill();
    } else if (b.id === 'retry') {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 9, -0.5, Math.PI * 1.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(b.x + 12, b.y - 8);
      ctx.lineTo(b.x + 3, b.y - 8);
      ctx.lineTo(b.x + 8, b.y - 1);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(b.x - 8, b.y - 3.5);
      ctx.lineTo(b.x - 3, b.y - 3.5);
      ctx.lineTo(b.x + 2.5, b.y - 9);
      ctx.lineTo(b.x + 2.5, b.y + 9);
      ctx.lineTo(b.x - 3, b.y + 3.5);
      ctx.lineTo(b.x - 8, b.y + 3.5);
      ctx.closePath();
      ctx.fill();
      if (music.muted) {
        ctx.beginPath();
        ctx.moveTo(b.x + 5, b.y - 6);
        ctx.lineTo(b.x + 12, b.y + 6);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(b.x + 4.5, b.y, 6, -0.9, 0.9);
        ctx.stroke();
      }
    }
  }
};

/** 밝은 클라우드 카드 @param {number} h @param {number} pop */
const card = (h, pop) => {
  const cw = Math.min(W * 0.8, 440 * cam.s);
  const ch = h * cam.s;
  const cy = H * 0.4;
  const p = Math.min(1, pop / 0.35);
  const e2 = 1 + 2.7 * (p - 1) ** 3 + 1.7 * (p - 1) ** 2;
  ctx.save();
  ctx.translate(W / 2, cy);
  ctx.scale(0.8 + 0.2 * e2, 0.8 + 0.2 * e2);
  ctx.shadowColor = 'rgba(93,74,145,.35)';
  ctx.shadowBlur = 24 * cam.s;
  ctx.shadowOffsetY = 6 * cam.s;
  ctx.fillStyle = 'rgba(255,255,255,.93)';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 18 * cam.s);
  ctx.fill();
  ctx.shadowColor = 'transparent';
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

const drawWin = () => {
  const cy = card(130, winT);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#5d4a91';
  ctx.font = `800 ${fs(27)}px system-ui, sans-serif`;
  ctx.fillText('Sunshower!', W / 2, cy - fs(22));
  ctx.fillStyle = '#8a76b8';
  ctx.font = `500 ${fs(14)}px system-ui, sans-serif`;
  ctx.fillText(`${board.moves} moves`, W / 2, cy + fs(8));
  if (winT > 0.8) {
    ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 3);
    ctx.font = `700 ${fs(14)}px system-ui, sans-serif`;
    ctx.fillText('Tap to continue', W / 2, cy + fs(36));
    ctx.globalAlpha = 1;
  }
};

const drawEnd = () => {
  const cy = card(150, 1);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#5d4a91';
  ctx.font = `800 ${fs(25)}px system-ui, sans-serif`;
  ctx.fillText('Every gap has a rainbow', W / 2, cy - fs(26));
  ctx.fillStyle = '#8a76b8';
  ctx.font = `500 ${fs(14)}px system-ui, sans-serif`;
  ctx.fillText('Prototype complete — thank you for playing!', W / 2, cy + fs(4));
  ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 3);
  ctx.font = `700 ${fs(14)}px system-ui, sans-serif`;
  ctx.fillText('Tap to play again', W / 2, cy + fs(34));
  ctx.globalAlpha = 1;
};

// 테스트 훅 (제출 빌드 전 제거)
/** @type {any} */ (globalThis).sundbg = () => ({
  state, level: levelIdx, ux: board.ux, uy: board.uy,
  moves: board.moves, won: board.won, rainbows: [...board.rainbows],
});
