// 유니콘 — 치비 프로포션의 귀여움 전면 배치.
// 큰 머리(몸통과 1:1), 왕방울 눈(하이라이트 2개), 뭉툭한 다리, 통통한 몸,
// 두툼한 파스텔 갈기. 원점은 발굽 라인 중앙, +x를 바라본다.

import { ctx } from '../engine/view.js';

/** 갈기/꼬리 파스텔 5색 */
const MANE = ['#ff9fc9', '#ffd39f', '#a8ecc9', '#b9a8ff', '#9fd4ff'];
const COAT = '#fffdfb';

/**
 * @param {number} t 시간
 * @param {Object} [o]
 * @param {number} [o.scale] 기본 1 = 약 50px 높이
 * @param {number} [o.walk]  걷기/질주 위상 (0 = 정지)
 * @param {boolean} [o.happy] 눈웃음
 */
export const drawUnicorn = (t, { scale = 1, walk = 0, happy = false } = {}) => {
  ctx.save();
  ctx.scale(scale, scale);

  // 그림자
  ctx.fillStyle = 'rgba(20,12,40,.3)';
  ctx.beginPath();
  ctx.ellipse(0, 1, 15, 3.6, 0, 0, Math.PI * 2);
  ctx.fill();

  const breath = walk ? 1 : 1 + Math.sin(t * 1.7) * 0.02;
  ctx.scale(1, breath);
  ctx.lineCap = 'round';

  // ── 꼬리 — 짧고 두툼한 플룸 3가닥
  for (let i = 0; i < 3; i++) {
    const sway = Math.sin(t * 2.3 + i * 0.8) * 2.5 + (walk ? Math.sin(walk) * 2 : 0);
    ctx.strokeStyle = MANE[(i * 2 + 1) % 5];
    ctx.lineWidth = 5 - i;
    ctx.beginPath();
    ctx.moveTo(-10.5, -14 + i);
    ctx.quadraticCurveTo(-17, -14 + sway, -18 - i, -6 + i * 2 + sway);
    ctx.stroke();
  }

  // ── 다리 4개 — 뭉툭 + 금 발굽 (먼 쪽 2개는 어둡게)
  leg(-7, walk, '#ebdfe9', 0);
  leg(5, walk, '#ebdfe9', Math.PI);
  leg(-5, walk, COAT, Math.PI);
  leg(7.5, walk, COAT, 0);

  // ── 몸통 — 통통한 알
  ctx.fillStyle = COAT;
  ctx.beginPath();
  ctx.ellipse(-1.5, -13, 11.5, 9, -0.08, 0, Math.PI * 2);
  ctx.fill();
  // 배 음영
  ctx.fillStyle = 'rgba(230,205,225,.5)';
  ctx.beginPath();
  ctx.ellipse(-2, -8.5, 8, 3, 0, 0, Math.PI);
  ctx.fill();
  // 가슴 털 뭉치
  ctx.fillStyle = COAT;
  ctx.beginPath();
  ctx.arc(7, -12, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // ── 머리 — 몸통만 한 왕 머리 (치비의 핵심)
  const nod = walk ? Math.sin(walk * 2) * 1.2 : Math.sin(t * 1.7) * 0.6;
  ctx.save();
  ctx.translate(7.5, -29 + nod);

  ctx.fillStyle = COAT;
  ctx.beginPath();
  ctx.arc(0, 0, 10.2, 0, Math.PI * 2);
  ctx.fill();
  // 주둥이 — 작고 동그란 볼록
  ctx.fillStyle = '#fff1f6';
  ctx.beginPath();
  ctx.ellipse(8.6, 3, 4.2, 3.6, -0.15, 0, Math.PI * 2);
  ctx.fill();
  // 입 — 아주 작은 미소
  ctx.strokeStyle = 'rgba(150,110,150,.65)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(8.2, 4.2, 1.5, 0.5, Math.PI - 0.9);
  ctx.stroke();

  // ── 귀 — 작고 동글
  const twitch = Math.max(0, Math.sin(t * 0.9) - 0.96) * 7;
  ctx.save();
  ctx.translate(-3.5, -9);
  ctx.rotate(-0.35 - twitch);
  ctx.fillStyle = COAT;
  ctx.beginPath();
  ctx.ellipse(0, -2.2, 2.6, 4, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd4e2';
  ctx.beginPath();
  ctx.ellipse(0.2, -2, 1.3, 2.3, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── 뿔 — 짧고 통통한 금뿔 + 나선 + 별
  const hornG = ctx.createLinearGradient(2, -10, 6, -20);
  hornG.addColorStop(0, '#ffc95c');
  hornG.addColorStop(1, '#fff3c2');
  ctx.fillStyle = hornG;
  ctx.beginPath();
  ctx.moveTo(0.2, -9);
  ctx.lineTo(5.5, -19.5);
  ctx.lineTo(4.3, -8.6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,145,60,.55)';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(1.2, -11.5);
  ctx.lineTo(4.4, -10.8);
  ctx.moveTo(2.2, -14.5);
  ctx.lineTo(4.9, -13.9);
  ctx.moveTo(3.2, -17.3);
  ctx.lineTo(5.2, -16.8);
  ctx.stroke();
  // 별 반짝
  ctx.fillStyle = `rgba(255,244,200,${0.6 + 0.4 * Math.sin(t * 4.2)})`;
  ctx.save();
  ctx.translate(5.8, -20.5);
  ctx.rotate(t * 1.5);
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const r = i % 2 ? 1 : 2.4;
    const a = (i * Math.PI) / 4;
    i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // ── 갈기 — 두툼한 파스텔 뭉치 (이마→정수리→목덜미)
  for (let i = 0; i < 4; i++) {
    const w = Math.sin(t * 2.6 + i) * 1.6;
    ctx.strokeStyle = MANE[i];
    ctx.lineWidth = 5.5 - i * 0.7;
    ctx.beginPath();
    ctx.moveTo(-1 - i * 0.5, -8.5 + i * 0.8);
    ctx.quadraticCurveTo(-8 - i, -5 + i * 1.5 + w, -9.5 - i * 0.8, 3 + i * 2 + w);
    ctx.stroke();
  }
  // 이마 앞머리 퐁
  ctx.fillStyle = MANE[0];
  ctx.beginPath();
  ctx.ellipse(0.5, -7.5, 3.4, 2.4, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // ── 눈 — 왕방울 (하이라이트 2개 + 속눈썹)
  const blinkP = (t % 3.1) / 3.1;
  const open = happy ? 0 : blinkP > 0.94 ? Math.abs(Math.sin(blinkP * 45)) : 1;
  ctx.save();
  ctx.translate(3.2, -0.5);
  if (open > 0.15) {
    ctx.scale(1, open);
    ctx.fillStyle = '#41304e';
    ctx.beginPath();
    ctx.ellipse(0, 0, 3.1, 3.7, 0, 0, Math.PI * 2);
    ctx.fill();
    // 큰 하이라이트 + 작은 하이라이트 = 촉촉한 눈
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(1, -1.3, 1.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-0.9, 1.4, 0.65, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#41304e';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    happy ? ctx.arc(0, 1, 2.6, Math.PI + 0.3, -0.3) : ctx.arc(0, -0.5, 2.6, 0.3, Math.PI - 0.3);
    ctx.stroke();
  }
  // 속눈썹 2가닥
  ctx.strokeStyle = '#41304e';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(-1.2, -3.2 * Math.max(open, 0.3));
  ctx.lineTo(-2.6, -4.4 * Math.max(open, 0.3));
  ctx.moveTo(0.8, -3.5 * Math.max(open, 0.3));
  ctx.lineTo(0.4, -5 * Math.max(open, 0.3));
  ctx.stroke();
  ctx.restore();

  // 볼터치 — 크고 몽글하게
  ctx.fillStyle = 'rgba(255,150,175,.45)';
  ctx.beginPath();
  ctx.ellipse(7, 1.2, 2.6, 1.7, -0.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore(); // 머리 끝
  ctx.restore();
};

/**
 * 다리 — 짧고 뭉툭, 금 발굽.
 * @param {number} x @param {number} walk @param {string} col @param {number} ph
 */
const leg = (x, walk, col, ph) => {
  const lift = walk ? Math.max(0, Math.sin(walk + ph)) * 4.5 : 0;
  const sway = walk ? Math.cos(walk + ph) * 2.5 : 0;
  ctx.strokeStyle = col;
  ctx.lineWidth = 4.4;
  ctx.beginPath();
  ctx.moveTo(x, -10);
  ctx.lineTo(x + sway, -2.5 - lift);
  ctx.stroke();
  ctx.fillStyle = '#ffca5f';
  ctx.beginPath();
  ctx.roundRect(x + sway - 2.3, -3.2 - lift, 4.6, 3, 1.5);
  ctx.fill();
};

/**
 * 아기 망아지 — 유니콘 축소판, 통통 기다림
 * @param {number} t @param {boolean} excited
 */
export const drawFoalGoal = (t, excited) => {
  const hop = excited ? Math.abs(Math.sin(t * 8)) * 6 : Math.abs(Math.sin(t * 3)) * 2;
  ctx.save();
  ctx.translate(0, -hop);
  ctx.scale(-0.6, 0.6);
  drawUnicorn(t + 1.3, { happy: excited });
  ctx.restore();
};
