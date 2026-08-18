// 먹구름 무리 — 유니콘을 향해 몰려온다. 시간에 따라 스폰이 가속.
// 피격 플래시·넉백·팝 사망까지 타격감의 절반이 여기 산다.

import { ctx } from '../engine/view.js';
import { P } from './player.js';
import { sparkle, poof } from './fx.js';

/**
 * @typedef {Object} Mob
 * @property {number} x @property {number} y
 * @property {number} hp @property {number} maxHp
 * @property {number} r @property {number} sp
 * @property {number} flash 피격 플래시 잔여
 * @property {number} kx @property {number} ky 넉백 속도
 * @property {number} seed
 * @property {number} tick 잔광 데미지 틱 쿨다운
 * @property {boolean} big
 */

/** @type {Mob[]} */
export let mobs = [];
let spawnAcc = 0;
let spawned = 0;

export const resetMobs = () => { mobs = []; spawnAcc = 0; spawned = 0; };

/**
 * @param {number} dt @param {number} elapsed
 */
export const spawnMobs = (dt, elapsed) => {
  // 스폰 간격: 1.1초 → 15분 어치까지 선형 가속 (스파이크는 0.22초 바닥)
  const interval = Math.max(0.22, 1.1 - elapsed * 0.009);
  spawnAcc += dt;
  while (spawnAcc > interval && mobs.length < 130) {
    spawnAcc -= interval;
    spawned++;
    const big = spawned % 9 === 0;
    const a = Math.random() * Math.PI * 2;
    const d = 560 + Math.random() * 80;
    const hpMul = 1 + elapsed * 0.02; // 시간이 갈수록 단단해짐
    mobs.push({
      x: P.x + Math.cos(a) * d,
      y: P.y + Math.sin(a) * d,
      hp: (big ? 26 : 6) * hpMul,
      maxHp: (big ? 26 : 6) * hpMul,
      r: big ? 30 : 16,
      sp: big ? 34 : 52 + Math.random() * 18,
      flash: 0, kx: 0, ky: 0,
      seed: Math.random() * 9,
      tick: 0,
      big,
    });
  }
};

/** @param {number} dt */
export const updateMobs = dt => {
  for (const m of mobs) {
    const d = Math.hypot(P.x - m.x, P.y - m.y) || 1;
    m.x += ((P.x - m.x) / d) * m.sp * dt + m.kx * dt;
    m.y += ((P.y - m.y) / d) * m.sp * dt + m.ky * dt;
    m.kx *= 1 - Math.min(1, dt * 8);
    m.ky *= 1 - Math.min(1, dt * 8);
    if (m.flash > 0) m.flash -= dt;
    if (m.tick > 0) m.tick -= dt;
  }
};

/**
 * 데미지 적용. 죽으면 true.
 * @param {Mob} m @param {number} dmg @param {number} kx @param {number} ky 넉백 방향
 */
export const hurt = (m, dmg, kx, ky) => {
  m.hp -= dmg;
  m.flash = 0.09;
  m.kx += kx;
  m.ky += ky;
  if (m.hp <= 0) {
    mobs = mobs.filter(v => v !== m);
    sparkle(m.x, m.y, m.big ? 16 : 8, m.big ? 180 : 120);
    poof(m.x, m.y);
    return true;
  }
  return false;
};

/** @param {number} t */
export const drawMobs = t => {
  for (const m of mobs) {
    const s = m.r / 30;
    ctx.save();
    ctx.translate(m.x, m.y + Math.sin(t * 2 + m.seed * 7) * 2);
    ctx.scale(s, s);
    // 그림자
    ctx.fillStyle = 'rgba(70,45,110,.15)';
    ctx.beginPath();
    ctx.ellipse(0, 26, 22, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    const white = m.flash > 0;
    ctx.fillStyle = white ? '#fff' : '#575077';
    ctx.beginPath();
    ctx.ellipse(0, 10, 24, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = white ? '#fff' : '#6b6191';
    for (const [ox, oy, r] of [[-18, 2, 15], [0, -7, 20], [17, 2, 15], [2, 7, 17]]) {
      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!white) {
      // 성난 얼굴
      ctx.fillStyle = '#fff';
      for (const ex of [-8, 8]) {
        ctx.beginPath();
        ctx.arc(ex, -2, 4.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#2c2344';
      const d = Math.hypot(P.x - m.x, P.y - m.y) || 1;
      const lx = ((P.x - m.x) / d) * 1.6, ly = ((P.y - m.y) / d) * 1.6;
      for (const ex of [-8, 8]) {
        ctx.beginPath();
        ctx.arc(ex + lx, -2 + ly, 2.1, 0, Math.PI * 2); // 눈이 유니콘을 쫓는다
        ctx.fill();
      }
      ctx.strokeStyle = '#2c2344';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-12, -9.5);
      ctx.lineTo(-4.5, -6.5);
      ctx.moveTo(12, -9.5);
      ctx.lineTo(4.5, -6.5);
      ctx.stroke();
      // 큰 놈은 HP 링
      if (m.big && m.hp < m.maxHp) {
        ctx.strokeStyle = 'rgba(255,255,255,.7)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 30, -Math.PI / 2, -Math.PI / 2 + (m.hp / m.maxHp) * Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
};
