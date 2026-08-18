// 무지개 컨트레일 — 이 게임의 무기.
// 궤적 폴리라인이 자기 자신과 교차하면 "고리"가 닫힌 것: 고리 폴리곤을
// 반환하고 해당 구간을 소비한다. 고리 안의 먹구름은 game.js가 팡 터뜨린다.

import { ctx } from '../engine/view.js';
import { RAINBOW } from './const.js';

const LIFE = 2.3;      // 궤적 수명 (초) — 최소 선회 원(반지름≈65px) 한 바퀴가 담기는 길이
const MIN_SEG = 5;     // 포인트 간 최소 간격 (px)
const BAND_W = 2.6;

/** @type {number[][]} [x, y, t] */
let pts = [];
/** 닫힌 고리 플래시 연출 @type {{poly: number[][], t0: number, hit: number}[]} */
let flashes = [];

export const resetTrail = () => { pts = []; flashes = []; };

/** @param {number} x @param {number} y @param {number} t */
export const pushTrail = (x, y, t) => {
  const last = pts[pts.length - 1];
  if (last && Math.hypot(x - last[0], y - last[1]) < MIN_SEG) return;
  pts.push([x, y, t]);
};

/** @param {number} t */
export const updateTrail = t => {
  while (pts.length && pts[0][2] < t - LIFE) pts.shift();
  flashes = flashes.filter(f => t - f.t0 < 0.45);
};

/** 선분 교차점 (없으면 null) — 표준 파라메트릭 판정
 * @param {number[]} a @param {number[]} b @param {number[]} c @param {number[]} d */
const segX = (a, b, c, d) => {
  const rx = b[0] - a[0], ry = b[1] - a[1];
  const sx = d[0] - c[0], sy = d[1] - c[1];
  const den = rx * sy - ry * sx;
  if (!den) return null;
  const u = ((c[0] - a[0]) * sy - (c[1] - a[1]) * sx) / den;
  const v = ((c[0] - a[0]) * ry - (c[1] - a[1]) * rx) / den;
  if (u < 0 || u > 1 || v < 0 || v > 1) return null;
  return [a[0] + rx * u, a[1] + ry * u];
};

/** 점-폴리곤 포함 (ray casting) @param {number} x @param {number} y @param {number[][]} poly */
export const inPoly = (x, y, poly) => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};

/**
 * 마지막 세그먼트가 이전 궤적과 교차하면 고리 폴리곤을 반환하고 그 구간을 소비.
 * @returns {number[][] | null}
 */
export const tryCloseLoop = () => {
  const n = pts.length;
  if (n < 8) return null;
  const a = pts[n - 2], b = pts[n - 1];
  for (let j = 0; j < n - 4; j++) {
    const X = segX(a, b, pts[j], pts[j + 1]);
    if (X) {
      const poly = [X, ...pts.slice(j + 1, n - 1).map(p => [p[0], p[1]])];
      // 고리 구간 소비 — 교차점부터 다시 시작
      pts = [...pts.slice(0, j + 1), [X[0], X[1], b[2]]];
      return poly;
    }
  }
  return null;
};

/** 고리 플래시 등록 @param {number[][]} poly @param {number} t @param {number} hit 잡은 수 */
export const addFlash = (poly, t, hit) => flashes.push({ poly, t0: t, hit });

/** @param {number} t */
export const drawTrail = t => {
  if (pts.length > 1) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // 글로우
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'hsl(310 85% 80% / .12)';
    ctx.lineWidth = BAND_W * 14;
    strokeBand(0, t, 1);
    ctx.globalCompositeOperation = 'source-over';
    for (let b = 0; b < 7; b++) {
      ctx.strokeStyle = RAINBOW[b];
      ctx.lineWidth = BAND_W + 0.4;
      strokeBand((b - 3) * BAND_W, t, 1);
    }
  }
  // 닫힌 고리 플래시 — 무지개 필 + 확장 스트로크
  for (const f of flashes) {
    const p = (t - f.t0) / 0.45;
    const a = (1 - p) * (f.hit ? 0.5 : 0.22);
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `hsl(${(f.t0 * 90) % 360} 90% 75% / ${a})`;
    ctx.beginPath();
    f.poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = `hsl(50 100% 80% / ${(1 - p) * 0.8})`;
    ctx.lineWidth = 2 + p * 10;
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }
};

/**
 * 궤적을 법선 오프셋 밴드로 스트로크 — 나이 든 꼬리일수록 투명
 * @param {number} off @param {number} t @param {number} alphaMul
 */
const strokeBand = (off, t, alphaMul) => {
  const n = pts.length;
  // 알파를 구간별로 바꾸기 위해 6조각으로 나눠 그린다
  const CH = 6;
  for (let c = 0; c < CH; c++) {
    const i0 = Math.floor((n - 1) * c / CH);
    const i1 = Math.floor((n - 1) * (c + 1) / CH);
    if (i1 - i0 < 1) continue;
    const age = (t - pts[i0][2]) / LIFE;
    ctx.globalAlpha = Math.max(0, 1 - age) * 0.9 * alphaMul;
    ctx.beginPath();
    for (let i = i0; i <= i1; i++) {
      const [x, y] = pts[i];
      const [px, py] = pts[Math.max(0, i - 1)];
      const [nx2, ny2] = pts[Math.min(n - 1, i + 1)];
      const dx = nx2 - px, dy = ny2 - py;
      const dl = Math.hypot(dx, dy) || 1;
      const ox = (-dy / dl) * off, oy = (dx / dl) * off;
      i === i0 ? ctx.moveTo(x + ox, y + oy) : ctx.lineTo(x + ox, y + oy);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
};
