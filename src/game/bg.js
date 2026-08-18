// 배경 씬 — 파스텔 새벽 하늘, 태양, 구름, 언덕 실루엣, 플랫폼, 비프뢰스트 게이트.
// 전부 프로시저럴 벡터 (에셋 = 코드). 오버드로우로 레터박스를 감춘다.

import { ctx } from '../engine/view.js';
import {
  VW, VH, SKY_TOP, SKY_MID, SKY_BOT, HILL_FAR, HILL_NEAR, RAINBOW,
} from './const.js';
import { overdrawX, overdrawY } from './cam.js';

/** @param {number} t */
export const drawSky = t => {
  const ox = overdrawX(), oy = overdrawY();
  const g = ctx.createLinearGradient(0, -oy, 0, VH + oy);
  g.addColorStop(0, SKY_TOP);
  g.addColorStop(0.5, SKY_MID);
  g.addColorStop(1, SKY_BOT);
  ctx.fillStyle = g;
  ctx.fillRect(-ox, -oy, VW + ox * 2, VH + oy * 2);

  // 태양 — 부드러운 글로우
  const sx = 795, sy = 105;
  const pulse = 1 + Math.sin(t * 0.9) * 0.04;
  const sg = ctx.createRadialGradient(sx, sy, 4, sx, sy, 95 * pulse);
  sg.addColorStop(0, 'rgba(255,246,214,.95)');
  sg.addColorStop(0.35, 'rgba(255,238,190,.55)');
  sg.addColorStop(1, 'rgba(255,238,190,0)');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(sx, sy, 95 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff6d9';
  ctx.beginPath();
  ctx.arc(sx, sy, 30, 0, Math.PI * 2);
  ctx.fill();

  // 하늘 위 오버드로우가 클 때(세로형) — 상단에 반짝이는 별
  if (oy > 60) {
    for (let i = 0; i < 22; i++) {
      const r = Math.abs(Math.sin(i * 78.233));
      const x = -ox + (VW + ox * 2) * Math.abs(Math.sin(i * 12.9898));
      const y = -oy + (oy - 30) * r;
      ctx.fillStyle = `rgba(255,255,255,${0.25 + 0.45 * Math.abs(Math.sin(t * 1.5 + i * 2))})`;
      ctx.fillRect(x, y, 2.2, 2.2);
    }
  }

  // 떠다니는 구름 4점
  for (let i = 0; i < 4; i++) {
    const speed = 8 + i * 3;
    const cw = 130 + i * 30;
    const cx = (((t * speed + i * 331) % (VW + ox * 2 + cw)) - ox - cw / 2);
    const cy = 60 + i * 52 + Math.sin(t * 0.5 + i) * 3;
    cloud(cx, cy, 0.7 + i * 0.12, 0.5 - i * 0.07);
  }

  // 구름 섬 2개 — 밑면과 가느다란 무지개 폭포로 상단 빈 공간을 채운다
  for (const [ix, iy, isc] of [[210, 148, 0.9], [724, 208, 0.7]]) {
    const bob = Math.sin(t * 0.3 + ix) * 6;
    ctx.fillStyle = '#cbb8ec';
    ctx.beginPath();
    ctx.ellipse(ix, iy + 14 * isc + bob, 52 * isc, 12 * isc, 0, 0, Math.PI * 2);
    ctx.fill();
    for (let b = 0; b < 3; b++) {
      ctx.fillStyle = RAINBOW[b * 2].replace(')', ' / .22)');
      ctx.fillRect(ix - 8 + b * 7, iy + 18 * isc + bob, 2.5, 46 * isc * (1 + 0.1 * Math.sin(t + b)));
    }
    cloud(ix - 18 * isc, iy + bob, 0.5 * isc, 0.85);
    cloud(ix + 20 * isc, iy + 4 * isc + bob, 0.42 * isc, 0.8);
  }

  // 새 3마리 — V자 2획 실루엣
  for (let i = 0; i < 3; i++) {
    const bx = -ox + ((t * (16 + i * 5) + i * 400) % (VW + ox * 2));
    const by = 120 + i * 46 + Math.sin(t * 1.2 + i * 3) * 8;
    const flap = 4 * Math.abs(Math.sin(t * 4 + i * 2));
    ctx.strokeStyle = 'rgba(120,100,170,.5)';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(bx - 6, by - flap + 3);
    ctx.quadraticCurveTo(bx, by, bx, by);
    ctx.quadraticCurveTo(bx, by, bx + 6, by - flap + 3);
    ctx.stroke();
  }
};

/** @param {number} x @param {number} y @param {number} s @param {number} a */
const cloud = (x, y, s, a) => {
  ctx.fillStyle = `rgba(255,255,255,${a})`;
  for (const [ox2, oy2, r] of [[-34, 4, 20], [0, -6, 27], [30, 3, 21], [8, 8, 24]]) {
    ctx.beginPath();
    ctx.arc(x + ox2 * s, y + oy2 * s, r * s, 0, Math.PI * 2);
    ctx.fill();
  }
};

/** 언덕 실루엣 3겹 (원경일수록 밝게 — 공기원근) */
export const drawHills = () => {
  const ox = overdrawX(), oy = overdrawY();
  hill('#d6c6f2', 360, 38, 0.004, 11);
  hill(HILL_FAR, 400, 60, 0.006, 3);
  hill(HILL_NEAR, 445, 45, 0.009, 7);
  /**
   * @param {string} col @param {number} base @param {number} amp
   * @param {number} fq @param {number} seed
   */
  function hill(col, base, amp, fq, seed) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(-ox, VH + oy);
    for (let x = -ox; x <= VW + ox; x += 16) {
      const y = base - Math.abs(Math.sin(x * fq + seed)) * amp - Math.sin(x * fq * 3.7 + seed) * amp * 0.25;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(VW + ox, VH + oy);
    ctx.closePath();
    ctx.fill();
  }
};
