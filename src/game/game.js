// AFTERGLOW — 무지개 잔광이 곧 무기인 유니콘 뱀서라이크.
// 스토리: 폭풍이 세상의 색을 삼켰다. 달려라, 마지막 유니콘.
// 이 파일은 오케스트레이터: 입력/전투 글루/씬 렌더(y-정렬 유사 3D)/HUD/공유.

import { ctx, W, H } from '../engine/view.js';
import { ptr, keys, keysJust } from '../engine/input.js';
import { save, load } from '../engine/save.js';
import { S } from '../engine/sfx.js';
import { VW, VH, AW, AH, CR, insideIsle, RAINBOW } from './const.js';
import { cam, updateCam, beginWorld, endWorld, overdrawX, overdrawY } from './cam.js';
import { updateFx, drawFx, clearFx, sparkle, ring, starPath } from './fx.js';
import {
  updateMusic, music, toggleMute, glissNote, rescueChord, winFanfare, eraseNote,
} from './music.js';
import { stats, resetStats, rollUpgrades, UPGRADES } from './stats.js';
import { P, trail, boost, resetPlayer, updatePlayer, drawTrail, drawPlayer, onTrail } from './player.js';
import { mobs, resetMobs, spawnMobs, updateMobs, hurt, drawMob, ELITE, BRUTE } from './mobs.js';
import {
  shards, items, xp, vacuum, resetLoot, drop, dropItem, updateLoot,
  drawLoot, drawItems, MAGNET, BOMB, DASH, STARS, HEART,
} from './loot.js';
let t = 0;
/** @type {'play' | 'pick' | 'over'} */
let state = 'play';
let elapsed = 0;
let kills = 0;
let elites = 0;
let itemsUsed = 0;
let best = /** @type {number} */ (load('best', 0));
let freeze = 0;
let shake = 0;
let bombFlash = 0;
let hurtFlash = 0;
let started = false;
let toastT = 0;
let toastMsg = '';
let shareMsg = '';
/** @type {import('./stats.js').Upgrade[]} */
let offers = [];
let pickSel = 1; // 키보드/게임패드 카드 하이라이트
/** @type {{x:number, y:number, v:number, t0:number}[]} */
let dnums = [];
/** @type {{x:number, y:number, m: import('./mobs.js').Mob, hue:number}[]} */
let bolts = [];
let starT = 0;
let trailTickT = 0;
let haloA = 0;   // 헤일로 공전각
let beamT = 0;   // 프리즘 광선 쿨다운
/** @type {{x:number, y:number, a:number, t0:number}[]} */
let beamsFx = [];
/** 색을 되찾은 초원 셀들 @type {Set<string>} */
let healed = new Set();
// 섬을 덮는 총 셀 수 — 치유율(%)의 분모 (둥근 모서리 면적 보정)
const TOTAL_CELLS = Math.round((4 * AW * AH - (4 - Math.PI) * CR * CR) / (96 * 96));
let milestone = 0; // 다음 마일스톤 인덱스 (25/50/75/100%)
const healedPct = () => Math.min(100, Math.round((healed.size / TOTAL_CELLS) * 100));

const reset = () => {
  resetStats();
  resetPlayer();
  resetMobs();
  resetLoot();
  clearFx();
  bolts = [];
  dnums = [];
  beamsFx = [];
  healed = new Set();
  milestone = 0;
  haloA = 0;
  beamT = 0;
  t = 0;
  elapsed = 0;
  kills = 0;
  elites = 0;
  itemsUsed = 0;
  freeze = 0;
  shake = 0;
  bombFlash = 0;
  toastT = 0;
  shareMsg = '';
  state = 'play';
};

/** @param {string} msg */
const toast = msg => { toastMsg = msg; toastT = 2.4; };

/** @param {number} x @param {number} y @param {number} v */
const dnum = (x, y, v) => {
  dnums.push({ x: x + (Math.random() - 0.5) * 14, y, v: Math.round(v), t0: t });
  if (dnums.length > 40) dnums.shift();
};

const cellKey = (/** @type {number} */ x, /** @type {number} */ y) => `${Math.floor(x / 96)},${Math.floor(y / 96)}`;
const heal = (/** @type {number} */ x, /** @type {number} */ y) => {
  if (insideIsle(x, y)) healed.add(cellKey(x, y));
};

/** @param {import('./mobs.js').Mob} m */
const onKill = m => {
  kills++;
  freeze = Math.min(0.08, freeze + (m.type >= BRUTE ? 0.05 : 0.028));
  shake = Math.min(0.4, shake + (m.type >= BRUTE ? 0.22 : 0.08));
  drop(m.x, m.y, m.type >= BRUTE ? 5 : 1, false);
  heal(m.x, m.y);
  if (m.type === ELITE) {
    elites++;
    dropItem(m.x, m.y, t);
    winFanfare();
    sparkle(m.x, m.y, 24, 200);
  } else if (m.type === BRUTE && Math.random() < 0.12) {
    dropItem(m.x, m.y, t);
  }
  if (kills % 5 === 0) glissNote(((kills / 5) | 0) % 5 + 3);
};

/** 운빨 아이템 발동 @param {number} kind */
const useItem = kind => {
  itemsUsed++;
  if (kind === MAGNET) {
    vacuum.t = 1.7;
    glissNote(11);
    ring(P.x, P.y - 14);
  } else if (kind === BOMB) {
    bombFlash = 0.3;
    freeze = 0.07;
    shake = 0.7;
    S.pop();
    ring(P.x, P.y - 14);
    for (const m of [...mobs]) {
      const d = Math.hypot(m.x - P.x, m.y - P.y);
      if (d < 460) {
        dnum(m.x, m.y - m.r, 34);
        if (hurt(m, 34, ((m.x - P.x) / (d || 1)) * 400, ((m.y - P.y) / (d || 1)) * 400, elapsed)) onKill(m);
      }
    }
  } else if (kind === DASH) {
    boost.t = 3;
    rescueChord();
    toast('RAINBOW RUSH!');
  } else if (kind === STARS) {
    for (let i = 0; i < 14 && mobs.length; i++) {
      const m = mobs[(Math.random() * mobs.length) | 0];
      bolts.push({ x: P.x, y: P.y - 30, m, hue: Math.random() * 360 });
    }
    glissNote(12);
  } else if (kind === HEART) {
    P.hp = Math.min(stats.maxHp, P.hp + 1);
    rescueChord();
  }
};

/** 게임패드 (있으면) — 2025년 심사평 최다 반복 요구사항 */
const pad = () => {
  try { return navigator.getGamepads?.()[0] ?? null; } catch { return null; }
};
let gpPrev = { l: false, r: false, a: false, any: false };
/** 게임패드 버튼 에지 검출 @returns {{l:boolean, r:boolean, a:boolean, any:boolean}} */
const gpEdge = () => {
  const g = pad();
  const cur = {
    l: !!g && (g.buttons[14]?.pressed || (g.axes[0] ?? 0) < -0.55),
    r: !!g && (g.buttons[15]?.pressed || (g.axes[0] ?? 0) > 0.55),
    a: !!g && !!g.buttons[0]?.pressed,
    any: !!g && g.buttons.some(b => b.pressed),
  };
  const edge = {
    l: cur.l && !gpPrev.l, r: cur.r && !gpPrev.r,
    a: cur.a && !gpPrev.a, any: cur.any && !gpPrev.any,
  };
  gpPrev = cur;
  return edge;
};

const moveInput = () => {
  let dx = 0, dy = 0;
  if (keys.has('ArrowLeft') || keys.has('KeyA')) dx -= 1;
  if (keys.has('ArrowRight') || keys.has('KeyD')) dx += 1;
  if (keys.has('ArrowUp') || keys.has('KeyW')) dy -= 1;
  if (keys.has('ArrowDown') || keys.has('KeyS')) dy += 1;
  if (!dx && !dy) {
    const g = pad();
    if (g) {
      const ax = g.axes[0] ?? 0, ay = g.axes[1] ?? 0;
      if (Math.hypot(ax, ay) > 0.18) { dx = ax; dy = ay; }
    }
  }
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
  if (bombFlash > 0) bombFlash -= dt;
  if (toastT > 0) toastT -= dt;

  if (state === 'over') {
    updateFx(dt);
    t += dt;
    if (keysJust.has('KeyR') || keysJust.has('Space') || gpEdge().any) reset();
    else if (ptr.justDown) {
      const b = overBtnHit(ptr.sx, ptr.sy);
      if (b === 1) reset();
      else if (b === 0) shareScore();
    }
    return;
  }

  if (state === 'pick') {
    t += dt * 0.08;
    let sel = -1;
    const ge = gpEdge();
    // 하이라이트 이동: ←→/AD/게임패드 십자키, 확정: Enter/Space/A버튼
    if (keysJust.has('ArrowLeft') || keysJust.has('KeyA') || ge.l) pickSel = (pickSel + 2) % 3;
    if (keysJust.has('ArrowRight') || keysJust.has('KeyD') || ge.r) pickSel = (pickSel + 1) % 3;
    if (keysJust.has('Enter') || keysJust.has('Space') || ge.a) sel = pickSel;
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
  if (freeze > 0) { freeze -= dt; return; }
  t += dt;
  elapsed += dt;
  music.intensity = Math.min(1, elapsed / 90);

  const [dx, dy] = moveInput();
  if (dx || dy) started = true;
  updatePlayer(dx, dy, dt, t);
  heal(P.x, P.y);

  // 치유 마일스톤 — 초원이 되살아날수록 선물이 핀다
  const pct = healedPct();
  const TH = [25, 50, 75, 100];
  if (milestone < 4 && pct >= TH[milestone]) {
    milestone++;
    if (pct >= 100) {
      toast('The meadow is whole again! ✿');
      P.hp = stats.maxHp;
      sparkle(P.x, P.y - 20, 40, 240);
    } else {
      toast(`Meadow ${TH[milestone - 1]}% restored — a gift blooms!`);
    }
    dropItem(P.x + 60, P.y - 40, t);
    winFanfare();
  }

  const ev = spawnMobs(dt, elapsed);
  if (ev.surge) { toast('The storm surges!'); shake = Math.min(0.5, shake + 0.2); eraseNote(); }
  if (ev.elite) toast('A crowned shadow emerges…');
  updateMobs(dt, t);

  // 잔광 + 헤일로 데미지 틱 (잔광은 질주 중 2배)
  haloA += dt * (2.1 + stats.halo * 0.15);
  trailTickT -= dt;
  if (trailTickT <= 0) {
    trailTickT = 0.14;
    const dmg = stats.trailDmg * (boost.t > 0 ? 2 : 1);
    for (const m of [...mobs]) {
      if (m.tick > 0) continue;
      if (onTrail(m.x, m.y)) {
        m.tick = 0.24;
        dnum(m.x, m.y - m.r, dmg);
        if (hurt(m, dmg, 0, 0, elapsed)) onKill(m);
        continue;
      }
      // 헤일로 별 접촉
      for (let i = 0; i < stats.halo; i++) {
        const a = haloA + (i * Math.PI * 2) / stats.halo;
        const hx = P.x + Math.cos(a) * 76;
        const hy = P.y - 16 + Math.sin(a) * 62;
        if (Math.hypot(m.x - hx, m.y - hy) < 26 + m.r * 0.4) {
          m.tick = 0.24;
          dnum(m.x, m.y - m.r, 9);
          if (hurt(m, 9, Math.cos(a) * 120, Math.sin(a) * 120, elapsed)) onKill(m);
          break;
        }
      }
    }
  }

  // 프리즘 광선 — 가장 가까운 적 방향으로 관통 사격
  if (stats.beam > 0) {
    beamT -= dt;
    if (beamT <= 0 && mobs.length) {
      beamT = 3.4;
      let tgt = mobs[0], td = 1e9;
      for (const m of mobs) {
        const d = Math.hypot(m.x - P.x, m.y - P.y);
        if (d < td) { td = d; tgt = m; }
      }
      const a = Math.atan2(tgt.y - (P.y - 24), tgt.x - P.x);
      beamsFx.push({ x: P.x, y: P.y - 24, a, t0: t });
      const bdmg = 8 + stats.beam * 7;
      const ca = Math.cos(a), sa = Math.sin(a);
      for (const m of [...mobs]) {
        const rx = m.x - P.x, ry = m.y - (P.y - 24);
        const proj = rx * ca + ry * sa;
        if (proj < 0 || proj > 760) continue;
        if (Math.abs(-rx * sa + ry * ca) < 26 + m.r * 0.5) {
          dnum(m.x, m.y - m.r, bdmg);
          if (hurt(m, bdmg, ca * 170, sa * 170, elapsed)) onKill(m);
        }
      }
      glissNote(13);
      shake = Math.min(0.4, shake + 0.12);
    }
  }
  beamsFx = beamsFx.filter(b => t - b.t0 < 0.28);

  // 별 화살
  starT -= dt;
  if (starT <= 0 && mobs.length) {
    starT = 1.05;
    const near = [...mobs]
      .sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y))
      .slice(0, stats.stars);
    for (const m of near) bolts.push({ x: P.x, y: P.y - 30, m, hue: Math.random() * 360 });
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
      if (hurt(b.m, stats.starDmg, ((b.m.x - P.x) / d) * kb, ((b.m.y - P.y) / d) * kb, elapsed)) onKill(b.m);
      else shake = Math.min(0.3, shake + 0.03);
      return false;
    }
    return true;
  });

  // 접촉 — 질주 중엔 오히려 몸통 박치기가 무기
  for (const m of [...mobs]) {
    if (Math.hypot(m.x - P.x, m.y - (P.y - 14)) < m.r + 13) {
      if (boost.t > 0) {
        dnum(m.x, m.y - m.r, 22);
        if (hurt(m, 22, ((m.x - P.x) / 40) * 300, ((m.y - P.y) / 40) * 300, elapsed)) onKill(m);
        continue;
      }
      if (P.inv > 0) continue;
      P.hp--;
      P.inv = 1.3;
      shake = 0.55;
      hurtFlash = 0.3;
      freeze = 0.06;
      S.pop();
      eraseNote();
      for (const o of mobs) {
        const d2 = Math.hypot(o.x - P.x, o.y - P.y) || 1;
        if (d2 < 140) { o.kx += ((o.x - P.x) / d2) * 500; o.ky += ((o.y - P.y) / d2) * 500; }
      }
      if (P.hp <= 0) {
        state = 'over';
        best = Math.max(best, kills);
        save('best', best);
      }
      break;
    }
  }

  const got = updateLoot(dt, t);
  if (got.picked) glissNote((xp.cur % 5) + 9);
  for (const k of got.gotItems) useItem(k);
  if (got.leveled) {
    state = 'pick';
    offers = rollUpgrades();
    pickSel = 1;
    winFanfare();
    sparkle(P.x, P.y - 20, 20, 160);
  }

  dnums = dnums.filter(d => t - d.t0 < 0.7);
  updateFx(dt);
};

// ── 렌더 ───────────────────────────────────────────────────────────────────

/** 유사난수 @param {number} a @param {number} b */
const rnd = (a, b) => Math.abs(Math.sin(a * 12.9898 + b * 78.233) * 43758.5453) % 1;

/** 구름 퍼프 (fillStyle은 호출자가) @param {number} x @param {number} y @param {number} s */
const puff = (x, y, s) => {
  for (const [ox2, oy2, cr2] of [[-36, 4, 21], [0, -7, 29], [32, 3, 23], [9, 9, 26]]) {
    ctx.beginPath();
    ctx.arc(x + ox2 * s, y + oy2 * s, cr2 * s, 0, Math.PI * 2);
    ctx.fill();
  }
};

// 카메라 중심 (아레나 클램프 — 장벽 너머는 66px까지만 보인다)
let camX = 0, camY = 0;

export const draw = () => {
  updateCam();
  camX = Math.max(-AW + VW / 2 - 130, Math.min(AW - VW / 2 + 130, P.x));
  camY = Math.max(-AH + VH / 2 - 130, Math.min(AH - VH / 2 + 130, P.y));
  beginWorld();
  ctx.translate(VW / 2 - camX, VH / 2 - camY);
  drawScene();
  drawTrail(t);
  drawLoot(t);
  drawItems(t);

  // ── y-정렬 렌더 — 높이 있는 소품과 개체가 앞뒤로 겹치며 입체감을 만든다
  /** @type {{y:number, f:() => void}[]} */
  const scene = [];
  collectProps(scene);
  for (const m of mobs) scene.push({ y: m.y + m.r, f: () => drawMob(m, t) });
  scene.push({ y: P.y + 1, f: () => drawPlayer(t) });
  scene.sort((a, b) => a.y - b.y);
  for (const s of scene) s.f();

  // 호른 헤일로 — 유니콘 주위를 도는 별들 (타원 궤도 = 유사 3D)
  for (let i = 0; i < stats.halo; i++) {
    const a = haloA + (i * Math.PI * 2) / stats.halo;
    const hx = P.x + Math.cos(a) * 76;
    const hy = P.y - 16 + Math.sin(a) * 62;
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(255,235,160,.25)';
    ctx.beginPath();
    ctx.arc(hx, hy, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#ffe58a';
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(t * 4 + i);
    starPath(7);
    ctx.fill();
    ctx.restore();
  }

  // 프리즘 광선 잔상
  for (const b of beamsFx) {
    const p = (t - b.t0) / 0.28;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.a);
    ctx.globalCompositeOperation = 'lighter';
    const bw2 = 26 * (1 - p) + 6;
    const g = ctx.createLinearGradient(0, 0, 760, 0);
    g.addColorStop(0, `rgba(255,255,255,${0.8 * (1 - p)})`);
    g.addColorStop(1, `rgba(200,160,255,${0.25 * (1 - p)})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, -bw2 / 2, 760, bw2);
    for (let bnd = 0; bnd < 7; bnd++) {
      ctx.fillStyle = RAINBOW[bnd].replace(')', ` / ${0.35 * (1 - p)})`);
      ctx.fillRect(0, -bw2 / 2 + (bw2 * bnd) / 7, 760, bw2 / 7);
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  for (const b of bolts) {
    ctx.fillStyle = `hsl(${b.hue} 95% 75%)`;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(t * 10);
    starPath(7);
    ctx.fill();
    ctx.restore();
  }
  drawFx();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const d of dnums) {
    const age = (t - d.t0) / 0.7;
    ctx.globalAlpha = 1 - age;
    ctx.font = '800 15px system-ui, sans-serif';
    ctx.strokeStyle = 'rgba(20,14,40,.6)';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.strokeText(String(d.v), d.x, d.y - age * 24);
    ctx.fillStyle = '#fff';
    ctx.fillText(String(d.v), d.x, d.y - age * 24);
  }
  ctx.globalAlpha = 1;
  endWorld();

  // 폭탄 섬광
  if (bombFlash > 0) {
    ctx.fillStyle = `rgba(255,245,220,${bombFlash * 1.6})`;
    ctx.fillRect(0, 0, W, H);
  }
  // 비네트
  const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.72);
  vg.addColorStop(0, 'rgba(12,18,12,0)');
  vg.addColorStop(1, 'rgba(10,16,10,.42)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  if (shake > 0) {
    ctx.save();
    ctx.translate((Math.random() - 0.5) * shake * 20, (Math.random() - 0.5) * shake * 20);
  }
  drawHud();
  if (shake > 0) ctx.restore();

  if (hurtFlash > 0) {
    ctx.fillStyle = `rgba(255,80,110,${hurtFlash * 0.5})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (state === 'pick') drawPick();
  if (state === 'over') drawOver();
  else if (!started) drawHint();
};

/** 섬 실루엣 패스 (둥근 슬랩) @param {number} inset @param {number} [dy] */
const islePath = (inset, dy = 0) => {
  ctx.beginPath();
  ctx.roundRect(-AW + inset, -AH + inset + dy, (AW - inset) * 2, (AH - inset) * 2, Math.max(20, CR - inset));
};

/**
 * 하늘 섬 씬 — 해질녘 하늘 위에 뜬 초원 슬랩.
 * 하늘·아래를 흐르는 구름·원경 부유섬 → 섬 그늘 → 절벽 측면 → 표면 →
 * (클립) 초원 디테일 → 테두리·매달린 풀·무지개 폭포.
 */
const drawScene = () => {
  const ox = overdrawX(), oy = overdrawY();
  const x0 = camX - VW / 2 - ox, y0 = camY - VH / 2 - oy;
  const w = VW + ox * 2, h = VH + oy * 2;

  // ── 해질녘 하늘 (월드 y 고정 그라디언트 — 섬 위쪽이 밝은 하늘, 아래쪽이 노을)
  const sg = ctx.createLinearGradient(0, -AH - 640, 0, AH + 720);
  sg.addColorStop(0, '#6c7cbd');
  sg.addColorStop(0.55, '#a98fc9');
  sg.addColorStop(1, '#e5b4bb');
  ctx.fillStyle = sg;
  ctx.fillRect(x0, y0, w, h);

  // 섬 '아래'를 흐르는 구름들 (+ 간간이 폭풍의 먹구름)
  for (let gx = Math.floor(x0 / 460); gx <= (x0 + w) / 460; gx++) {
    for (let gy = Math.floor(y0 / 460); gy <= (y0 + h) / 460; gy++) {
      const r = rnd(gx * 9, gy * 13);
      if (r < 0.45) continue;
      const cxx = gx * 460 + r * 300 + Math.sin(t * 0.07 + r * 9) * 120 + t * 9;
      const cyy = gy * 460 + ((r * 977) % 1) * 300 + Math.sin(t * 0.2 + gx) * 8;
      const dark = r > 0.9;
      ctx.fillStyle = dark ? 'rgba(44,38,70,.6)' : `rgba(255,246,244,${0.5 + r * 0.25})`;
      puff(cxx, cyy, 0.55 + r * 0.5);
    }
  }

  // 섬 기슭을 감싸는 상시 구름 — "떠 있음"을 어느 가장자리에서든 읽게 한다
  for (const [ex, ey, es, i] of [
    [-AW - 105, -AH * 0.35, 1.15, 0], [AW + 95, AH * 0.28, 1.3, 1], [AW + 115, -AH * 0.5, 0.95, 2],
    [-AW * 0.45, AH + 105, 1.5, 3], [AW * 0.5, AH + 120, 1.25, 4], [AW * 0.05, -AH - 100, 1.1, 5],
    [-AW - 115, AH * 0.75, 1.05, 6],
  ]) {
    ctx.fillStyle = `rgba(255,248,246,${0.75 - i * 0.04})`;
    puff(ex, ey + Math.sin(t * 0.35 + i * 2.1) * 9, es * 1.15);
  }

  // 원경 부유섬 2개 — 섬 아래/위 (세로 화면과 가장자리 오버슛에서 보인다)
  for (const [ix, iy, is] of [[-380, AH + 460, 0.5], [430, -AH - 420, 0.4]]) {
    const bob = Math.sin(t * 0.25 + ix) * 7;
    ctx.save();
    ctx.translate(ix, iy + bob);
    ctx.scale(is, is);
    ctx.globalAlpha = 0.88;
    ctx.fillStyle = '#4a3a30';
    ctx.beginPath();
    ctx.roundRect(-190, -60 + 22, 380, 120, 60);
    ctx.fill();
    ctx.fillStyle = '#44564a';
    ctx.beginPath();
    ctx.roundRect(-190, -60, 380, 120, 60);
    ctx.fill();
    for (let b = 0; b < 3; b++) {
      ctx.fillStyle = RAINBOW[b * 2].replace(')', ' / .3)');
      ctx.fillRect(-30 + b * 9, 58, 4, 90 + Math.sin(t + b) * 8);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // ── 섬이 하늘에 드리우는 그늘 → 절벽 측면 → 표면
  ctx.fillStyle = 'rgba(20,16,44,.16)';
  islePath(0, 96);
  ctx.fill();
  const cliff = ctx.createLinearGradient(0, AH - 160, 0, AH + 36);
  cliff.addColorStop(0, '#5a463a');
  cliff.addColorStop(1, '#382b23');
  ctx.fillStyle = cliff;
  islePath(0, 32);
  ctx.fill();
  // 측면 바위 결
  for (let x = Math.floor(Math.max(x0, -AW) / 90) * 90; x <= Math.min(x0 + w, AW); x += 90) {
    const r = rnd(x, 3);
    ctx.fillStyle = 'rgba(30,22,18,.5)';
    ctx.beginPath();
    ctx.ellipse(x + r * 40, AH + 10 + r * 14, 14 + r * 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#47584c';
  islePath(0);
  ctx.fill();

  // ── 초원 디테일 (섬 안으로 클립)
  ctx.save();
  islePath(4);
  ctx.clip();
  drawMeadow(x0, y0, w, h);
  ctx.restore();

  // ── 테두리: 흙 립(전 둘레) + 안쪽 하이라이트 + 매달린 풀 + 무지개 폭포
  ctx.strokeStyle = 'rgba(56,43,35,.85)';
  ctx.lineWidth = 4;
  islePath(1);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.1)';
  ctx.lineWidth = 4;
  islePath(6);
  ctx.stroke();
  // 매달린 풀 — 아래·좌·우 직선 구간 (중력 방향으로 늘어진다)
  ctx.lineCap = 'round';
  /** @param {number} px3 @param {number} py3 @param {number} seed */
  const tuft = (px3, py3, seed) => {
    ctx.strokeStyle = 'rgba(58,76,58,.9)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      ctx.moveTo(px3 + i * 4, py3);
      ctx.quadraticCurveTo(px3 + i * 4 + 1, py3 + 8, px3 + i * 4 + Math.sin(t * 1.5 + i + seed * 9) * 3, py3 + 14 + (i % 2) * 5);
    }
    ctx.stroke();
  };
  for (let x = Math.floor(Math.max(x0, -AW + CR) / 130) * 130; x <= Math.min(x0 + w, AW - CR); x += 130) {
    tuft(x + rnd(x, 7) * 50, AH - 1, rnd(x, 7));
  }
  for (let y = Math.floor(Math.max(y0, -AH + CR) / 150) * 150; y <= Math.min(y0 + h, AH - CR); y += 150) {
    tuft(AW - 8 - rnd(y, 3) * 6, y + rnd(y, 5) * 50, rnd(y, 3));
    tuft(-AW - 2 + rnd(y, 9) * 6, y + rnd(y, 11) * 50, rnd(y, 9));
  }
  for (const wx of [-AW * 0.42, AW * 0.47]) {
    for (let b = 0; b < 3; b++) {
      const sway = Math.sin(t * 2.2 + b * 2) * 1.6;
      const fg = ctx.createLinearGradient(0, AH, 0, AH + 170);
      fg.addColorStop(0, RAINBOW[b * 2].replace(')', ' / .55)'));
      fg.addColorStop(1, RAINBOW[b * 2].replace(')', ' / 0)'));
      ctx.fillStyle = fg;
      ctx.fillRect(wx - 5 + b * 4 + sway, AH - 4, 3.2, 174);
    }
    // 낙수 물보라
    ctx.fillStyle = `rgba(255,255,255,${0.35 + 0.3 * Math.sin(t * 6 + wx)})`;
    ctx.fillRect(wx - 2 + Math.sin(t * 9) * 4, AH + 150 + Math.sin(t * 5) * 12, 2.4, 2.4);
  }
};

/**
 * 초원 디테일 — 구릉 음영, healed 패치·나비, 꽃·풀, 구름 그림자, 번개.
 * (drawScene이 섬 클립 안에서 호출)
 * @param {number} x0 @param {number} y0 @param {number} w @param {number} h
 */
const drawMeadow = (x0, y0, w, h) => {

  // 구릉 음영 — 완만한 언덕의 명암 (정적 해시 배치)
  for (let gx = Math.floor(x0 / 384); gx <= (x0 + w) / 384; gx++) {
    for (let gy = Math.floor(y0 / 384); gy <= (y0 + h) / 384; gy++) {
      const r = rnd(gx * 3, gy * 5);
      if (r < 0.45) continue;
      const hx = gx * 384 + r * 300, hy = gy * 384 + rnd(gy, gx) * 300;
      const light = r > 0.72;
      const hg = ctx.createRadialGradient(hx, hy, 20, hx, hy, 210);
      hg.addColorStop(0, light ? 'rgba(180,220,170,.07)' : 'rgba(10,25,12,.13)');
      hg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.ellipse(hx, hy, 210, 150, r * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // healed 패치 — 되살아난 잔디가 은은하게 밝다 (라디얼 페이드로 경계 없이)
  for (const k of healed) {
    const [cx, cy] = k.split(',').map(Number);
    const px2 = cx * 96 + 48, py2 = cy * 96 + 48;
    if (px2 < x0 - 70 || px2 > x0 + w + 70 || py2 < y0 - 70 || py2 > y0 + h + 70) continue;
    const pg = ctx.createRadialGradient(px2, py2, 8, px2, py2, 68);
    pg.addColorStop(0, 'rgba(140,210,130,.11)');
    pg.addColorStop(1, 'rgba(140,210,130,0)');
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.arc(px2, py2, 68, 0, Math.PI * 2);
    ctx.fill();
    // 되살아난 곳엔 나비가 산다
    const br = rnd(cx * 5, cy * 9);
    if (br < 0.22) {
      const bx = px2 + Math.sin(t * 0.55 + cx * 7) * 34;
      const by = py2 + Math.cos(t * 0.48 + cy * 5) * 26 + Math.sin(t * 3 + cx) * 4;
      const flap = 0.3 + Math.abs(Math.sin(t * 11 + cx * 3)) * 0.7;
      ctx.save();
      ctx.translate(bx, by);
      ctx.fillStyle = ['#ff9fb6', '#ffd76e', '#8fe0ff', '#c9a6ff'][(cx + cy) & 3];
      ctx.beginPath();
      ctx.ellipse(-3.2, 0, 4.2 * flap, 3, -0.45, 0, Math.PI * 2);
      ctx.ellipse(3.2, 0, 4.2 * flap, 3, 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(60,50,70,.7)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(0, -2.5);
      ctx.lineTo(0, 2.5);
      ctx.stroke();
      ctx.restore();
    }
  }

  // 꽃·풀 디테일
  const G = 96;
  for (let gx = Math.floor(x0 / G); gx <= (x0 + w) / G; gx++) {
    for (let gy = Math.floor(y0 / G); gy <= (y0 + h) / G; gy++) {
      const r = rnd(gx, gy);
      const fx2 = gx * G + r * G, fy2 = gy * G + ((r * 7919) % 1) * G;
      const alive = healed.has(`${gx},${gy}`);
      if (r < 0.3) {
        if (alive) {
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
          ctx.strokeStyle = 'rgba(112,128,108,.8)';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(fx2, fy2 + 6);
          ctx.quadraticCurveTo(fx2 + 1, fy2 - 1, fx2 + 4.5, fy2 + 0.5);
          ctx.stroke();
          ctx.fillStyle = '#77876f';
          for (let p = 0; p < 4; p++) {
            const a = (p * Math.PI * 2) / 4 + 0.4;
            ctx.beginPath();
            ctx.arc(fx2 + 4.5 + Math.cos(a) * 2.4, fy2 + 0.5 + Math.sin(a) * 2.4, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (r < 0.62) {
        ctx.strokeStyle = alive ? 'rgba(150,225,140,.7)' : 'rgba(96,114,92,.7)';
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

  // 구름 그림자 — 들판 위를 느리게 흐른다 (강력한 입체 단서)
  for (let gx = Math.floor(x0 / 760); gx <= (x0 + w) / 760; gx++) {
    for (let gy = Math.floor(y0 / 760); gy <= (y0 + h) / 760; gy++) {
      const r = rnd(gx * 7, gy * 11);
      if (r < 0.5) continue;
      const sx2 = gx * 760 + r * 500 + Math.sin(t * 0.11 + r * 9) * 160;
      const sy2 = gy * 760 + rnd(gy, gx * 2) * 500 + Math.cos(t * 0.09 + r * 5) * 90;
      ctx.fillStyle = 'rgba(8,14,10,.1)';
      for (const [bx2, by2, br] of [[-70, 0, 90], [30, -25, 75], [80, 15, 65]]) {
        ctx.beginPath();
        ctx.ellipse(sx2 + bx2, sy2 + by2, br, br * 0.62, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // 저 멀리 번개
  const lp = t % 6.7;
  if (lp < 0.14) {
    ctx.fillStyle = `rgba(220,230,255,${lp < 0.05 ? 0.07 : 0.03})`;
    ctx.fillRect(x0, y0, w, h);
  }
};

/**
 * 높이 있는 소품 수집 — 나무/덤불/바위/억새. healed 셀에선 소생한다.
 * @param {{y:number, f:() => void}[]} scene
 */
const collectProps = scene => {
  const ox = overdrawX(), oy = overdrawY();
  const x0 = camX - VW / 2 - ox, y0 = camY - VH / 2 - oy;
  const w = VW + ox * 2, h = VH + oy * 2;
  const G = 224;
  for (let gx = Math.floor(x0 / G); gx <= (x0 + w) / G; gx++) {
    for (let gy = Math.floor((y0 - 90) / G); gy <= (y0 + h) / G; gy++) {
      const r = rnd(gx * 13, gy * 17);
      if (r > 0.3) continue;
      const px2 = gx * G + rnd(gx, gy * 3) * (G - 60) + 30;
      const py2 = gy * G + rnd(gy * 3, gx) * (G - 60) + 30;
      if (!insideIsle(px2, py2, 46)) continue; // 섬 밖 소품 없음
      const alive = healed.has(cellKey(px2, py2));
      if (r < 0.05) scene.push({ y: py2, f: () => tree(px2, py2, alive, r) });
      else if (r < 0.11) scene.push({ y: py2, f: () => bush(px2, py2, alive, r) });
      else if (r < 0.16) scene.push({ y: py2, f: () => rock(px2, py2, r) });
      else scene.push({ y: py2, f: () => reeds(px2, py2, alive, r) });
    }
  }
};

/** @param {number} x @param {number} y @param {boolean} alive @param {number} sd */
const tree = (x, y, alive, sd) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(8,14,10,.25)';
  ctx.beginPath();
  ctx.ellipse(0, 3, 26, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // 줄기
  ctx.strokeStyle = alive ? '#6b5240' : '#565650';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(2, -28, sd * 8 - 3, -46);
  ctx.stroke();
  if (alive) {
    // 소생한 수관 + 꽃
    for (const [cx2, cy2, cr, col] of [
      [-14, -52, 17, '#5e9a6a'], [10, -60, 20, '#6fae7d'], [-2, -44, 15, '#548c60'], [16, -46, 13, '#6fae7d'],
    ]) {
      ctx.fillStyle = /** @type {string} */ (col);
      ctx.beginPath();
      ctx.arc(/** @type {number} */(cx2), /** @type {number} */(cy2), /** @type {number} */(cr), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#ffb6cd';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(-16 + rnd(i, sd * 99) * 36, -66 + rnd(sd * 99, i) * 24, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // 앙상한 가지
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(1, -30);
    ctx.lineTo(-14, -48);
    ctx.moveTo(2, -38);
    ctx.lineTo(16, -54);
    ctx.moveTo(sd * 8 - 3, -46);
    ctx.lineTo(sd * 8 - 9, -62);
    ctx.stroke();
  }
  ctx.restore();
};

/** @param {number} x @param {number} y @param {boolean} alive @param {number} sd */
const bush = (x, y, alive, sd) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(8,14,10,.2)';
  ctx.beginPath();
  ctx.ellipse(0, 2, 16, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  for (const [cx2, cy2, cr] of [[-8, -7, 9], [6, -9, 10], [0, -4, 9]]) {
    ctx.fillStyle = alive ? '#5e9a6a' : '#5c6b58';
    ctx.beginPath();
    ctx.arc(cx2, cy2, cr, 0, Math.PI * 2);
    ctx.fill();
  }
  if (alive) {
    ctx.fillStyle = '#ffd76e';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(-8 + rnd(i, sd * 77) * 18, -12 + rnd(sd * 77, i) * 8, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
};

/** @param {number} x @param {number} y @param {number} sd */
const rock = (x, y, sd) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(8,14,10,.2)';
  ctx.beginPath();
  ctx.ellipse(0, 2, 15, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#707a80';
  ctx.beginPath();
  ctx.moveTo(-13, 0);
  ctx.lineTo(-8, -12 - sd * 10);
  ctx.lineTo(3, -15 - sd * 8);
  ctx.lineTo(12, -6);
  ctx.lineTo(13, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.beginPath();
  ctx.moveTo(-8, -12 - sd * 10);
  ctx.lineTo(3, -15 - sd * 8);
  ctx.lineTo(1, -7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

/** @param {number} x @param {number} y @param {boolean} alive @param {number} sd */
const reeds = (x, y, alive, sd) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = alive ? 'rgba(150,225,140,.85)' : 'rgba(104,122,100,.85)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const a = -0.5 + i * 0.32 + sd;
    ctx.beginPath();
    ctx.moveTo(i * 3 - 5, 2);
    ctx.quadraticCurveTo(i * 3 - 5 + a * 6, -8, i * 3 - 5 + a * 12, -16 - (i % 2) * 5);
    ctx.stroke();
  }
  if (alive) {
    ctx.fillStyle = '#ff9fb6';
    ctx.beginPath();
    ctx.arc(2, -18, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};

// ── HUD / 오버레이 ─────────────────────────────────────────────────────────

const drawHud = () => {
  ctx.textBaseline = 'middle';
  const mm = String((elapsed / 60) | 0).padStart(2, '0');
  const ss = String((elapsed | 0) % 60).padStart(2, '0');
  ctx.textAlign = 'center';
  ctx.font = `800 ${Math.max(18, H * 0.05)}px system-ui, sans-serif`;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(15,25,18,.55)';
  ctx.lineWidth = 5;
  ctx.strokeText(`${mm}:${ss}`, W / 2, 30);
  ctx.fillStyle = '#fff';
  ctx.fillText(`${mm}:${ss}`, W / 2, 30);
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.strokeStyle = 'rgba(15,25,18,.55)';
  ctx.lineWidth = 3;
  ctx.strokeText(`✦ ${kills}`, W / 2, 56);
  ctx.fillStyle = '#ffd9e8';
  ctx.fillText(`✦ ${kills}`, W / 2, 56);
  for (let i = 0; i < stats.maxHp; i++) heart2(24 + i * 26, 26, i < P.hp);
  // 초원 치유율 — 꽃 아이콘 + %
  const pct2 = healedPct();
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ff9fb6';
  for (let p = 0; p < 5; p++) {
    const a = (p * Math.PI * 2) / 5;
    ctx.beginPath();
    ctx.arc(22 + Math.cos(a) * 3.4, 56 + Math.sin(a) * 3.4, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(22, 56, 1.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.strokeStyle = 'rgba(15,25,18,.55)';
  ctx.lineWidth = 3;
  ctx.strokeText(`${pct2}%`, 33, 57);
  ctx.fillStyle = '#d9f0dc';
  ctx.fillText(`${pct2}%`, 33, 57);
  const bh = 12;
  ctx.fillStyle = 'rgba(15,25,18,.5)';
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
  // 토스트 (서지/엘리트/질주)
  if (toastT > 0) {
    ctx.globalAlpha = Math.min(1, toastT);
    ctx.textAlign = 'center';
    ctx.font = `800 ${Math.max(15, H * 0.036)}px system-ui, sans-serif`;
    ctx.strokeStyle = 'rgba(15,25,18,.7)';
    ctx.lineWidth = 4;
    ctx.strokeText(toastMsg, W / 2, H * 0.2);
    ctx.fillStyle = '#ffe98c';
    ctx.fillText(toastMsg, W / 2, H * 0.2);
    ctx.globalAlpha = 1;
  }
};

/** @param {number} x @param {number} y @param {boolean} lit */
const heart2 = (x, y, lit) => {
  ctx.fillStyle = lit ? '#ff6b81' : 'rgba(255,255,255,.2)';
  ctx.beginPath();
  ctx.moveTo(x, y + 7);
  ctx.bezierCurveTo(x - 11, y - 2, x - 5, y - 9, x, y - 3);
  ctx.bezierCurveTo(x + 5, y - 9, x + 11, y - 2, x, y + 7);
  ctx.fill();
};

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
  ctx.fillStyle = 'rgba(12,20,14,.5)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.font = `800 ${Math.max(18, H * 0.045)}px system-ui, sans-serif`;
  ctx.fillText('LEVEL UP!', W / 2, H * 0.16);
  const rects = cardRects();
  offers.forEach((u, i) => {
    const r = rects[i];
    ctx.save();
    ctx.translate(r.x + r.w / 2, r.y + r.h / 2 + Math.sin(t * 40 + i) * 2);
    if (i === pickSel) ctx.scale(1.06, 1.06); // 키보드/패드 하이라이트
    ctx.shadowColor = 'rgba(5,12,8,.5)';
    ctx.shadowBlur = 16;
    ctx.fillStyle = 'rgba(255,255,255,.95)';
    ctx.beginPath();
    ctx.roundRect(-r.w / 2, -r.h / 2, r.w, r.h, 14);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    if (i === pickSel) {
      ctx.strokeStyle = '#ffd76e';
      ctx.lineWidth = 3.5;
      ctx.stroke();
    }
    ctx.save();
    ctx.clip();
    ctx.fillStyle = RAINBOW[(i * 2 + 1) % 7];
    ctx.fillRect(-r.w / 2, -r.h / 2, r.w, 5);
    ctx.restore();
    ctx.fillStyle = RAINBOW[(i * 2 + 1) % 7];
    ctx.font = `800 ${r.h * 0.3}px system-ui, sans-serif`;
    ctx.fillText(u.icon, 0, -r.h * 0.18);
    ctx.fillStyle = '#3c5044';
    ctx.font = `800 ${r.h * 0.085}px system-ui, sans-serif`;
    ctx.fillText(u.name, 0, r.h * 0.12);
    ctx.fillStyle = '#6d8577';
    ctx.font = `500 ${r.h * 0.07}px system-ui, sans-serif`;
    ctx.fillText(u.desc, 0, r.h * 0.26);
    ctx.fillStyle = 'rgba(109,133,119,.6)';
    ctx.font = `700 ${r.h * 0.07}px system-ui, sans-serif`;
    ctx.fillText(String(i + 1), 0, r.h * 0.4);
    ctx.restore();
  });
};

const drawHint = () => {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#e6f0e2';
  ctx.font = `600 ${Math.max(13, H * 0.03)}px system-ui, sans-serif`;
  ctx.globalAlpha = 0.9;
  ctx.fillText('The storm drank the colors of the world.', W / 2, H * 0.68);
  ctx.globalAlpha = 0.7 + 0.3 * Math.sin(t * 3);
  ctx.fillStyle = '#ffd9e8';
  // 세로 화면에서도 잘리지 않도록 폭 기준으로도 클램프
  ctx.font = `700 ${Math.max(12, Math.min(H * 0.032, W * 0.034))}px system-ui, sans-serif`;
  ctx.fillText('Gallop, last unicorn — your afterglow burns them back', W / 2, H * 0.68 + H * 0.055);
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = '#bcd9c2';
  ctx.font = `500 ${Math.max(12, H * 0.025)}px system-ui, sans-serif`;
  ctx.fillText('WASD / drag to move', W / 2, H * 0.68 + H * 0.105);
  ctx.globalAlpha = 1;
};

/** 게임오버 버튼 배치 @returns {{x:number, y:number, w:number, h:number}[]} */
const overBtns = () => {
  const bw = Math.min(190 * cam.s, W * 0.36), bh = 52 * cam.s;
  return [0, 1].map(i => ({
    x: W / 2 - bw - 12 + i * (bw + 24),
    y: H * 0.66,
    w: bw, h: bh,
  }));
};

/** @param {number} sx @param {number} sy */
const overBtnHit = (sx, sy) => {
  const btns = overBtns();
  for (let i = 0; i < 2; i++) {
    const b = btns[i];
    if (sx >= b.x && sx <= b.x + b.w && sy >= b.y && sy <= b.y + b.h) return i;
  }
  return -1;
};

/** 점수 공유 — Web Share API, 실패 시 클립보드 복사 */
const shareScore = () => {
  const mm = String((elapsed / 60) | 0).padStart(2, '0');
  const ss = String((elapsed | 0) % 60).padStart(2, '0');
  const text = `AFTERGLOW 🌈🦄 I outlasted the storm for ${mm}:${ss} — ${kills} shadows banished, meadow ${healedPct()}% restored. Can you beat me?`;
  try {
    if (navigator.share) {
      navigator.share({ text, url: location.href }).catch(() => { /* 사용자가 취소 */ });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(`${text} ${location.href}`).catch(() => {});
      shareMsg = 'Copied to clipboard!';
    }
  } catch { /* 미지원 환경 */ }
};

const drawOver = () => {
  ctx.fillStyle = 'rgba(10,18,12,.66)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffd9e8';
  ctx.font = `800 ${Math.max(24, H * 0.062)}px system-ui, sans-serif`;
  ctx.fillText('The gloom won… this time', W / 2, H * 0.26);
  ctx.fillStyle = '#fff';
  ctx.font = `800 ${Math.max(20, H * 0.05)}px system-ui, sans-serif`;
  const mm = String((elapsed / 60) | 0).padStart(2, '0');
  const ss = String((elapsed | 0) % 60).padStart(2, '0');
  ctx.fillText(`${mm}:${ss} · ${kills} shadows · meadow ${healedPct()}%`, W / 2, H * 0.38);
  ctx.fillStyle = '#bcd9c2';
  ctx.font = `600 ${Math.max(13, H * 0.03)}px system-ui, sans-serif`;
  ctx.fillText(kills >= best && kills > 0 ? 'NEW BEST!' : `best ${best}`, W / 2, H * 0.46);
  // 버튼: SHARE / AGAIN
  const btns = overBtns();
  const labels = ['SHARE', 'AGAIN'];
  const cols = ['#8fd4ff', '#ffd76e'];
  btns.forEach((b, i) => {
    ctx.fillStyle = 'rgba(255,255,255,.94)';
    ctx.beginPath();
    ctx.roundRect(b.x, b.y, b.w, b.h, 14 * cam.s);
    ctx.fill();
    ctx.strokeStyle = cols[i];
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#3c5044';
    ctx.font = `800 ${b.h * 0.42}px system-ui, sans-serif`;
    ctx.fillText(labels[i], b.x + b.w / 2, b.y + b.h / 2 + 1);
  });
  if (shareMsg) {
    ctx.fillStyle = '#8fd4ff';
    ctx.font = `600 ${Math.max(12, H * 0.026)}px system-ui, sans-serif`;
    ctx.fillText(shareMsg, W / 2, H * 0.66 + 70 * cam.s + 14);
  }
  ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 3);
  ctx.fillStyle = '#e6f0e2';
  ctx.font = `600 ${Math.max(12, H * 0.026)}px system-ui, sans-serif`;
  ctx.fillText('R = quick restart', W / 2, H * 0.87);
  ctx.globalAlpha = 1;
};

// 테스트 훅 (제출 빌드 전 제거)
/** @type {any} */ (globalThis).agforce = (/** @type {number} */ kind) => useItem(kind);
/** @type {any} */ (globalThis).agup = (/** @type {number} */ i) => UPGRADES[i]?.apply();
/** @type {any} */ (globalThis).agdbg = () => ({
  state, elapsed: elapsed | 0, kills, hp: P.hp, level: xp.level,
  mobs: mobs.length, shards: shards.length, trail: trail.length,
  elites, items: items.length, itemsUsed, blooms: healed.size,
  // 섬 밖 유실 감시 (항상 0이어야 정상)
  outShards: shards.filter(s => !insideIsle(s.x, s.y, 20)).length,
  outMobs: mobs.filter(m => !insideIsle(m.x, m.y, 8)).length,
});
