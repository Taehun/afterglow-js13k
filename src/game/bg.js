// 배경 씬 — 파스텔 새벽 하늘, 태양, 구름, 언덕 실루엣, 플랫폼, 비프뢰스트 게이트.
// 전부 프로시저럴 벡터 (에셋 = 코드). 오버드로우로 레터박스를 감춘다.

import { ctx } from '../engine/view.js';
import {
  VW, VH, SKY_TOP, SKY_MID, SKY_BOT, HILL_FAR, HILL_NEAR,
  PLAT_BODY, PLAT_EDGE, GRASS, RAINBOW,
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

/** 플랫폼 — 보라 바위 + 잔디 상판 + 꽃 @param {import('./levels.js').Level} lv */
export const drawPlats = lv => {
  const oy = overdrawY();
  for (const [x0, x1, y] of lv.plats) {
    const deep = VH - y + oy + 40;
    const g = ctx.createLinearGradient(0, y, 0, y + Math.max(260, deep));
    g.addColorStop(0, PLAT_BODY);
    g.addColorStop(0.5, PLAT_EDGE);
    g.addColorStop(1, '#3a2c63');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(x0, y, x1 - x0, deep, [14, 14, 0, 0]);
    ctx.fill();
    // 절벽 지층 대시 + 가장자리 림 + (깊은 곳엔) 크리스탈 — 결정적 유사난수 배치
    for (let yy = y + 60; yy < VH + oy; yy += 42) {
      for (let xx = x0 + 20; xx < x1 - 20; xx += 90) {
        const r = Math.abs(Math.sin(xx * 12.9898 + yy * 3.7));
        if (r < 0.55) {
          ctx.strokeStyle = 'rgba(30,20,55,.28)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(xx + r * 30, yy);
          ctx.lineTo(xx + r * 30 + 24 + r * 40, yy);
          ctx.stroke();
        } else if (yy > VH && r > 0.8) {
          // 지하 크리스탈 (세로형 화면에서 보이는 보너스 디테일)
          const hue = (xx * 7) % 360;
          ctx.fillStyle = `hsl(${hue} 70% 70% / ${0.35 + 0.25 * Math.sin(xx)})`;
          ctx.beginPath();
          ctx.moveTo(xx, yy);
          ctx.lineTo(xx + 6, yy + 14);
          ctx.lineTo(xx - 6, yy + 14);
          ctx.closePath();
          ctx.fill();
        }
      }
    }
    ctx.strokeStyle = 'rgba(255,255,255,.12)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x0 + 1, y + 14);
    ctx.lineTo(x0 + 1, VH + oy);
    ctx.moveTo(x1 - 1, y + 14);
    ctx.lineTo(x1 - 1, VH + oy);
    ctx.stroke();
    // 잔디 상판
    ctx.fillStyle = GRASS;
    ctx.beginPath();
    ctx.roundRect(x0 + 3, y - 4, x1 - x0 - 6, 12, 6);
    ctx.fill();
    // 잔디 결 + 꽃 (x 기반 결정적 배치 — 매 프레임 동일)
    for (let x = x0 + 14; x < x1 - 10; x += 26) {
      const r = Math.abs(Math.sin(x * 12.9898)) // 유사 난수
      ;
      if (r < 0.35) {
        ctx.fillStyle = ['#ff9fb6', '#ffd76e', '#c9a6ff'][(x / 26 | 0) % 3];
        ctx.beginPath();
        ctx.arc(x, y - 6, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x, y - 6, 1, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = '#6cc286';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(x, y - 3);
        ctx.lineTo(x + (r < 0.7 ? 2 : -2), y - 9);
        ctx.stroke();
      }
    }
  }
};

/** 비프뢰스트 게이트 — 목표 지점은 화면에서 가장 밝은 곳이어야 한다
 * @param {number} gx @param {number} gy @param {number} t */
export const drawGate = (gx, gy, t) => {
  const H_BEAM = 175;
  ctx.save();
  // 지면 라디얼 글로우
  const gg = ctx.createRadialGradient(gx, gy, 4, gx, gy, 55);
  gg.addColorStop(0, 'rgba(255,220,250,.35)');
  gg.addColorStop(1, 'rgba(255,220,250,0)');
  ctx.fillStyle = gg;
  ctx.beginPath();
  ctx.arc(gx, gy, 55, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalCompositeOperation = 'lighter';
  // 흰색 코어 글로우
  const cg = ctx.createLinearGradient(0, gy - H_BEAM, 0, gy);
  cg.addColorStop(0, 'rgba(255,255,255,0)');
  cg.addColorStop(1, 'rgba(255,255,255,.28)');
  ctx.fillStyle = cg;
  ctx.fillRect(gx - 20, gy - H_BEAM, 40, H_BEAM);
  for (let b = 0; b < 7; b++) {
    const off = (b - 3) * 5.4;
    const a = 0.42 + 0.2 * Math.sin(t * 2.2 + b);
    const g = ctx.createLinearGradient(0, gy - H_BEAM, 0, gy);
    g.addColorStop(0, RAINBOW[b].replace(')', ' / 0)'));
    g.addColorStop(0.65, RAINBOW[b].replace(')', ` / ${a})`));
    g.addColorStop(1, RAINBOW[b].replace(')', ` / ${Math.min(1, a + 0.2)})`));
    ctx.fillStyle = g;
    ctx.fillRect(gx + off - 2.6, gy - H_BEAM, 5.2, H_BEAM);
  }
  ctx.globalCompositeOperation = 'source-over';

  // 맥동 포커스 링 — "여기가 골"
  ctx.strokeStyle = 'hsl(300 90% 80% / .5)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(gx, gy + 4, 30 + Math.sin(t * 2) * 5, 8 + Math.sin(t * 2) * 1.5, 0, 0, Math.PI * 2);
  ctx.stroke();

  // 받침 구름
  cloud(gx, gy + 2, 0.55, 0.95);

  // 빔 꼭대기의 회전 별
  const sr = 9, sx2 = gx, sy2 = gy - H_BEAM + 4;
  ctx.save();
  ctx.translate(sx2, sy2);
  ctx.rotate(t * 1.2);
  ctx.fillStyle = `hsl(${(t * 50) % 360} 95% 80%)`;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5;
    const rr = i % 2 ? sr * 0.45 : sr;
    i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 궤도 반짝이
  for (let i = 0; i < 3; i++) {
    const a = t * 1.4 + (i * Math.PI * 2) / 3;
    const px = gx + Math.cos(a) * 26;
    const py = gy - 60 + Math.sin(a) * 55;
    ctx.fillStyle = `hsl(${(t * 60 + i * 120) % 360} 95% 78% / .9)`;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(a);
    ctx.fillRect(-2.2, -2.2, 4.4, 4.4);
    ctx.restore();
  }
  ctx.restore();
};
