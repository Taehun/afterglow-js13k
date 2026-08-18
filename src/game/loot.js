// 드랍과 성장 — 무지개 조각(XP), 하트, 흡입, 레벨 곡선.

import { ctx } from '../engine/view.js';
import { clampIsle } from './const.js';
import { P } from './player.js';
import { starPath } from './fx.js';
import { stats } from './stats.js';

/** @typedef {{x:number, y:number, hue:number, vx:number, vy:number, heart:boolean}} Shard */
/** @type {Shard[]} */
export let shards = [];

export const xp = { cur: 0, need: 5, level: 1 };

// 운빨 아이템 — 엘리트 처치 보상. 0=자석 1=폭탄 2=무지개 질주 3=별 소나기 4=하트
export const MAGNET = 0, BOMB = 1, DASH = 2, STARS = 3, HEART = 4;
/** @typedef {{x:number, y:number, kind:number, t0:number}} Item */
/** @type {Item[]} */
export let items = [];
/** 자석 발동 — 남은 시간 동안 필드 전체 흡입 */
export const vacuum = { t: 0 };
const ITEM_LIFE = 13;

/** @param {number} x @param {number} y @param {number} t */
export const dropItem = (x, y, t) => {
  // 가중 추첨: 폭탄·자석이 흔하고 질주·별·하트는 귀하다
  const pool = [MAGNET, MAGNET, BOMB, BOMB, BOMB, DASH, STARS, HEART];
  [x, y] = clampIsle(x, y, 40); // 섬 가장자리 안쪽에만 떨어진다
  items.push({ x, y, kind: pool[(Math.random() * pool.length) | 0], t0: t });
};

export const resetLoot = () => {
  shards = [];
  items = [];
  vacuum.t = 0;
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
      // 초록 들판의 보색 계열만 — 핑크/시안/골드 (배경에 묻히지 않는다)
      hue: [318, 190, 45][(Math.random() * 3) | 0],
      vx: Math.cos(a) * 60, vy: Math.sin(a) * 60,
      heart,
    });
  }
  if (shards.length > 220) shards.splice(0, shards.length - 220);
};

/**
 * @param {number} dt @param {number} t
 * @returns {{leveled: boolean, healed: boolean, picked: number, gotItems: number[]}}
 */
export const updateLoot = (dt, t) => {
  let leveled = false, healed = false, picked = 0;
  /** @type {number[]} */
  const gotItems = [];
  if (vacuum.t > 0) vacuum.t -= dt;
  const magnetR = vacuum.t > 0 ? 1e5 : stats.magnet;
  // 아이템: 만료·획득 처리
  items = items.filter(it => {
    if (t - it.t0 > ITEM_LIFE) return false;
    if (Math.hypot(P.x - it.x, P.y - 14 - it.y) < 27) {
      gotItems.push(it.kind);
      return false;
    }
    return true;
  });
  const keep = [];
  for (const s of shards) {
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    // 조각이 섬 밖으로 굴러떨어지지 않게 — 항상 주울 수 있는 위치에 머문다
    [s.x, s.y] = clampIsle(s.x, s.y, 24);
    s.vx *= 1 - Math.min(1, dt * 4);
    s.vy *= 1 - Math.min(1, dt * 4);
    const d = Math.hypot(P.x - s.x, P.y - s.y - 14);
    if (d < magnetR) { // 흡입 (자석 발동 시 필드 전체)
      const pull = (vacuum.t > 0 ? 1400 : (1 - d / magnetR) * 620);
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
  return { leveled, healed, picked, gotItems };
};

/** 운빨 아이템 렌더 — 빛나는 칩 + 벡터 아이콘, 만료 3초 전 깜빡임 @param {number} t */
export const drawItems = t => {
  for (const it of items) {
    const left = ITEM_LIFE - (t - it.t0);
    if (left < 3 && Math.sin(t * 12) > 0) continue; // 만료 임박 깜빡임
    ctx.save();
    ctx.translate(it.x, it.y + Math.sin(t * 2.4 + it.x) * 3);
    // 글로우 + 칩
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(255,240,200,${0.12 + 0.06 * Math.sin(t * 4)})`;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(25,16,50,.85)';
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = ['#8fd4ff', '#ff8f7a', '#ff9fc9', '#ffd76e', '#ff6b81'][it.kind];
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineCap = 'round';
    if (it.kind === MAGNET) { // U자 자석
      ctx.strokeStyle = '#8fd4ff';
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.arc(0, -1.5, 6, Math.PI, 0, false);
      ctx.moveTo(-6, -1.5);
      ctx.lineTo(-6, 5);
      ctx.moveTo(6, -1.5);
      ctx.lineTo(6, 5);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.fillRect(-7.6, 3.5, 3.2, 3);
      ctx.fillRect(4.4, 3.5, 3.2, 3);
    } else if (it.kind === BOMB) { // 폭탄
      ctx.fillStyle = '#ff8f7a';
      ctx.beginPath();
      ctx.arc(0, 2, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffd76e';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(3, -3);
      ctx.quadraticCurveTo(6, -7, 3.5, -9);
      ctx.stroke();
      ctx.fillStyle = `rgba(255,235,140,${0.5 + 0.5 * Math.sin(t * 10)})`;
      ctx.fillRect(2.2, -10.6, 2.6, 2.6);
      ctx.fillStyle = 'rgba(255,255,255,.7)';
      ctx.beginPath();
      ctx.arc(-2, 0, 1.8, 0, Math.PI * 2);
      ctx.fill();
    } else if (it.kind === DASH) { // 무지개 질주 — 미니 아치 3밴드
      for (let b = 0; b < 3; b++) {
        ctx.strokeStyle = ['#ff6b81', '#ffd76e', '#8fd4ff'][b];
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.arc(0, 5, 8.5 - b * 3, Math.PI * 1.05, Math.PI * 1.95);
        ctx.stroke();
      }
    } else if (it.kind === STARS) { // 별 소나기
      ctx.fillStyle = '#ffd76e';
      starPath(7.5);
      ctx.fill();
    } else { // 하트
      ctx.fillStyle = '#ff6b81';
      ctx.beginPath();
      ctx.moveTo(0, 6.5);
      ctx.bezierCurveTo(-9, 0, -4.5, -7, 0, -2.5);
      ctx.bezierCurveTo(4.5, -7, 9, 0, 0, 6.5);
      ctx.fill();
    }
    ctx.restore();
  }
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
      // 가산 글로우 헤일로 — 어두운 들판 위에서 빛나는 보석
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `hsl(${s.hue} 95% 70% / ${0.22 + 0.1 * Math.sin(t * 5 + s.x)})`;
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      ctx.rotate(t * 2 + s.x);
      ctx.fillStyle = `hsl(${s.hue} 95% 66%)`;
      ctx.strokeStyle = 'rgba(25,20,45,.75)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, -6.5);
      ctx.lineTo(5, 0);
      ctx.lineTo(0, 6.5);
      ctx.lineTo(-5, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.95)';
      ctx.fillRect(-1.4, -2.8, 2.8, 2.8);
    }
    ctx.restore();
  }
};
