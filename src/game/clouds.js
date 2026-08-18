// 먹구름 — 표적이자 위험. 고리로 감싸면 팡, 몸에 닿으면 아프다.
// 귀엽게 사악한 얼굴 — "fun" 테마 톤 유지.

import { ctx } from '../engine/view.js';
import { VW, VH } from './const.js';
import { sparkle, poof } from './fx.js';

/**
 * @typedef {Object} Gloom
 * @property {number} x @property {number} y
 * @property {number} vx @property {number} vy
 * @property {number} r
 * @property {number} seed
 * @property {number} born
 */

/** @type {Gloom[]} */
export let clouds = [];
let spawnAcc = 0;

export const resetClouds = () => { clouds = []; spawnAcc = 0; };

/**
 * @param {number} dt @param {number} t @param {number} elapsed 러닝 경과 시간(난이도 램프)
 */
export const updateClouds = (dt, t, elapsed) => {
  // 스폰 — 갈수록 빨라지고, 동시 수 상한
  const interval = Math.max(0.9, 2.4 - elapsed * 0.028);
  spawnAcc += dt;
  if (spawnAcc > interval && clouds.length < 11) {
    spawnAcc = 0;
    const side = Math.random() * 4 | 0;
    const r = 22 + Math.random() * 14;
    const c = {
      x: side === 0 ? -r : side === 1 ? VW + r : Math.random() * VW,
      y: side === 2 ? -r : side === 3 ? VH + r : Math.random() * VH,
      vx: 0, vy: 0, r, seed: Math.random() * 9, born: t,
    };
    // 안쪽 임의 지점으로 느리게 표류
    const tx = 120 + Math.random() * (VW - 240);
    const ty = 100 + Math.random() * (VH - 200);
    const d = Math.hypot(tx - c.x, ty - c.y) || 1;
    const sp = 18 + Math.random() * 14 + elapsed * 0.4;
    c.vx = ((tx - c.x) / d) * sp;
    c.vy = ((ty - c.y) / d) * sp;
    clouds.push(c);
  }
  for (const c of clouds) {
    c.x += (c.vx + Math.sin(t * 0.9 + c.seed) * 8) * dt;
    c.y += (c.vy + Math.cos(t * 0.7 + c.seed) * 6) * dt;
  }
  // 완전히 떠나면 제거
  clouds = clouds.filter(c => c.x > -80 && c.x < VW + 80 && c.y > -80 && c.y < VH + 80);
};

/** 팡! @param {Gloom} c */
export const popCloud = c => {
  clouds = clouds.filter(v => v !== c);
  sparkle(c.x, c.y, 14, 150);
  poof(c.x, c.y);
};

/** @param {number} t */
export const drawClouds = t => {
  for (const c of clouds) {
    const grow = Math.min(1, (t - c.born) * 3); // 등장 팝인
    const s = (c.r / 30) * grow;
    ctx.save();
    ctx.translate(c.x, c.y + Math.sin(t * 1.3 + c.seed) * 3);
    ctx.scale(s, s);
    ctx.fillStyle = '#6b6191';
    for (const [ox, oy, r] of [[-20, 4, 16], [0, -8, 21], [19, 3, 16], [2, 8, 18]]) {
      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#575077';
    ctx.beginPath();
    ctx.ellipse(0, 12, 24, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // 사악하지만 귀여운 얼굴
    ctx.fillStyle = '#fff';
    for (const ex of [-8, 8]) {
      ctx.beginPath();
      ctx.arc(ex, -2, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#2c2344';
    for (const ex of [-8, 8]) {
      ctx.beginPath();
      ctx.arc(ex + 1.5, -2, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#2c2344';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 10, 5, Math.PI * 1.15, Math.PI * 1.85); // 찌푸린 입
    ctx.stroke();
    // 성난 눈썹
    ctx.beginPath();
    ctx.moveTo(-12, -9);
    ctx.lineTo(-5, -6.5);
    ctx.moveTo(12, -9);
    ctx.lineTo(5, -6.5);
    ctx.stroke();
    ctx.restore();
  }
};
