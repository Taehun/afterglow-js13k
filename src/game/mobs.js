// 그림자 무리 — 스토리: 세상의 색을 삼킨 폭풍의 앞잡이들.
// 종류: 위습(기본) / 다트(급습 돌진) / 스플리터(죽으면 분열) / 미니 /
//       브루트(육중) / 엘리트(금관 위습 — 운빨 아이템 드랍)
// 시간이 갈수록: 스폰 가속, 체력·이속 증가, 강한 종 해금, 60초마다 서지.

import { ctx } from '../engine/view.js';
import { clampIsle } from './const.js';
import { P } from './player.js';
import { sparkle, poof } from './fx.js';

export const WISP = 0, DART = 1, SPLIT = 2, MINI = 3, BRUTE = 4, ELITE = 5;

/** 종별 기본치: [hp, 속도, 반지름] */
const BASE = [
  [6, 54, 16],   // WISP
  [4, 66, 12],   // DART
  [11, 38, 20],  // SPLIT
  [2, 78, 9],    // MINI
  [26, 33, 30],  // BRUTE
  [48, 42, 26],  // ELITE — 스펀지가 아니라 '잡을 수 있는 보상 덩어리'
];
/** 해금 시각 (초) */
const UNLOCK = [0, 45, 90, 999, 25, 40];

/**
 * @typedef {Object} Mob
 * @property {number} type
 * @property {number} x @property {number} y
 * @property {number} hp @property {number} _m
 * @property {number} r @property {number} sp
 * @property {number} _f @property {number} kx @property {number} ky
 * @property {number} _s @property {number} _k
 * @property {number} _l 다트: 돌진 타이머
 */

/** @type {Mob[]} */
export let mobs = [];
let spawnAcc = 0;
let eliteT = 75; // 다음 엘리트까지 — 빌드가 갖춰진 뒤에 등장

export const resetMobs = () => { mobs = []; spawnAcc = 0; eliteT = 75; };

/** @param {number} type @param {number} x @param {number} y @param {number} elapsed */
const make = (type, x, y, elapsed) => {
  const [hp, sp, r] = BASE[type];
  // 시간 경과 체력 보정 — 엘리트는 완만하게 (스펀지화 방지)
  const mul = 1 + elapsed * (type === ELITE ? 0.012 : 0.011);
  mobs.push({
    type, x, y,
    hp: hp * mul, _m: hp * mul,
    r, sp: sp * (1 + elapsed * 0.0015),
    _f: 0, kx: 0, ky: 0,
    _s: Math.random() * 9, _k: 0, _l: 1 + Math.random() * 2,
  });
};

/** 플레이어 시야 밖 링에서 스폰하되 아레나 안으로 클램프 —
 * 플레이어가 장벽 근처면 자연스럽게 폭풍에서 스며 나오는 그림이 된다
 * @param {number} type @param {number} elapsed */
const ringSpawn = (type, elapsed) => {
  for (let i = 0; i < 4; i++) {
    const a = Math.random() * Math.PI * 2;
    const d = 570 + Math.random() * 90;
    const [x, y] = clampIsle(P.x + Math.cos(a) * d, P.y + Math.sin(a) * d, 34);
    // 클램프로 시야 안에 떨어지면 다른 각도로 재시도 (가장자리에 붙어 있을 때)
    if (Math.hypot(x - P.x, y - P.y) > 500 || i === 3) {
      make(type, x, y, elapsed);
      return;
    }
  }
};

/** 경과 시간에 따른 스폰 종 추첨 @param {number} e */
const rollType = e => {
  const pool = [WISP, WISP, WISP];
  if (e > UNLOCK[BRUTE]) pool.push(BRUTE);
  if (e > UNLOCK[DART]) pool.push(DART, DART);
  if (e > UNLOCK[SPLIT]) pool.push(SPLIT);
  return pool[(Math.random() * pool.length) | 0];
};

/**
 * @param {number} dt @param {number} elapsed
 * @returns {{surge: boolean, elite: boolean}} 이번 프레임 발생 이벤트
 */
export const spawnMobs = (dt, elapsed) => {
  const ev = { surge: false, elite: false };
  const interval = Math.max(0.26, 1.05 - elapsed * 0.006);
  spawnAcc += dt;
  while (spawnAcc > interval && mobs.length < 150) {
    spawnAcc -= interval;
    ringSpawn(rollType(elapsed), elapsed);
  }
  // 60초마다 서지 — 한꺼번에 몰려온다
  const beat = Math.floor(elapsed / 60);
  if (beat > 0 && beat !== Math.floor((elapsed - dt) / 60)) {
    ev.surge = true;
    for (let i = 0; i < 6 + beat && mobs.length < 150; i++) ringSpawn(rollType(elapsed), elapsed);
  }
  // 엘리트 — 주기 스폰
  eliteT -= dt;
  if (eliteT <= 0) {
    eliteT = 55;
    ringSpawn(ELITE, elapsed);
    ev.elite = true;
  }
  return ev;
};

/** @param {number} dt @param {number} t */
export const updateMobs = (dt, t) => {
  for (const m of mobs) {
    const d = Math.hypot(P.x - m.x, P.y - m.y) || 1;
    let sp = m.sp;
    if (m.type === DART) {
      // 다트: 2초에 한 번 0.4초간 3배 돌진
      m._l -= dt;
      if (m._l < 0.4) sp *= 3.1;
      if (m._l <= 0) m._l = 1.7 + Math.random();
      // 지그재그
      m.x += (-(P.y - m.y) / d) * Math.sin(t * 5 + m._s * 9) * 60 * dt;
      m.y += ((P.x - m.x) / d) * Math.sin(t * 5 + m._s * 9) * 60 * dt;
    }
    m.x += ((P.x - m.x) / d) * sp * dt + m.kx * dt;
    m.y += ((P.y - m.y) / d) * sp * dt + m.ky * dt;
    // 넉백·폭발로도 섬 밖으로 밀려나지 않는다 (밖에서 죽으면 조각을 못 줍는다)
    [m.x, m.y] = clampIsle(m.x, m.y, 12);
    m.kx *= 1 - Math.min(1, dt * 8);
    m.ky *= 1 - Math.min(1, dt * 8);
    if (m._f > 0) m._f -= dt;
    if (m._k > 0) m._k -= dt;
  }
};

/**
 * 데미지 적용. 죽으면 true. (스플리터는 죽으며 미니 3기로 분열)
 * @param {Mob} m @param {number} dmg @param {number} kx @param {number} ky
 * @param {number} [elapsed]
 */
export const hurt = (m, dmg, kx, ky, elapsed = 0) => {
  m.hp -= dmg;
  m._f = 0.09;
  m.kx += kx;
  m.ky += ky;
  if (m.hp <= 0) {
    mobs = mobs.filter(v => v !== m);
    sparkle(m.x, m.y, m.type >= BRUTE ? 16 : 8, m.type >= BRUTE ? 180 : 120);
    poof(m.x, m.y);
    if (m.type === SPLIT) {
      for (let i = 0; i < 3; i++) {
        make(MINI, m.x + (Math.random() - 0.5) * 30, m.y + (Math.random() - 0.5) * 30, elapsed);
      }
    }
    return true;
  }
  return false;
};

// ── 렌더 (개별 — game.js가 y-정렬해서 호출) ────────────────────────────────

/** @param {Mob} m @param {number} t */
export const drawMob = (m, t) => {
  ctx.save();
  ctx.translate(m.x, m.y + Math.sin(t * 2 + m._s * 7) * 2.5);
  const white = m._f > 0;
  const d = Math.hypot(P.x - m.x, P.y - m.y) || 1;
  const lx = (P.x - m.x) / d, ly = (P.y - m.y) / d;

  if (m.type === BRUTE) drawBrute(m, t, white, lx, ly);
  else drawWispKind(m, t, white, lx, ly);
  ctx.restore();
};

/**
 * 위습 계열 (위습/다트/스플리터/미니/엘리트) — 크기·색·장식으로 구분
 * @param {Mob} m @param {number} t @param {boolean} white @param {number} lx @param {number} ly
 */
const drawWispKind = (m, t, white, lx, ly) => {
  const s = m.r / 16;
  ctx.scale(s, s);
  ctx.rotate(lx * (m.type === DART ? 0.3 : 0.12));
  // 엘리트 오라
  if (m.type === ELITE && !white) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(255,215,110,${0.35 + 0.2 * Math.sin(t * 5)})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, -2, 19 + Math.sin(t * 3) * 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.fillStyle = 'rgba(10,6,25,.3)';
  ctx.beginPath();
  ctx.ellipse(0, 18, 13, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // 몸통 — 돔 + 일렁이는 치맛단
  const cols = /** @type {Record<number, [string, string]>} */ ({
    [WISP]: ['#4b4270', '#2a2344'],
    [DART]: ['#5c3a6e', '#332044'],
    [SPLIT]: ['#3a4a6e', '#1f2a44'],
    [MINI]: ['#4b4270', '#2a2344'],
    [ELITE]: ['#6e5a2e', '#443318'],
  });
  const g = ctx.createLinearGradient(0, -16, 0, 16);
  g.addColorStop(0, white ? '#fff' : cols[m.type][0]);
  g.addColorStop(1, white ? '#fff' : cols[m.type][1]);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, -3, 13, Math.PI, 0);
  const wob = t * (m.type === DART ? 11 : 7) + m._s * 9;
  for (let i = 0; i <= 6; i++) {
    const wx = 13 - (26 * i) / 6;
    ctx.lineTo(wx, 10 + Math.sin(wob + i * 2.1) * 3.5 + (i % 2) * 4);
  }
  ctx.closePath();
  ctx.fill();
  if (!white) {
    // 빛나는 눈 — 유니콘을 노려본다
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = m.type === ELITE ? 'rgba(255,225,130,.95)' : m.type === DART ? 'rgba(255,140,190,.9)' : 'rgba(201,166,255,.9)';
    for (const ex of [-5, 5]) {
      ctx.beginPath();
      ctx.ellipse(ex + lx * 1.5, -5 + ly * 1.5, m.type === MINI ? 3.2 : 2.6, m.type === MINI ? 3.8 : 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    if (m.type !== MINI) {
      ctx.strokeStyle = '#1c1633';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-8.5, -10);
      ctx.lineTo(-2, -7.5);
      ctx.moveTo(8.5, -10);
      ctx.lineTo(2, -7.5);
      ctx.stroke();
    }
    // 엘리트 금관
    if (m.type === ELITE) {
      ctx.fillStyle = '#ffd76e';
      ctx.beginPath();
      ctx.moveTo(-8, -14);
      ctx.lineTo(-8, -20);
      ctx.lineTo(-4, -15.5);
      ctx.lineTo(0, -21);
      ctx.lineTo(4, -15.5);
      ctx.lineTo(8, -20);
      ctx.lineTo(8, -14);
      ctx.closePath();
      ctx.fill();
    }
    // 스플리터: 몸 안의 새끼 눈 2쌍
    if (m.type === SPLIT) {
      ctx.fillStyle = 'rgba(201,166,255,.55)';
      for (const [ex, ey] of [[-6, 4], [6, 5]]) {
        ctx.beginPath();
        ctx.arc(ex, ey, 1.6, 0, Math.PI * 2);
        ctx.arc(ex + 4, ey, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // 엘리트/큰 놈 HP 링
    if (m.type === ELITE && m.hp < m._m) {
      ctx.strokeStyle = 'rgba(255,235,140,.75)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, -2, 17, -Math.PI / 2, -Math.PI / 2 + (m.hp / m._m) * Math.PI * 2);
      ctx.stroke();
    }
  }
};

/**
 * 뇌운 브루트
 * @param {Mob} m @param {number} t @param {boolean} white @param {number} lx @param {number} ly
 */
const drawBrute = (m, t, white, lx, ly) => {
  const s = m.r / 30;
  ctx.scale(s, s);
  ctx.fillStyle = 'rgba(10,6,25,.3)';
  ctx.beginPath();
  ctx.ellipse(0, 27, 24, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = white ? '#fff' : '#241d3d';
  ctx.beginPath();
  ctx.ellipse(0, 12, 26, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = white ? '#fff' : '#3a3158';
  for (const [ox, oy, r] of [[-18, 2, 16], [0, -8, 21], [17, 2, 16], [2, 8, 18]]) {
    ctx.beginPath();
    ctx.arc(ox, oy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = white ? '#fff' : '#1c1633';
  for (const hs of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(hs * 12, -22);
    ctx.lineTo(hs * 20, -34);
    ctx.lineTo(hs * 17, -20);
    ctx.closePath();
    ctx.fill();
  }
  if (!white) {
    if (Math.sin(t * 9 + m._s * 13) > 0.82) {
      ctx.strokeStyle = 'rgba(255,235,140,.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-8, 2);
      ctx.lineTo(-2, 5);
      ctx.lineTo(-6, 9);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(255,220,120,.95)';
    for (const ex of [-8, 8]) {
      ctx.beginPath();
      ctx.arc(ex + lx * 2, -3 + ly * 2, 3.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#ffe98c';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    for (const hs of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(hs * 13, -12);
      ctx.lineTo(hs * 8, -10);
      ctx.lineTo(hs * 10, -8);
      ctx.lineTo(hs * 4, -7);
      ctx.stroke();
    }
    if (m.hp < m._m) {
      ctx.strokeStyle = 'rgba(255,235,140,.75)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 32, -Math.PI / 2, -Math.PI / 2 + (m.hp / m._m) * Math.PI * 2);
      ctx.stroke();
    }
  }
};
