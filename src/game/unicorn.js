// 유니콘 — 이 게임의 얼굴. 부드러운 무윤곽 파스텔 실루엣, 흐르는 갈기,
// 나선 금뿔, 속눈썹 있는 눈. 원점은 발굽 라인 중앙, +x를 바라본다.
// 목은 라운드캡 굵은 스트로크로 그려 몸통·머리와 이음새 없이 섞인다.

import { ctx } from '../engine/view.js';

/** 갈기/꼬리 파스텔 5색 */
const MANE = ['#ff9fc9', '#ffd39f', '#a8ecc9', '#b9a8ff', '#9fd4ff'];
const COAT = '#fffdfb';
const COAT_SHADE = '#f3e2ee';

/**
 * @param {number} t 시간
 * @param {Object} [o]
 * @param {number} [o.scale] 기본 1 = 약 52px 높이
 * @param {number} [o.walk]  걷기/호핑 위상 (0 = 정지)
 * @param {boolean} [o.happy] 눈웃음 (클리어 연출)
 */
export const drawUnicorn = (t, { scale = 1, walk = 0, happy = false } = {}) => {
  ctx.save();
  ctx.scale(scale, scale);

  // 그림자
  ctx.fillStyle = 'rgba(70,45,110,.18)';
  ctx.beginPath();
  ctx.ellipse(0, 1, 17, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.scale(1, 1 + Math.sin(t * 1.7) * 0.015); // 호흡

  // ── 꼬리 — 엉덩이에서 흘러내리는 파스텔 플룸 4가닥
  ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const sway = Math.sin(t * 2.1 + i * 0.7) * 3;
    ctx.strokeStyle = MANE[(i + 1) % 5];
    ctx.lineWidth = 3.6 - i * 0.5;
    ctx.beginPath();
    ctx.moveTo(-12.5, -18 + i * 0.8);
    ctx.bezierCurveTo(-20, -19 + sway, -24 - i * 1.5, -11 + sway, -20 - i * 2.2, -2 + i * 1.2 + sway);
    ctx.stroke();
  }

  // ── 먼 쪽 다리 2개
  leg(-8.5, walk, '#ece0ea', 0);
  leg(6, walk, '#ece0ea', Math.PI);

  // ── 몸통 (무윤곽 + 배 쪽 은은한 음영)
  ctx.fillStyle = COAT;
  ctx.beginPath();
  ctx.ellipse(-1, -16.5, 13.5, 8.8, -0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COAT_SHADE;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.ellipse(-2, -12, 10, 3.8, -0.04, 0, Math.PI);
  ctx.fill();
  ctx.globalAlpha = 1;

  // ── 목 — 라운드캡 굵은 스트로크라 어깨·머리에 매끈히 녹는다
  ctx.strokeStyle = COAT;
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.moveTo(4, -19);
  ctx.quadraticCurveTo(9, -24, 12, -32);
  ctx.stroke();

  // ── 가까운 쪽 다리 2개
  leg(-5, walk, COAT, Math.PI);
  leg(9.5, walk, COAT, 0);

  // ── 머리 + 주둥이 (무윤곽 원 두 개)
  ctx.fillStyle = COAT;
  ctx.beginPath();
  ctx.ellipse(14, -34, 6.6, 5.9, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff3f7';
  ctx.beginPath();
  ctx.ellipse(19.8, -31.8, 3.8, 3.1, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // 콧구멍·미소
  ctx.fillStyle = '#d3a8c2';
  ctx.beginPath();
  ctx.ellipse(21.4, -32.4, 0.8, 0.6, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(150,110,150,.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(19.6, -30.6, 1.7, 0.4, Math.PI - 0.9);
  ctx.stroke();

  // ── 갈기 — 정수리에서 목덜미를 따라 어깨로, 5가닥
  for (let i = 0; i < 5; i++) {
    const w = Math.sin(t * 2.4 + i * 0.9) * 2;
    ctx.strokeStyle = MANE[i];
    ctx.lineWidth = 4 - i * 0.4;
    ctx.beginPath();
    ctx.moveTo(8.5 - i * 0.8, -38.5 + i * 0.5);
    ctx.bezierCurveTo(
      3.5 - i * 1.2, -35.5 + w, -0.5 - i * 1.4, -30 + i * 1.1 + w,
      -4.5 - i * 1.6, -22.5 + i * 1.4 + w * 1.4,
    );
    ctx.stroke();
  }

  // ── 귀 (갈기 위에 — 가끔 쫑긋)
  const twitch = Math.max(0, Math.sin(t * 0.9) - 0.96) * 8;
  ctx.save();
  ctx.translate(10.2, -39.8);
  ctx.scale(1.25, 1.25);
  ctx.rotate(-0.3 - twitch);
  ctx.fillStyle = COAT;
  ctx.beginPath();
  ctx.moveTo(-1.8, 1.5);
  ctx.quadraticCurveTo(-1.2, -5.5, 1.2, -5);
  ctx.quadraticCurveTo(3, -2, 2, 1.8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffd4e2';
  ctx.beginPath();
  ctx.moveTo(-0.5, 0.5);
  ctx.quadraticCurveTo(-0.1, -3, 1, -2.8);
  ctx.quadraticCurveTo(1.7, -1, 1.1, 0.8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // ── 앞머리 한 가닥 (이마 위로 살짝)
  ctx.strokeStyle = MANE[0];
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(12, -39);
  ctx.quadraticCurveTo(15.5, -38.6, 16.3, -36.4);
  ctx.stroke();

  // ── 뿔 — 나선 무늬 금뿔 + 끝 반짝임
  const hornG = ctx.createLinearGradient(15, -40, 20, -53);
  hornG.addColorStop(0, '#ffc95c');
  hornG.addColorStop(1, '#fff1bb');
  ctx.fillStyle = hornG;
  ctx.beginPath();
  ctx.moveTo(13.6, -39.2);
  ctx.lineTo(19.6, -52.5);
  ctx.lineTo(17.6, -38.4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,145,60,.5)';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(14.6, -42.3);
  ctx.lineTo(17.5, -41.4);
  ctx.moveTo(15.5, -45.5);
  ctx.lineTo(18.2, -44.7);
  ctx.moveTo(16.6, -48.6);
  ctx.lineTo(18.9, -48);
  ctx.stroke();
  // 끝 반짝임 (회전하는 4각 별)
  ctx.fillStyle = `rgba(255,244,200,${0.6 + 0.4 * Math.sin(t * 4.2)})`;
  ctx.save();
  ctx.translate(19.8, -53);
  ctx.rotate(t * 1.5);
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const r = i % 2 ? 1 : 2.7;
    const a = (i * Math.PI) / 4;
    i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // ── 눈 — 하이라이트 + 속눈썹 (2.8초에 한 번 깜빡)
  const blinkP = (t % 2.8) / 2.8;
  const open = happy ? 0 : blinkP > 0.94 ? Math.abs(Math.sin(blinkP * 40)) : 1;
  ctx.save();
  ctx.translate(14.8, -35);
  if (open > 0.15) {
    ctx.scale(1, open);
    ctx.fillStyle = '#4a3654';
    ctx.beginPath();
    ctx.ellipse(0, 0, 1.9, 2.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0.6, -0.8, 0.8, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#4a3654';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    happy ? ctx.arc(0, 0.8, 2, Math.PI + 0.3, -0.3) : ctx.arc(0, -0.5, 2, 0.3, Math.PI - 0.3);
    ctx.stroke();
  }
  // 속눈썹 3가닥 (위쪽 바깥 방향)
  ctx.strokeStyle = '#4a3654';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const a = -2.4 + i * 0.45;
    ctx.moveTo(Math.cos(a) * 2, Math.sin(a) * 2.3 * Math.max(open, 0.3));
    ctx.lineTo(Math.cos(a) * 3.6, Math.sin(a) * 3.8 * Math.max(open, 0.3) - 0.3);
  }
  ctx.stroke();
  ctx.restore();

  // 볼터치
  ctx.fillStyle = 'rgba(255,150,175,.4)';
  ctx.beginPath();
  ctx.ellipse(18, -31, 1.8, 1.2, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

/**
 * 다리 — 가늘고 발굽은 금색. walk 위상으로 총총거림.
 * @param {number} x @param {number} walk @param {string} col @param {number} ph
 */
const leg = (x, walk, col, ph) => {
  const lift = walk ? Math.max(0, Math.sin(walk + ph)) * 4 : 0;
  const sway = walk ? Math.cos(walk + ph) * 2 : 0;
  ctx.strokeStyle = col;
  ctx.lineWidth = 3.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, -13);
  ctx.lineTo(x + sway, -2.5 - lift);
  ctx.stroke();
  ctx.fillStyle = '#ffca5f';
  ctx.beginPath();
  ctx.roundRect(x + sway - 2, -3 - lift, 4, 2.8, 1.3);
  ctx.fill();
};

/**
 * 아기 망아지 (골 지점) — 유니콘 축소판, 통통 기다림
 * @param {number} t @param {boolean} excited
 */
export const drawFoalGoal = (t, excited) => {
  const hop = excited ? Math.abs(Math.sin(t * 8)) * 6 : Math.abs(Math.sin(t * 3)) * 2;
  ctx.save();
  ctx.translate(0, -hop);
  ctx.scale(-0.6, 0.6); // 유니콘을 마주보는 방향
  drawUnicorn(t + 1.3, { happy: excited });
  ctx.restore();
};
