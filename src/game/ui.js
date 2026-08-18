// HUD와 버튼 — 화면(스크린) 좌표계에서 그린다 (월드 변환 밖).
// 터치 최소 타깃 44px 이상, 심사 항목 Controls 대응: 마우스/터치 동일 UX.

import { ctx, W, H } from '../engine/view.js';
import { RAINBOW } from './const.js';
import { music } from './music.js';

/** 버튼 정의 (스크린 좌표는 매 프레임 계산) */
const BTN_R = 25;
/** @returns {{id:string, x:number, y:number}[]} */
const buttons = () => [
  { id: 'retry', x: W - 36, y: 36 },
  { id: 'mute', x: W - 96, y: 36 },
];

/**
 * 탭 위치의 버튼 id (없으면 null) — 스크린 좌표
 * @param {number} sx @param {number} sy
 */
export const hitButton = (sx, sy) => {
  // 히트 영역이 겹칠 수 있으므로 "가장 가까운" 버튼으로 판정
  let best = null, bd = BTN_R + 8;
  for (const b of buttons()) {
    const d = Math.hypot(sx - b.x, sy - b.y);
    if (d < bd) { bd = d; best = b.id; }
  }
  return best;
};

/**
 * @param {Object} o
 * @param {number} o.ink 남은 잉크 @param {number} o.inkMax
 * @param {number} o.saved @param {number} o.total
 * @param {number} o.inkFlash 잉크 부족 경고 타이머
 * @param {number} o.pending 드래그 중인 아치의 예상 비용 (0=없음)
 * @param {boolean} o.pendingOk 예상 비용을 감당 가능한가
 * @param {number} o.toastT 온보딩 토스트 잔여 시간
 * @param {number} o.t
 */
export const drawHud = ({ ink, inkMax, saved, total, inkFlash, pending, pendingOk, toastT, t }) => {
  // ── 잉크 리본 (좌상단) — 무지개 그라디언트 잔량 바
  const bx = 16, by = 20, bw = Math.min(240, W * 0.35), bh = 14;
  ctx.save();
  if (inkFlash > 0) ctx.translate(Math.sin(inkFlash * 60) * 3, 0);
  ctx.fillStyle = 'rgba(40,25,70,.35)';
  ctx.beginPath();
  ctx.roundRect(bx - 3, by - 3, bw + 6, bh + 6, 9);
  ctx.fill();
  const frac = Math.max(0, ink / inkMax);
  if (frac > 0) {
    const g = ctx.createLinearGradient(bx, 0, bx + bw, 0);
    RAINBOW.forEach((c, i) => g.addColorStop(i / 6, c));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw * frac, bh, 7);
    ctx.fill();
  }
  // 드래그 중 비용 프리뷰 — 소모될 구간이 점멸한다
  if (pending > 0) {
    const f0 = Math.max(0, (ink - pending) / inkMax);
    const blink = 0.35 + 0.35 * Math.sin(t * 8);
    ctx.fillStyle = pendingOk ? `rgba(255,255,255,${blink})` : `rgba(255,107,129,${blink + 0.2})`;
    ctx.beginPath();
    ctx.roundRect(bx + bw * f0, by, bw * (frac - f0), bh, 7);
    ctx.fill();
  }
  // 라벨 — 무지개 위에서도 읽히도록 다크 아웃라인
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(40,25,70,.8)';
  ctx.lineWidth = 3;
  ctx.strokeText('LIGHT', bx + 6, by + bh / 2 + 0.5);
  ctx.fillStyle = '#fff';
  ctx.fillText('LIGHT', bx + 6, by + bh / 2 + 0.5);
  ctx.restore();

  // ── 망아지 카운터 — 다크 칩 위에 얹어 하늘에서도 보이게
  ctx.fillStyle = 'rgba(40,25,70,.35)';
  ctx.beginPath();
  ctx.roundRect(bx - 3, by + 26, total * 26 + 14, 30, 15);
  ctx.fill();
  ctx.textBaseline = 'alphabetic';
  for (let i = 0; i < total; i++) {
    const x = bx + 12 + i * 26, y = by + 47;
    ctx.globalAlpha = i < saved ? 1 : 0.4;
    drawMiniFoal(x, y, i < saved);
    ctx.globalAlpha = 1;
  }

  // ── 온보딩 토스트 (하단 중앙)
  if (toastT > 0) {
    const a = Math.min(1, toastT);
    const msg = 'Tap an old rainbow to reclaim its light';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const tw = ctx.measureText(msg).width;
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(40,25,70,.7)';
    ctx.beginPath();
    ctx.roundRect(W / 2 - tw / 2 - 16, H - 64, tw + 32, 34, 17);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText(msg, W / 2, H - 47);
    ctx.globalAlpha = 1;
  }

  // ── 버튼
  for (const b of buttons()) {
    ctx.fillStyle = 'rgba(40,25,70,.35)';
    ctx.beginPath();
    ctx.arc(b.x, b.y, BTN_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    if (b.id === 'retry') { // ↻
      ctx.beginPath();
      ctx.arc(b.x, b.y, 10, -0.5, Math.PI * 1.5);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(b.x + 13, b.y - 8);
      ctx.lineTo(b.x + 4, b.y - 8);
      ctx.lineTo(b.x + 9, b.y - 1);
      ctx.closePath();
      ctx.fill();
    } else { // 스피커
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(b.x - 9, b.y - 4);
      ctx.lineTo(b.x - 3, b.y - 4);
      ctx.lineTo(b.x + 3, b.y - 10);
      ctx.lineTo(b.x + 3, b.y + 10);
      ctx.lineTo(b.x - 3, b.y + 4);
      ctx.lineTo(b.x - 9, b.y + 4);
      ctx.closePath();
      ctx.fill();
      if (music.muted) {
        ctx.beginPath();
        ctx.moveTo(b.x + 6, b.y - 7);
        ctx.lineTo(b.x + 14, b.y + 7);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(b.x + 5, b.y, 7, -0.9, 0.9);
        ctx.stroke();
      }
    }
  }
};

/** HUD용 미니 망아지 아이콘 @param {number} x @param {number} y @param {boolean} lit */
const drawMiniFoal = (x, y, lit) => {
  ctx.fillStyle = lit ? '#fffaf5' : '#cbc3dd';
  ctx.beginPath();
  ctx.ellipse(x, y, 8, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 6.5, y - 5, 4.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = lit ? '#ffd76e' : '#cbc3dd';
  ctx.beginPath();
  ctx.moveTo(x + 6.5, y - 9);
  ctx.lineTo(x + 8.5, y - 13.5);
  ctx.lineTo(x + 9.5, y - 8.5);
  ctx.closePath();
  ctx.fill();
};
