// 비행 유니콘 — LOOPLIGHT의 플레이어.
// 등속 전진 + 좌/우 선회. 선회 시 뱅킹(기울임), 갈기·꼬리가 뒤로 흐른다.

import { ctx } from '../engine/view.js';
import { VW, VH } from './const.js';

export const TURN = 3.6;   // 선회 각속도 (rad/s)
export const SPEED = 235;  // 전진 속도 (px/s)

export const P = {
  x: VW / 2, y: 200,
  a: 0,        // 진행 각도 (rad)
  bank: 0,     // 뱅킹 시각 효과 (-1..1)
  inv: 0,      // 피격 무적 잔여 시간
};

export const resetPlayer = () => {
  P.x = VW / 2;
  P.y = 200;
  P.a = 0;
  P.bank = 0;
  P.inv = 0;
};

/**
 * @param {number} turn -1/0/1
 * @param {number} dt
 */
export const updatePlayer = (turn, dt) => {
  P.a += turn * TURN * dt;
  P.bank += (turn - P.bank) * Math.min(1, dt * 8);
  P.x += Math.cos(P.a) * SPEED * dt;
  P.y += Math.sin(P.a) * SPEED * dt;
  if (P.inv > 0) P.inv -= dt;

  // 아레나 경계 — 부드럽게 반사
  const M = 26;
  if ((P.x < M && Math.cos(P.a) < 0) || (P.x > VW - M && Math.cos(P.a) > 0)) {
    P.a = Math.PI - P.a;
  }
  if ((P.y < M && Math.sin(P.a) < 0) || (P.y > VH - M && Math.sin(P.a) > 0)) {
    P.a = -P.a;
  }
  P.x = Math.max(M - 4, Math.min(VW - M + 4, P.x));
  P.y = Math.max(M - 4, Math.min(VH - M + 4, P.y));
};

/** 꼬리(컨트레일 시작점) 위치 */
export const tailPos = () => ({
  x: P.x - Math.cos(P.a) * 20,
  y: P.y - Math.sin(P.a) * 20,
});

/** @param {number} t */
export const drawPlayer = t => {
  if (P.inv > 0 && (t * 14 | 0) % 2) return; // 피격 무적 점멸
  ctx.save();
  ctx.translate(P.x, P.y);
  ctx.rotate(P.a);
  ctx.scale(1, 1 - Math.abs(P.bank) * 0.22); // 뱅킹 — 선회 시 납작해지는 롤 느낌
  const gallop = t * 14;

  // 흐르는 갈기+꼬리 — 무지개 3가닥이 뒤로 물결친다
  for (let i = 0; i < 3; i++) {
    const w = Math.sin(t * 9 + i * 1.8) * 4;
    ctx.strokeStyle = `hsl(${(t * 40 + i * 60) % 360} 85% 68%)`;
    ctx.lineWidth = 3 - i * 0.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-10, -4 + i * 3);
    ctx.quadraticCurveTo(-20, -2 + i * 3 + w, -30 - i * 3, 2 + i * 2 + w * 1.6);
    ctx.stroke();
  }
  // 공중 질주 다리 — 4개 갤럽
  ctx.strokeStyle = '#f6ecf4';
  ctx.lineWidth = 3.4;
  for (let i = 0; i < 4; i++) {
    const px = i < 2 ? 7 : -7;
    const ph = gallop + (i % 2) * Math.PI + (i < 2 ? 0.7 : 0);
    ctx.beginPath();
    ctx.moveTo(px, 4);
    ctx.lineTo(px + Math.cos(ph) * 4, 10 + Math.sin(ph) * 3);
    ctx.stroke();
  }
  // 몸통 + 머리 (진행 방향 = +x)
  ctx.fillStyle = '#fffaf5';
  ctx.strokeStyle = 'rgba(74,59,92,.35)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(13, -6, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // 주둥이·귀
  ctx.fillStyle = '#ffe9f0';
  ctx.beginPath();
  ctx.arc(18, -4, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fffaf5';
  ctx.beginPath();
  ctx.moveTo(10, -11);
  ctx.lineTo(12, -16);
  ctx.lineTo(14.5, -11.5);
  ctx.closePath();
  ctx.fill();
  // 뿔 — 전방 지향 (이게 무기다)
  ctx.fillStyle = '#ffd76e';
  ctx.beginPath();
  ctx.moveTo(15, -12);
  ctx.lineTo(24, -16);
  ctx.lineTo(17.5, -8.5);
  ctx.closePath();
  ctx.fill();
  // 눈
  ctx.fillStyle = '#4a3b5c';
  ctx.beginPath();
  ctx.arc(14.5, -7.5, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};
