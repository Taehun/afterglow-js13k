// 드랍과 성장 — 무지개 조각(XP), 하트, 흡입, 레벨 곡선.

import { ctx } from '../engine/view.js';
import { P } from './player.js';
import { stats } from './stats.js';

/** @typedef {{x:number, y:number, hue:number, vx:number, vy:number, heart:boolean}} Shard */
/** @type {Shard[]} */
export let shards = [];

export const xp = { cur: 0, need: 5, level: 1 };

export const resetLoot = () => {
  shards = [];
  xp.cur = 0;
  xp.need = 5;
  xp.level = 1;
};

/** @param {number} x @param {number} y @param {number} n @param {boolean} [heart] */
export const drop = (x, y, n, heart = false) => {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    shards.push({
      x: x + Math.cos(a) * 10, y: y + Math.sin(a) * 10,
      hue: Math.random() * 360,
      vx: Math.cos(a) * 60, vy: Math.sin(a) * 60,
      heart,
    });
  }
  if (shards.length > 220) shards.splice(0, shards.length - 220);
};

/**
 * @param {number} dt
 * @returns {{leveled: boolean, healed: boolean, picked: number}}
 */
export const updateLoot = dt => {
  let leveled = false, healed = false, picked = 0;
  const keep = [];
  for (const s of shards) {
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.vx *= 1 - Math.min(1, dt * 4);
    s.vy *= 1 - Math.min(1, dt * 4);
    const d = Math.hypot(P.x - s.x, P.y - s.y - 14);
    if (d < stats.magnet) { // 흡입
      const pull = (1 - d / stats.magnet) * 620;
      s.vx += ((P.x - s.x) / (d || 1)) * pull * dt * 4;
      s.vy += ((P.y - 14 - s.y) / (d || 1)) * pull * dt * 4;
    }
    if (d < 20) { // 획득
      picked++;
      if (s.heart) {
        if (P.hp < stats.maxHp) { P.hp++; healed = true; }
      } else {
        xp.cur++;
        if (xp.cur >= xp.need) {
          xp.cur = 0;
          xp.level++;
          xp.need = 4 + xp.level * 3;
          leveled = true;
        }
      }
      continue;
    }
    keep.push(s);
  }
  shards = keep;
  return { leveled, healed, picked };
};

/** @param {number} t */
export const drawLoot = t => {
  for (const s of shards) {
    ctx.save();
    ctx.translate(s.x, s.y + Math.sin(t * 3 + s.x) * 2);
    if (s.heart) {
      ctx.fillStyle = '#ff6b81';
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.bezierCurveTo(-9, -1, -4, -8, 0, -3);
      ctx.bezierCurveTo(4, -8, 9, -1, 0, 6);
      ctx.fill();
    } else {
      ctx.rotate(t * 2 + s.x);
      ctx.fillStyle = `hsl(${s.hue} 90% 68%)`;
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(4.5, 0);
      ctx.lineTo(0, 6);
      ctx.lineTo(-4.5, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      ctx.fillRect(-1.2, -2.6, 2.4, 2.4);
    }
    ctx.restore();
  }
};
