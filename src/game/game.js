// 플레이스홀더 데모 — 파이프라인/엔진 검증용.
// 테마 "Unicorns and Rainbows": 무지개 = HSL 회전만으로 팔레트가 공짜로 나온다.
// 실제 게임 확정 시 이 파일부터 교체한다. (엔진 사용 예제를 겸함)

import { ctx, W, H } from '../engine/view.js';
import { ptr, keysJust } from '../engine/input.js';
import { S } from '../engine/sfx.js';
import { save, load } from '../engine/save.js';

let t = 0;
let taps = load('taps', 0);

/** @typedef {{x:number, y:number, vx:number, vy:number, life:number, hue:number}} Spark */
/** @type {Spark[]} */
let sparks = [];

/** 포인터 위치에서 반짝이 분출 @param {number} n */
const burst = n => {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = 60 + Math.random() * 240;
    sparks.push({
      x: ptr.x, y: ptr.y,
      vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120,
      life: 1,
      hue: Math.random() * 360,
    });
  }
};

/** @param {number} dt */
export const update = dt => {
  t += dt;

  if (ptr.justDown || keysJust.has('Space')) {
    taps++;
    save('taps', taps);
    S.chime();
    burst(32);
  }

  for (const s of sparks) {
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.vy += 500 * dt;      // 중력
    s.vx *= 1 - 2 * dt;    // 공기저항
    s.life -= dt * 1.2;
  }
  sparks = sparks.filter(s => s.life > 0);
};

export const draw = () => {
  // 밤하늘 배경
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#1a0a2e');
  bg.addColorStop(1, '#0b1030');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 무지개 아치 — 화면 하단 중심의 동심원 스트로크 7개
  const cx = W / 2, cy = H * 1.05, r0 = Math.min(W, H) * 0.5;
  ctx.lineWidth = r0 * 0.045;
  for (let i = 0; i < 7; i++) {
    ctx.strokeStyle = `hsl(${i * 51 + t * 20} 90% 60% / .85)`;
    ctx.beginPath();
    ctx.arc(cx, cy, r0 * (1 - i * 0.05), Math.PI, 0);
    ctx.stroke();
  }

  // 반짝이 — 가산 블렌딩으로 빛나는 느낌
  ctx.globalCompositeOperation = 'lighter';
  for (const s of sparks) {
    ctx.fillStyle = `hsl(${s.hue} 100% 70% / ${s.life})`;
    const r = 2 + s.life * 3;
    ctx.fillRect(s.x - r, s.y - r, r * 2, r * 2);
  }
  ctx.globalCompositeOperation = 'source-over';

  // HUD — 시스템 폰트만 사용 (커스텀 폰트는 13KB 예산 안에서만 가능)
  ctx.fillStyle = '#fff';
  ctx.font = '16px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`UNICORNS & RAINBOWS — tap / click / Space (${taps})`, W / 2, 32);
};
