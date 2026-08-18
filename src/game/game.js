// AFTERGLOW — 무지개 잔광이 곧 무기인 유니콘 뱀서라이크 (스파이크).
// 달려야 화력이 나온다: 카이팅이 곧 조준. 먹구름 무리 / 히트스톱·셰이크 /
// 조각 수집 → 레벨업 3택 성장.

import { ctx, W, H } from '../engine/view.js';
import { ptr, keys, keysJust } from '../engine/input.js';
import { save, load } from '../engine/save.js';
import { S } from '../engine/sfx.js';
import { VW, VH, RAINBOW } from './const.js';
import { cam, updateCam, beginWorld, endWorld, overdrawX, overdrawY } from './cam.js';
import { updateFx, drawFx, clearFx, sparkle, ring } from './fx.js';
import {
  updateMusic, music, toggleMute, glissNote, rescueChord, winFanfare, eraseNote,
} from './music.js';
import { stats, resetStats, rollUpgrades } from './stats.js';
import { P, trail, resetPlayer, updatePlayer, onTrail, drawTrail, drawPlayer } from './player.js';
import { mobs, resetMobs, spawnMobs, updateMobs, hurt, drawMobs } from './mobs.js';
import { shards, xp, resetLoot, drop, updateLoot, drawLoot } from './loot.js';

let t = 0;
/** @type {'play' | 'pick' | 'over'} */
let state = 'play';
let elapsed = 0;
let kills = 0;
let best = /** @type {number} */ (load('best', 0));
let freeze = 0;   // 히트스톱
let shake = 0;
let started = false;
/** @type {import('./stats.js').Upgrade[]} */
let offers = [];
/** @type {{x:number, y:number, v:number, t0:number}[]} 데미지 숫자 */
let dnums = [];
/** @type {{x:number, y:number, tx:number, ty:number, hue:number} & {m: import('./mobs.js').Mob | null} []} */
/** @type {{x:number, y:number, m: import('./mobs.js').Mob, hue:number}[]} */
let bolts = [];
let starT = 0;
let trailTickT = 0;
let hurtFlash = 0;
/** 색을 되찾은 초원 셀들 — 스토리를 메카닉으로: 잔광이 지나간 자리에 색이 돌아온다
 * @type {Set<string>} */
let healed = new Set();

const reset = () => {
  resetStats();
  resetPlayer();
  resetMobs();
  resetLoot();
  clearFx();
  bolts = [];
  dnums = [];
  healed = new Set();
  t = 0;
  elapsed = 0;
  kills = 0;
  freeze = 0;
  shake = 0;
  state = 'play';
};

/** 데미지 숫자 팝 @param {number} x @param {number} y @param {number} v */
const dnum = (x, y, v) => {
  dnums.push({ x: x + (Math.random() - 0.5) * 14, y, v: Math.round(v), t0: t });
  if (dnums.length > 40) dnums.shift();
};

/** 초원 셀 키 @param {number} x @param {number} y */
const cellKey = (x, y) => `${Math.floor(x / 96)},${Math.floor(y / 96)}`;
/** @param {number} x @param {number} y */
const heal = (x, y) => { if (healed.size < 2400) healed.add(cellKey(x, y)); };

/** 처치 공통 처리 @param {import('./mobs.js').Mob} m */
const onKill = m => {
  kills++;
  freeze = Math.min(0.08, freeze + (m.big ? 0.05 : 0.028)); // 히트스톱
  shake = Math.min(0.4, shake + (m.big ? 0.22 : 0.08));
  drop(m.x, m.y, m.big ? 5 : 1, m.big && Math.random() < 0.35);
  heal(m.x, m.y); // 어둠이 스러진 자리에도 색이 돌아온다
  if (kills % 5 === 0) glissNote(((kills / 5) | 0) % 5 + 3);
};

/** 이동 입력 (-1..1 벡터) — 키보드 8방향 + 플로팅 조이스틱 */
const moveInput = () => {
  let dx = 0, dy = 0;
  if (keys.has('ArrowLeft') || keys.has('KeyA')) dx -= 1;
  if (keys.has('ArrowRight') || keys.has('KeyD')) dx += 1;
  if (keys.has('ArrowUp') || keys.has('KeyW')) dy -= 1;
  if (keys.has('ArrowDown') || keys.has('KeyS')) dy += 1;
  if (!dx && !dy && ptr.down) {
    const jx = ptr.x - ptr.sx, jy = ptr.y - ptr.sy;
    const d = Math.hypot(jx, jy);
    if (d > 10) { dx = jx / Math.max(d, 46); dy = jy / Math.max(d, 46); }
  }
  return [dx, dy];
};

/** @param {number} dt */
export const update = dt => {
  updateCam();
  updateMusic();
  if (keysJust.has('KeyM')) toggleMute();
  if (shake > 0) shake -= dt;
  if (hurtFlash > 0) hurtFlash -= dt;

  if (state === 'over') {
    updateFx(dt);
    t += dt;
    if (ptr.justDown || keysJust.has('KeyR') || keysJust.has('Space')) reset();
    return;
  }

  if (state === 'pick') {
    t += dt * 0.08; // 선택 중엔 세계가 거의 멈춘다 (연출만 미세 진행)
    let sel = -1;
    if (keysJust.has('Digit1')) sel = 0;
    if (keysJust.has('Digit2')) sel = 1;
    if (keysJust.has('Digit3')) sel = 2;
    if (ptr.justDown) {
      const i = cardHit(ptr.sx, ptr.sy);
      if (i >= 0) sel = i;
    }
    if (sel >= 0 && offers[sel]) {
      offers[sel].apply();
      if (offers[sel].name === 'Brave Heart') P.hp = Math.min(stats.maxHp, P.hp + 1);
      state = 'play';
      rescueChord();
      ring(P.x, P.y - 20);
    }
    return;
  }

  // ── play ──
  if (freeze > 0) { freeze -= dt; return; } // 히트스톱: 세계 정지
  t += dt;
  elapsed += dt;
  music.intensity = Math.min(1, elapsed / 90);

  const [dx, dy] = moveInput();
  if (dx || dy) started = true;
  updatePlayer(dx, dy, dt, t);
  heal(P.x, P.y); // 유니콘이 달린 자리는 색을 되찾는다

  spawnMobs(dt, elapsed);
  updateMobs(dt);

  // 잔광 데미지 틱
  trailTickT -= dt;
  if (trailTickT <= 0) {
    trailTickT = 0.14;
    for (const m of [...mobs]) {
      if (m.tick <= 0 && onTrail(m.x, m.y)) {
        m.tick = 0.24;
        dnum(m.x, m.y - m.r, stats.trailDmg);
        if (hurt(m, stats.trailDmg, 0, 0)) onKill(m);
      }
    }
  }

  // 별 화살 — 가장 가까운 적 N기 조준
  starT -= dt;
  if (starT <= 0 && mobs.length) {
    starT = 1.05;
    const near = [...mobs]
      .sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y))
      .slice(0, stats.stars);
    for (const m of near) {
      bolts.push({ x: P.x, y: P.y - 30, m, hue: Math.random() * 360 });
    }
    glissNote(7);
  }
  bolts = bolts.filter(b => {
    if (!mobs.includes(b.m)) return false;
    const d = Math.hypot(b.m.x - b.x, b.m.y - b.y) || 1;
    b.x += ((b.m.x - b.x) / d) * 520 * dt;
    b.y += ((b.m.y - b.y) / d) * 520 * dt;
    sparkle(b.x, b.y, 1, 20);
    if (d < b.m.r + 6) {
      dnum(b.m.x, b.m.y - b.m.r, stats.starDmg);
      const kb = 130;
      if (hurt(b.m, stats.starDmg, ((b.m.x - P.x) / d) * kb, ((b.m.y - P.y) / d) * kb)) onKill(b.m);
      else shake = Math.min(0.3, shake + 0.03);
      return false;
    }
    return true;
  });

  // 접촉 피해
  if (P.inv <= 0) {
    for (const m of mobs) {
      if (Math.hypot(m.x - P.x, m.y - (P.y - 14)) < m.r + 13) {
        P.hp--;
        P.inv = 1.3;
        shake = 0.55;
        hurtFlash = 0.3;
        freeze = 0.06;
        S.pop();
        eraseNote();
        // 주변 적 밀쳐내기 (숨돌릴 틈)
        for (const o of mobs) {
          const d = Math.hypot(o.x - P.x, o.y - P.y) || 1;
          if (d < 140) { o.kx += ((o.x - P.x) / d) * 500; o.ky += ((o.y - P.y) / d) * 500; }
        }
        if (P.hp <= 0) {
          state = 'over';
          best = Math.max(best, kills);
          save('best', best);
        }
        break;
      }
    }
  }

  const got = updateLoot(dt);
  if (got.picked) glissNote((xp.cur % 5) + 9);
  if (got.healed) rescueChord();
  if (got.leveled) {
    state = 'pick';
    offers = rollUpgrades();
    winFanfare();
    sparkle(P.x, P.y - 20, 20, 160);
  }

  dnums = dnums.filter(d => t - d.t0 < 0.7);
  updateFx(dt);
};

// ── 렌더 ───────────────────────────────────────────────────────────────────

export const draw = () => {
  updateCam();
  beginWorld();
  // 카메라: 유니콘 중심
  ctx.translate(VW / 2 - P.x, VH / 2 - P.y);
  drawMeadow();
  drawTrail(t);
  drawLoot(t);
  drawMobs(t);
  drawPlayer(t);
  // 별 화살
  for (const b of bolts) {
    ctx.fillStyle = `hsl(${b.hue} 95% 75%)`;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(t * 10);
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 3 : 7;
      const a = (i * Math.PI) / 5;
      i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  drawFx();
  // 데미지 숫자
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const d of dnums) {
    const age = (t - d.t0) / 0.7;
    ctx.globalAlpha = 1 - age;
    ctx.font = '800 15px system-ui, sans-serif';
    ctx.strokeStyle = 'rgba(40,25,70,.6)';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.strokeText(String(d.v), d.x, d.y - age * 24);
    ctx.fillStyle = '#fff';
    ctx.fillText(String(d.v), d.x, d.y - age * 24);
  }
  ctx.globalAlpha = 1;
  endWorld();

  // 비네트 — 가장자리를 어둠이 조인다 (폭풍의 압박감 + 시선 집중)
  const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.72);
  vg.addColorStop(0, 'rgba(15,8,35,0)');
  vg.addColorStop(1, 'rgba(15,8,35,.4)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  // 스크린 셰이크는 스크린 레이어에서 (HUD 이전)
  if (shake > 0) {
    ctx.save();
    ctx.translate((Math.random() - 0.5) * shake * 20, (Math.random() - 0.5) * shake * 20);
  }
  drawHud();
  if (shake > 0) ctx.restore();

  // 피격 붉은 비네트
  if (hurtFlash > 0) {
    ctx.fillStyle = `rgba(255,80,110,${hurtFlash * 0.5})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (state === 'pick') drawPick();
  if (state === 'over') drawOver();
  else if (!started) drawHint();
};

/**
 * 색을 빼앗긴 들판 — 폭풍이 삼킨 황혼의 초원.
 * 유니콘이 지나가(healed) 색을 되찾은 셀만 꽃이 다시 핀다:
 * 플레이할수록 지나온 길이 색으로 물드는 것이 화면에 남는다.
 */
const drawMeadow = () => {
  const ox = overdrawX(), oy = overdrawY();
  const x0 = P.x - VW / 2 - ox, y0 = P.y - VH / 2 - oy;
  const w = VW + ox * 2, h = VH + oy * 2;
  ctx.fillStyle = '#413b5c';
  ctx.fillRect(x0, y0, w, h);
  // 큰 체커 띠 — 이동 체감
  const C = 128;
  for (let gx = Math.floor(x0 / C); gx <= (x0 + w) / C; gx++) {
    for (let gy = Math.floor(y0 / C); gy <= (y0 + h) / C; gy++) {
      if ((gx + gy) % 2) continue;
      ctx.fillStyle = 'rgba(255,255,255,.016)';
      ctx.fillRect(gx * C, gy * C, C, C);
    }
  }
  // 결정적 꽃·풀 — healed 셀은 색과 반짝임을 되찾는다
  const G = 96;
  for (let gx = Math.floor(x0 / G); gx <= (x0 + w) / G; gx++) {
    for (let gy = Math.floor(y0 / G); gy <= (y0 + h) / G; gy++) {
      const r = Math.abs(Math.sin(gx * 12.9898 + gy * 78.233) * 43758.5453) % 1;
      const fx2 = gx * G + r * G, fy2 = gy * G + ((r * 7919) % 1) * G;
      const alive = healed.has(`${gx},${gy}`);
      if (r < 0.3) {
        if (alive) {
          // 되살아난 꽃 — 파스텔 + 살짝 커짐
          ctx.fillStyle = ['#ff9fb6', '#ffd76e', '#c9a6ff', '#8fe0ff'][(gx + gy * 3) % 4];
          for (let p = 0; p < 5; p++) {
            const a = (p * Math.PI * 2) / 5 + r * 6;
            ctx.beginPath();
            ctx.arc(fx2 + Math.cos(a) * 3.4, fy2 + Math.sin(a) * 3.4, 2.2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(fx2, fy2, 1.7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(255,255,255,${0.4 + 0.4 * Math.sin(t * 3 + gx * 2 + gy)})`;
          ctx.fillRect(fx2 + 5, fy2 - 6, 1.8, 1.8);
        } else {
          // 시든 꽃 — 회색으로 고개 숙임
          ctx.strokeStyle = 'rgba(120,112,150,.7)';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(fx2, fy2 + 6);
          ctx.quadraticCurveTo(fx2 + 1, fy2 - 1, fx2 + 4.5, fy2 + 0.5);
          ctx.stroke();
          ctx.fillStyle = '#787092';
          for (let p = 0; p < 4; p++) {
            const a = (p * Math.PI * 2) / 4 + 0.4;
            ctx.beginPath();
            ctx.arc(fx2 + 4.5 + Math.cos(a) * 2.4, fy2 + 0.5 + Math.sin(a) * 2.4, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (r < 0.62) {
        ctx.strokeStyle = alive ? 'rgba(140,220,160,.6)' : 'rgba(90,84,120,.6)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(fx2, fy2 + 5);
        ctx.lineTo(fx2 + (alive ? 2.5 : 4), fy2 - (alive ? 3 : 0.5));
        ctx.moveTo(fx2 + 5, fy2 + 5);
        ctx.lineTo(fx2 + 6.5, fy2 + (alive ? 0 : 3));
        ctx.stroke();
      }
    }
  }
  // 낮게 깔린 안개 — 가산 블렌딩으로 확실하게 '밝은 김'으로만 보이게
  ctx.globalCompositeOperation = 'lighter';
  for (let gx = Math.floor(x0 / 512); gx <= (x0 + w) / 512; gx++) {
    for (let gy = Math.floor(y0 / 512); gy <= (y0 + h) / 512; gy++) {
      const r = Math.abs(Math.sin(gx * 31.7 + gy * 17.3)) % 1;
      if (r < 0.55) continue;
      const mx = gx * 512 + r * 400 + Math.sin(t * 0.4 + gx + gy) * 30;
      const my = gy * 512 + ((r * 977) % 1) * 400;
      const mg = ctx.createRadialGradient(mx, my, 10, mx, my, 150);
      mg.addColorStop(0, 'rgba(130,115,180,.07)');
      mg.addColorStop(1, 'rgba(130,115,180,0)');
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.ellipse(mx, my, 150, 50, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalCompositeOperation = 'source-over';
  // 저 멀리 번개 — 폭풍이 아직 세상을 쥐고 있다
  const lp = t % 6.7;
  if (lp < 0.14) {
    ctx.fillStyle = `rgba(210,190,255,${lp < 0.05 ? 0.09 : 0.04})`;
    ctx.fillRect(x0, y0, w, h);
  }
};

// ── HUD / 오버레이 ─────────────────────────────────────────────────────────

const drawHud = () => {
  ctx.textBaseline = 'middle';
  // 생존 시간 (상단 중앙)
  const mm = String((elapsed / 60) | 0).padStart(2, '0');
  const ss = String((elapsed | 0) % 60).padStart(2, '0');
  ctx.textAlign = 'center';
  ctx.font = `800 ${Math.max(18, H * 0.05)}px system-ui, sans-serif`;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(40,25,70,.5)';
  ctx.lineWidth = 5;
  ctx.strokeText(`${mm}:${ss}`, W / 2, 30);
  ctx.fillStyle = '#fff';
  ctx.fillText(`${mm}:${ss}`, W / 2, 30);
  // 킬 수
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.strokeStyle = 'rgba(40,25,70,.5)';
  ctx.lineWidth = 3;
  ctx.strokeText(`☁ ${kills}`, W / 2, 56);
  ctx.fillStyle = '#ffd9e8';
  ctx.fillText(`☁ ${kills}`, W / 2, 56);
  // 하트
  for (let i = 0; i < stats.maxHp; i++) heart(24 + i * 26, 26, i < P.hp);
  // XP 바 (하단 전폭) + 레벨
  const bh = 12;
  ctx.fillStyle = 'rgba(40,25,70,.4)';
  ctx.fillRect(0, H - bh, W, bh);
  const frac = xp.cur / xp.need;
  if (frac > 0) {
    const g = ctx.createLinearGradient(0, 0, W, 0);
    RAINBOW.forEach((c, i) => g.addColorStop(i / 6, c));
    ctx.fillStyle = g;
    ctx.fillRect(0, H - bh, W * frac, bh);
  }
  ctx.textAlign = 'right';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.fillStyle = '#fff';
  ctx.fillText(`LV ${xp.level}`, W - 10, H - bh - 10);
};

/** @param {number} x @param {number} y @param {boolean} lit */
const heart = (x, y, lit) => {
  ctx.fillStyle = lit ? '#ff6b81' : 'rgba(255,255,255,.2)';
  ctx.beginPath();
  ctx.moveTo(x, y + 7);
  ctx.bezierCurveTo(x - 11, y - 2, x - 5, y - 9, x, y - 3);
  ctx.bezierCurveTo(x + 5, y - 9, x + 11, y - 2, x, y + 7);
  ctx.fill();
};

/** 업그레이드 카드 배치 계산 @returns {{x:number, y:number, w:number, h:number}[]} */
const cardRects = () => {
  const cw = Math.min(200 * cam.s, W * 0.28);
  const ch = cw * 1.25;
  const gap = cw * 0.12;
  const total = cw * 3 + gap * 2;
  return [0, 1, 2].map(i => ({
    x: W / 2 - total / 2 + i * (cw + gap),
    y: H / 2 - ch / 2,
    w: cw, h: ch,
  }));
};

/** @param {number} sx @param {number} sy */
const cardHit = (sx, sy) => {
  const rects = cardRects();
  for (let i = 0; i < 3; i++) {
    const r = rects[i];
    if (sx >= r.x && sx <= r.x + r.w && sy >= r.y && sy <= r.y + r.h) return i;
  }
  return -1;
};

const drawPick = () => {
  ctx.fillStyle = 'rgba(40,25,70,.45)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.font = `800 ${Math.max(18, H * 0.045)}px system-ui, sans-serif`;
  ctx.fillText('LEVEL UP!', W / 2, H * 0.16);
  const rects = cardRects();
  offers.forEach((u, i) => {
    const r = rects[i];
    const hov = Math.sin(t * 40 + i) * 2;
    ctx.save();
    ctx.translate(r.x + r.w / 2, r.y + r.h / 2 + hov);
    ctx.shadowColor = 'rgba(20,10,40,.4)';
    ctx.shadowBlur = 16;
    ctx.fillStyle = 'rgba(255,255,255,.95)';
    ctx.beginPath();
    ctx.roundRect(-r.w / 2, -r.h / 2, r.w, r.h, 14);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.save();
    ctx.clip();
    ctx.fillStyle = RAINBOW[(i * 2 + 1) % 7];
    ctx.fillRect(-r.w / 2, -r.h / 2, r.w, 5);
    ctx.restore();
    ctx.fillStyle = RAINBOW[(i * 2 + 1) % 7];
    ctx.font = `800 ${r.h * 0.3}px system-ui, sans-serif`;
    ctx.fillText(u.icon, 0, -r.h * 0.18);
    ctx.fillStyle = '#5d4a91';
    ctx.font = `800 ${r.h * 0.085}px system-ui, sans-serif`;
    ctx.fillText(u.name, 0, r.h * 0.12);
    ctx.fillStyle = '#8a76b8';
    ctx.font = `500 ${r.h * 0.07}px system-ui, sans-serif`;
    ctx.fillText(u.desc, 0, r.h * 0.26);
    ctx.fillStyle = 'rgba(138,118,184,.6)';
    ctx.font = `700 ${r.h * 0.07}px system-ui, sans-serif`;
    ctx.fillText(String(i + 1), 0, r.h * 0.4);
    ctx.restore();
  });
};

const drawHint = () => {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#e8ddff';
  ctx.font = `600 ${Math.max(13, H * 0.03)}px system-ui, sans-serif`;
  ctx.globalAlpha = 0.9;
  ctx.fillText('The storm drank the colors of the world.', W / 2, H * 0.68);
  ctx.globalAlpha = 0.7 + 0.3 * Math.sin(t * 3);
  ctx.fillStyle = '#ffd9e8';
  ctx.font = `700 ${Math.max(14, H * 0.032)}px system-ui, sans-serif`;
  ctx.fillText('Gallop, last unicorn — your afterglow burns them back', W / 2, H * 0.68 + H * 0.055);
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = '#b9a8ff';
  ctx.font = `500 ${Math.max(12, H * 0.025)}px system-ui, sans-serif`;
  ctx.fillText('WASD / drag to move', W / 2, H * 0.68 + H * 0.105);
  ctx.globalAlpha = 1;
};

const drawOver = () => {
  ctx.fillStyle = 'rgba(15,8,35,.62)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffd9e8';
  ctx.font = `800 ${Math.max(24, H * 0.065)}px system-ui, sans-serif`;
  ctx.fillText('The gloom won… this time', W / 2, H * 0.3);
  ctx.fillStyle = '#fff';
  ctx.font = `800 ${Math.max(20, H * 0.05)}px system-ui, sans-serif`;
  const mm = String((elapsed / 60) | 0).padStart(2, '0');
  const ss = String((elapsed | 0) % 60).padStart(2, '0');
  ctx.fillText(`${mm}:${ss} · ${kills} shadows · ${healed.size} blooms`, W / 2, H * 0.42);
  ctx.fillStyle = '#b9a8ff';
  ctx.font = `600 ${Math.max(13, H * 0.03)}px system-ui, sans-serif`;
  ctx.fillText(kills >= best && kills > 0 ? 'NEW BEST!' : `best ${best}`, W / 2, H * 0.5);
  ctx.globalAlpha = 0.65 + 0.35 * Math.sin(t * 3);
  ctx.fillStyle = '#e8ddff';
  ctx.font = `700 ${Math.max(14, H * 0.032)}px system-ui, sans-serif`;
  ctx.fillText('tap or R to gallop again', W / 2, H * 0.64);
  ctx.globalAlpha = 1;
};

// 테스트 훅 (제출 빌드 전 제거)
/** @type {any} */ (globalThis).agdbg = () => ({
  state, elapsed: elapsed | 0, kills, hp: P.hp, level: xp.level,
  mobs: mobs.length, shards: shards.length, trail: trail.length,
});
