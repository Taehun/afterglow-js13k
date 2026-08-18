// 플레이어 유니콘 — 8방향 활주 이동 + 무지개 잔광(트레일) 방출.
// 잔광이 곧 주무기: 달려야 화력이 나온다. 월드 좌표.

import { ctx } from '../engine/view.js';
import { RAINBOW, clampIsle } from './const.js';
import { stats } from './stats.js';
import { drawUnicorn } from './unicorn.js';

export const P = {
  x: 0, y: 0,
  vx: 0, vy: 0,
  hp: 3,
  inv: 0,       // 피격 무적
  facing: 1,
  gallop: 0,    // 달리기 위상
  moving: false,
};

const BASE_SPEED = 165;

/** 무지개 질주 — 남은 시간 동안 2배속 + 무적 + 접촉 공격 */
export const boost = { t: 0 };

/** @type {number[][]} 잔광 포인트 [x, y, t] */
export let trail = [];

export const resetPlayer = () => {
  P.x = 0;
  P.y = 0;
  P.vx = 0;
  P.vy = 0;
  P.hp = stats.maxHp;
  P.inv = 0;
  P.facing = 1;
  P.gallop = 0;
  trail = [];
};

/**
 * @param {number} dx -1..1 @param {number} dy -1..1 @param {number} dt @param {number} t
 */
export const updatePlayer = (dx, dy, dt, t) => {
  const len = Math.hypot(dx, dy);
  if (len > 0.01) { dx /= len; dy /= len; }
  if (boost.t > 0) boost.t -= dt;
  const sp = BASE_SPEED * stats.speed * (boost.t > 0 ? 2 : 1);
  // 살짝 미끄러지는 가감속 — 활주 손맛
  P.vx += (dx * sp - P.vx) * Math.min(1, dt * 12);
  P.vy += (dy * sp - P.vy) * Math.min(1, dt * 12);
  P.x += P.vx * dt;
  P.y += P.vy * dt;
  // 섬 가장자리 — 하늘로 떨어질 수는 없다
  [P.x, P.y] = clampIsle(P.x, P.y, 28);
  const spd = Math.hypot(P.vx, P.vy);
  P.moving = spd > 30;
  if (Math.abs(P.vx) > 20) P.facing = Math.sign(P.vx);
  if (P.moving) P.gallop += dt * (9 + spd * 0.02);
  if (P.inv > 0) P.inv -= dt;

  // 잔광 방출 — 이동 중에만
  const last = trail[trail.length - 1];
  if (P.moving && (!last || Math.hypot(P.x - last[0], P.y - last[1]) >= 13)) {
    trail.push([P.x, P.y + 2, t]);
  }
  while (trail.length && trail[0][2] < t - stats.trailLife) trail.shift();
  if (trail.length > 90) trail.shift();
};

/**
 * 점이 잔광 위에 있는가 (판정 반경 포함) @param {number} x @param {number} y
 */
export const onTrail = (x, y) => {
  const r = 12 + stats.trailW * 5;
  for (let i = 0; i < trail.length - 1; i++) {
    const [ax, ay] = trail[i];
    if (Math.abs(x - ax) < r && Math.abs(y - ay) < r) return true;
  }
  return false;
};

/** 잔광 렌더 — 7색 밴드, 꼬리로 갈수록 투명 @param {number} t */
export const drawTrail = t => {
  const n = trail.length;
  if (n < 2) return;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const bw = 3 * stats.trailW;
  // 글로우
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = 'hsl(310 85% 80% / .14)';
  ctx.lineWidth = bw * 12;
  band(0, t, 1);
  ctx.globalCompositeOperation = 'source-over';
  for (let b = 0; b < 7; b++) {
    ctx.strokeStyle = RAINBOW[b];
    ctx.lineWidth = bw + 0.5;
    band((b - 3) * bw, t, 0.92);
  }
};

/** @param {number} off @param {number} t @param {number} am */
const band = (off, t, am) => {
  const n = trail.length;
  const CH = 5;
  for (let c = 0; c < CH; c++) {
    const i0 = Math.floor(((n - 1) * c) / CH);
    const i1 = Math.floor(((n - 1) * (c + 1)) / CH);
    if (i1 - i0 < 1) continue;
    const age = (t - trail[i0][2]) / stats.trailLife;
    ctx.globalAlpha = Math.max(0, 1 - age) * am;
    ctx.beginPath();
    for (let i = i0; i <= i1; i++) {
      const [x, y] = trail[i];
      const [px2, py2] = trail[Math.max(0, i - 1)];
      const [nx2, ny2] = trail[Math.min(n - 1, i + 1)];
      const ddx = nx2 - px2, ddy = ny2 - py2;
      const dl = Math.hypot(ddx, ddy) || 1;
      i === i0
        ? ctx.moveTo(x + (-ddy / dl) * off, y + (ddx / dl) * off)
        : ctx.lineTo(x + (-ddy / dl) * off, y + (ddx / dl) * off);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
};

/** @param {number} t */
export const drawPlayer = t => {
  if (P.inv > 0 && boost.t <= 0 && ((t * 16) | 0) % 2) return; // 피격 점멸
  ctx.save();
  ctx.translate(P.x, P.y);
  // 무지개 질주 — 몸 전체가 빛난다
  if (boost.t > 0) {
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(0, -20, 6, 0, -20, 46);
    g.addColorStop(0, `hsl(${(t * 300) % 360} 90% 75% / .4)`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, -20, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.scale(P.facing * 0.9, 0.9);
  drawUnicorn(t, { walk: P.moving ? P.gallop : 0 });
  ctx.restore();
};
