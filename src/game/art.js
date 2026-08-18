// SUNSHOWER 씬 아트 — 떠 있는 정원 섬 위의 보드.
// 타일·구름·태양·광선·무지개 다리 렌더링 (전부 벡터, 월드 좌표).

import { ctx } from '../engine/view.js';
import { RAINBOW } from './const.js';
import { board, tile, cloudAt } from './board.js';

export const TS = 56; // 타일 크기

/** 보드 원점 (월드) — game.js가 매 프레임 갱신 */
export const org = { x: 0, y: 0 };

/** 유사난수 @param {number} x @param {number} y */
const rnd = (x, y) => Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;

/** 타일 중심 월드 좌표 @param {number} x @param {number} y */
export const px = (x, y) => ({ x: org.x + x * TS + TS / 2, y: org.y + y * TS + TS / 2 });

/** 섬 받침 + 그림자 */
export const drawIsland = () => {
  const w = board.w * TS, h = board.h * TS;
  ctx.fillStyle = 'rgba(70,45,110,.18)';
  ctx.beginPath();
  ctx.ellipse(org.x + w / 2, org.y + h + 26, w * 0.46, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  // 섬 흙단면
  ctx.fillStyle = '#8a6cc0';
  ctx.beginPath();
  ctx.roundRect(org.x - 8, org.y - 8, w + 16, h + 30, 22);
  ctx.fill();
  ctx.fillStyle = '#7154a8';
  ctx.beginPath();
  ctx.roundRect(org.x - 8, org.y + h - 4, w + 16, 26, [0, 0, 22, 22]);
  ctx.fill();
};

/** 정적 타일 전부 @param {number} t */
export const drawTiles = t => {
  for (let y = 0; y < board.h; y++) {
    for (let x = 0; x < board.w; x++) {
      const c = tile(x, y);
      const wx = org.x + x * TS, wy = org.y + y * TS;
      const wet = board.wet.has(x + ',' + y);
      if (c === '#') { crystal(wx, wy, x, y); continue; }
      // 풀밭 (체커 2톤, 젖으면 뚜렷하게 짙어지고 꽃이 핀다)
      ctx.fillStyle = (x + y) % 2 ? (wet ? '#79c791' : '#a9e8b6') : (wet ? '#6fc088' : '#9de2ad');
      ctx.beginPath();
      ctx.roundRect(wx + 1, wy + 1, TS - 2, TS - 2, 7);
      ctx.fill();
      if (c === 'O') pit(wx, wy, x, y, wet, t);
      else if (wet) {
        // 비가 피운 꽃
        for (let i = 0; i < 2; i++) {
          const r = rnd(x * 3 + i, y * 7);
          const fx2 = wx + 10 + r * (TS - 20), fy2 = wy + 10 + rnd(y + i, x) * (TS - 20);
          ctx.fillStyle = ['#ff9fb6', '#ffd76e', '#c9a6ff'][(x + y + i) % 3];
          for (let p = 0; p < 5; p++) {
            const a = (p * Math.PI * 2) / 5 + r * 6;
            ctx.beginPath();
            ctx.arc(fx2 + Math.cos(a) * 2.6, fy2 + Math.sin(a) * 2.6, 1.7, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(fx2, fy2, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (rnd(x, y) < 0.3) {
        // 마른 풀 결
        ctx.strokeStyle = 'rgba(110,190,130,.6)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        const gx = wx + 12 + rnd(x + 9, y) * 30, gy = wy + 14 + rnd(x, y + 9) * 28;
        ctx.moveTo(gx, gy + 5);
        ctx.lineTo(gx + 2, gy - 2);
        ctx.moveTo(gx + 4, gy + 5);
        ctx.lineTo(gx + 5.5, gy);
        ctx.stroke();
      }
    }
  }
};

/** 크리스탈 벽 @param {number} wx @param {number} wy @param {number} x @param {number} y */
const crystal = (wx, wy, x, y) => {
  ctx.fillStyle = '#cdbdf0';
  ctx.beginPath();
  ctx.roundRect(wx + 1, wy + 1, TS - 2, TS - 2, 7);
  ctx.fill();
  const r = rnd(x, y);
  for (let i = 0; i < 3; i++) {
    const cx2 = wx + 12 + ((r * 7 + i * 13) % 30), cy2 = wy + TS - 8;
    const hgt = 16 + ((r * 31 + i * 17) % 22);
    const wdt = 7 + (i % 2) * 3;
    ctx.fillStyle = i % 2 ? '#b7a0e8' : '#dccdf7';
    ctx.beginPath();
    ctx.moveTo(cx2 - wdt / 2, cy2);
    ctx.lineTo(cx2 - 1, cy2 - hgt);
    ctx.lineTo(cx2 + 1.5, cy2 - hgt + 3);
    ctx.lineTo(cx2 + wdt / 2, cy2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx2 - wdt / 4, cy2 - 2);
    ctx.lineTo(cx2 - 0.5, cy2 - hgt + 3);
    ctx.stroke();
  }
};

/** 틈(구멍) @param {number} wx @param {number} wy @param {number} x @param {number} y @param {boolean} wet @param {number} t */
const pit = (wx, wy, x, y, wet, t) => {
  const g = ctx.createRadialGradient(wx + TS / 2, wy + TS / 2, 4, wx + TS / 2, wy + TS / 2, TS * 0.62);
  g.addColorStop(0, '#241b3e');
  g.addColorStop(1, '#4a3b70');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(wx + 4, wy + 4, TS - 8, TS - 8, 12);
  ctx.fill();
  // 안개
  ctx.fillStyle = 'rgba(180,160,220,.25)';
  for (let i = 0; i < 2; i++) {
    const mx = wx + TS / 2 + Math.sin(t * 0.7 + i * 3 + x) * 10;
    const my = wy + TS / 2 + 6 + Math.cos(t * 0.5 + i * 2 + y) * 4;
    ctx.beginPath();
    ctx.ellipse(mx, my, 9, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (wet) {
    // 젖은 틈 — 가장자리 물방울 글린트
    for (let i = 0; i < 3; i++) {
      const a = t * 1.2 + i * 2.1 + x;
      ctx.fillStyle = `rgba(160,210,255,${0.4 + 0.3 * Math.sin(a * 3)})`;
      ctx.beginPath();
      ctx.arc(wx + TS / 2 + Math.cos(a) * 18, wy + TS / 2 + Math.sin(a) * 14, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};

/** 광선 빔 — 태양에서 뻗는 부드러운 금빛 @param {number} t */
export const drawBeams = t => {
  ctx.globalCompositeOperation = 'lighter';
  for (const b of board.beams) {
    const p0 = px(b.x, b.y);
    const horiz = b.dx !== 0;
    const lenPx = b.len * TS;
    const sx = p0.x - b.dx * TS / 2, sy = p0.y - b.dy * TS / 2;
    const ex = sx + b.dx * lenPx, ey = sy + b.dy * lenPx;
    const g = ctx.createLinearGradient(sx, sy, ex, ey);
    const a = 0.28 + 0.07 * Math.sin(t * 2.2);
    g.addColorStop(0, `rgba(255,220,120,${a + 0.12})`);
    g.addColorStop(1, `rgba(255,225,140,${a * 0.55})`);
    ctx.fillStyle = g;
    const W2 = 17;
    if (horiz) ctx.fillRect(Math.min(sx, ex), sy - W2, lenPx, W2 * 2);
    else ctx.fillRect(sx - W2, Math.min(sy, ey), W2 * 2, lenPx);
    // 떠다니는 먼지 모트
    for (let i = 0; i < b.len * 2; i++) {
      const u = ((t * 0.12 + i * 0.37) % 1);
      const mx = sx + b.dx * lenPx * u + (horiz ? 0 : Math.sin(t * 2 + i) * 6);
      const my = sy + b.dy * lenPx * u + (horiz ? Math.sin(t * 2 + i) * 6 : 0);
      ctx.fillStyle = `rgba(255,246,200,${0.3 + 0.3 * Math.sin(t * 3 + i * 2)})`;
      ctx.fillRect(mx, my, 2, 2);
    }
  }
  ctx.globalCompositeOperation = 'source-over';
};

/** 태양 메달리온 @param {number} t */
export const drawSuns = t => {
  for (const s of board.suns) {
    const p = px(s.x, s.y);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(t * 0.4);
    ctx.fillStyle = '#ffd76e';
    for (let i = 0; i < 8; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 4);
      ctx.beginPath();
      ctx.roundRect(-2.5, -21, 5, 9, 2.5);
      ctx.fill();
      ctx.restore();
    }
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 14);
    g.addColorStop(0, '#fff4cc');
    g.addColorStop(1, '#ffca5f');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // 방긋 얼굴 (회전 없이)
    ctx.strokeStyle = 'rgba(190,120,40,.75)';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(p.x - 4, p.y - 2, 1.6, 0, Math.PI, true);
    ctx.moveTo(p.x + 5.6, p.y - 2);
    ctx.arc(p.x + 4, p.y - 2, 1.6, 0, Math.PI, true);
    ctx.moveTo(p.x + 4, p.y + 3.5);
    ctx.arc(p.x, p.y + 3, 4, 0.25, Math.PI - 0.25);
    ctx.stroke();
  }
};

/** 무지개 다리 타일 @param {number} t */
export const drawRainbows = t => {
  for (const k of board.rainbows) {
    const [x, y] = k.split(',').map(Number);
    const wx = org.x + x * TS, wy = org.y + y * TS;
    ctx.save();
    ctx.translate(wx + TS / 2, wy + TS / 2);
    // 글로우
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(255,220,255,${0.12 + 0.06 * Math.sin(t * 3)})`;
    ctx.beginPath();
    ctx.arc(0, 0, TS * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    // 살짝 아치진 7밴드 다리
    for (let b = 0; b < 7; b++) {
      ctx.strokeStyle = RAINBOW[b];
      ctx.lineWidth = 3.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      const yy = -10 + b * 3.4;
      ctx.moveTo(-TS / 2 + 5, yy + 3);
      ctx.quadraticCurveTo(0, yy - 4, TS / 2 - 5, yy + 3);
      ctx.stroke();
    }
    // 반짝이
    const a = t * 2 + x * 3;
    ctx.fillStyle = `rgba(255,255,255,${0.5 + 0.5 * Math.sin(a * 2)})`;
    ctx.fillRect(Math.cos(a) * 16 - 1.5, Math.sin(a) * 8 - 1.5, 3, 3);
    ctx.restore();
  }
};

/**
 * 구름 — 졸린 얼굴의 협력자. 이동 애니메이션 좌표는 game.js가 넘겨준다.
 * @param {number} wx 월드 중심 x @param {number} wy 월드 중심 y
 * @param {number} t @param {number} seed @param {boolean} overPit 틈 위에 떠 있는가
 */
export const drawCloud = (wx, wy, t, seed, overPit) => {
  ctx.save();
  ctx.translate(wx, wy + Math.sin(t * 1.6 + seed * 7) * (overPit ? 3 : 1.6));
  // 그림자(틈 위에서는 생략)
  if (!overPit) {
    ctx.fillStyle = 'rgba(70,45,110,.16)';
    ctx.beginPath();
    ctx.ellipse(0, 21, 20, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // 밑면 — 비 머금은 라벤더
  ctx.fillStyle = '#cfc2ea';
  ctx.beginPath();
  ctx.ellipse(0, 8, 21, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  // 본체 퍼프
  ctx.fillStyle = '#ffffff';
  for (const [ox, oy, r] of [[-13, 2, 11], [0, -5, 14], [13, 2, 11], [3, 5, 12]]) {
    ctx.beginPath();
    ctx.arc(ox, oy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // 졸린 얼굴
  ctx.strokeStyle = '#8a76b8';
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(-6, 1, 2.6, 0.25, Math.PI - 0.25);
  ctx.moveTo(8.6, 1);
  ctx.arc(6, 1, 2.6, 0.25, Math.PI - 0.25);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,170,190,.5)';
  ctx.beginPath();
  ctx.ellipse(-10, 5, 2.2, 1.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(10, 5, 2.2, 1.4, 0, 0, Math.PI * 2);
  ctx.fill();
  // 보슬비 — 아래로 떨어지는 물방울 2개
  for (let i = 0; i < 2; i++) {
    const u = (t * 0.9 + i * 0.5 + seed) % 1;
    ctx.fillStyle = `rgba(150,200,255,${0.7 * (1 - u)})`;
    ctx.beginPath();
    ctx.ellipse(-8 + i * 16, 12 + u * 16, 1.6, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};
