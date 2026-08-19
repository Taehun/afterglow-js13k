// 파티클 시스템 — 반짝이/포프/빗방울 플링크 등 "juice"의 원천.
// 월드 좌표에서 동작한다.

import { ctx } from '../engine/view.js';

/**
 * @typedef {Object} Part
 * @property {number} x @property {number} y
 * @property {number} _vx @property {number} _vy
 * @property {number} _l  남은 수명 (1→0)
 * @property {number} _d 수명 감소 속도
 * @property {number} _h
 * @property {number} _z
 * @property {number} _g
 * @property {boolean} _a  가산 블렌딩 여부
 * @property {number} _n  0=사각 반짝이 1=원 2=링
 */

/** @type {Part[]} */
let parts = [];

/** @param {Partial<Part> & {x:number, y:number}} p */
const push = p => {
  if (parts.length > 600) parts.shift(); // 안전 상한
  parts.push({
    _vx: 0, _vy: 0, _l: 1, _d: 1.6, _h: 50, _z: 3, _g: 0,
    _a: true, _n: 0, ...p,
  });
};

/** 무지개 반짝이 분출 @param {number} x @param {number} y @param {number} n @param {number} [spread] */
export const sparkle = (x, y, n, spread = 140) => {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = spread * (0.3 + Math.random() * 0.7);
    push({
      x, y, _vx: Math.cos(a) * v, _vy: Math.sin(a) * v - 40,
      _h: Math.random() * 360, _z: 2 + Math.random() * 3,
      _g: 160, _d: 1.1 + Math.random(),
    });
  }
};

/** 색 지정 반짝이 (아치 드로잉 헤드용) @param {number} x @param {number} y @param {number} hue */
export const glint = (x, y, hue) => {
  push({
    x, y, _vx: (Math.random() - 0.5) * 60, _vy: -30 - Math.random() * 50,
    _h: hue, _z: 2 + Math.random() * 2.5, _g: 90, _d: 1.8,
  });
};

/** 구름 포프 (스폰/리스폰) @param {number} x @param {number} y */
export const poof = (x, y) => {
  for (let i = 0; i < 10; i++) {
    push({
      x: x + (Math.random() - 0.5) * 20, y: y + (Math.random() - 0.5) * 14,
      _vx: (Math.random() - 0.5) * 50, _vy: -20 - Math.random() * 30,
      _h: 0, _z: 5 + Math.random() * 6, _g: -30, _d: 1.5,
      _a: false, _n: 1,
    });
  }
};

/** 빗방울이 무지개에 막힐 때 @param {number} x @param {number} y @param {number} hue */
export const plink = (x, y, hue) => {
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI * (0.15 + Math.random() * 0.7);
    const v = 60 + Math.random() * 80;
    push({ x, y, _vx: Math.cos(a) * v, _vy: Math.sin(a) * v, _h: hue, _z: 2, _g: 300, _d: 2 });
  }
};

/** 구조 완료 링 @param {number} x @param {number} y */
export const ring = (x, y) => push({ x, y, _h: 50, _z: 8, _d: 1.4, _n: 2, _a: true });

/** 아치가 곡선 형태 그대로 7색 파편으로 부서지는 연출 @param {number[][]} pts */
export const burstArc = pts => {
  pts.forEach(([x, y], i) => push({
    x, y, _h: (i * 40) % 360,
    _vx: (Math.random() - 0.5) * 90, _vy: -50 - Math.random() * 70,
    _g: 240, _z: 3.2, _d: 1.3 + Math.random() * 0.5,
  }));
};

/** @param {number} dt */
export const updateFx = dt => {
  for (const p of parts) {
    p.x += p._vx * dt;
    p.y += p._vy * dt;
    p._vy += p._g * dt;
    p._l -= p._d * dt;
  }
  parts = parts.filter(p => p._l > 0);
};

export const drawFx = () => {
  for (const p of parts) {
    const a = Math.max(0, Math.min(1, p._l));
    if (p._a) ctx.globalCompositeOperation = 'lighter';
    if (p._n === 2) { // 팽창하는 링
      ctx.strokeStyle = `hsl(${p._h} 90% 75% / ${a})`;
      ctx.lineWidth = 3 * a;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p._z + (1 - p._l) * 60, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p._n === 1) { // 부드러운 원 (구름)
      ctx.fillStyle = `hsl(0 0% 100% / ${a * 0.8})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p._z * (1.6 - p._l * 0.6), 0, Math.PI * 2);
      ctx.fill();
    } else { // 반짝이 사각형 (회전)
      ctx.fillStyle = `hsl(${p._h} 95% 70% / ${a})`;
      const s = p._z * (0.5 + a);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p._l * 5);
      ctx.fillRect(-s / 2, -s / 2, s, s);
      ctx.restore();
    }
    ctx.globalCompositeOperation = 'source-over';
  }
};

export const clearFx = () => { parts = []; };

/** 5각 별 경로 — fill/stroke는 호출자가 (원점 중심) @param {number} r */
export const starPath = r => {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.43 : r;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
};
