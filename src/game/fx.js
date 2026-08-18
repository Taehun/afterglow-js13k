// 파티클 시스템 — 반짝이/포프/빗방울 플링크 등 "juice"의 원천.
// 월드 좌표에서 동작한다.

import { ctx } from '../engine/view.js';

/**
 * @typedef {Object} Part
 * @property {number} x @property {number} y
 * @property {number} vx @property {number} vy
 * @property {number} life  남은 수명 (1→0)
 * @property {number} decay 수명 감소 속도
 * @property {number} hue
 * @property {number} size
 * @property {number} grav
 * @property {boolean} add  가산 블렌딩 여부
 * @property {number} kind  0=사각 반짝이 1=원 2=링
 */

/** @type {Part[]} */
let parts = [];

/** @param {Partial<Part> & {x:number, y:number}} p */
const push = p => {
  if (parts.length > 600) parts.shift(); // 안전 상한
  parts.push({
    vx: 0, vy: 0, life: 1, decay: 1.6, hue: 50, size: 3, grav: 0,
    add: true, kind: 0, ...p,
  });
};

/** 무지개 반짝이 분출 @param {number} x @param {number} y @param {number} n @param {number} [spread] */
export const sparkle = (x, y, n, spread = 140) => {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = spread * (0.3 + Math.random() * 0.7);
    push({
      x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40,
      hue: Math.random() * 360, size: 2 + Math.random() * 3,
      grav: 160, decay: 1.1 + Math.random(),
    });
  }
};

/** 색 지정 반짝이 (아치 드로잉 헤드용) @param {number} x @param {number} y @param {number} hue */
export const glint = (x, y, hue) => {
  push({
    x, y, vx: (Math.random() - 0.5) * 60, vy: -30 - Math.random() * 50,
    hue, size: 2 + Math.random() * 2.5, grav: 90, decay: 1.8,
  });
};

/** 구름 포프 (스폰/리스폰) @param {number} x @param {number} y */
export const poof = (x, y) => {
  for (let i = 0; i < 10; i++) {
    push({
      x: x + (Math.random() - 0.5) * 20, y: y + (Math.random() - 0.5) * 14,
      vx: (Math.random() - 0.5) * 50, vy: -20 - Math.random() * 30,
      hue: 0, size: 5 + Math.random() * 6, grav: -30, decay: 1.5,
      add: false, kind: 1,
    });
  }
};

/** 빗방울이 무지개에 막힐 때 @param {number} x @param {number} y @param {number} hue */
export const plink = (x, y, hue) => {
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI * (0.15 + Math.random() * 0.7);
    const v = 60 + Math.random() * 80;
    push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, hue, size: 2, grav: 300, decay: 2 });
  }
};

/** 구조 완료 링 @param {number} x @param {number} y */
export const ring = (x, y) => push({ x, y, hue: 50, size: 8, decay: 1.4, kind: 2, add: true });

/** 아치가 곡선 형태 그대로 7색 파편으로 부서지는 연출 @param {number[][]} pts */
export const burstArc = pts => {
  pts.forEach(([x, y], i) => push({
    x, y, hue: (i * 40) % 360,
    vx: (Math.random() - 0.5) * 90, vy: -50 - Math.random() * 70,
    grav: 240, size: 3.2, decay: 1.3 + Math.random() * 0.5,
  }));
};

/** @param {number} dt */
export const updateFx = dt => {
  for (const p of parts) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += p.grav * dt;
    p.life -= p.decay * dt;
  }
  parts = parts.filter(p => p.life > 0);
};

export const drawFx = () => {
  for (const p of parts) {
    const a = Math.max(0, Math.min(1, p.life));
    if (p.add) ctx.globalCompositeOperation = 'lighter';
    if (p.kind === 2) { // 팽창하는 링
      ctx.strokeStyle = `hsl(${p.hue} 90% 75% / ${a})`;
      ctx.lineWidth = 3 * a;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size + (1 - p.life) * 60, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.kind === 1) { // 부드러운 원 (구름)
      ctx.fillStyle = `hsl(0 0% 100% / ${a * 0.8})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1.6 - p.life * 0.6), 0, Math.PI * 2);
      ctx.fill();
    } else { // 반짝이 사각형 (회전)
      ctx.fillStyle = `hsl(${p.hue} 95% 70% / ${a})`;
      const s = p.size * (0.5 + a);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.life * 5);
      ctx.fillRect(-s / 2, -s / 2, s, s);
      ctx.restore();
    }
    ctx.globalCompositeOperation = 'source-over';
  }
};

export const clearFx = () => { parts = []; };
