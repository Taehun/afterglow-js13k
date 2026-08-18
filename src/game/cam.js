// 월드 ↔ 화면 변환 — 균등 스케일 + 중앙 정렬.
// 배경은 월드 좌표에서 화면보다 넓게 오버드로우해서 레터박스를 없앤다.

import { W, H, ctx } from '../engine/view.js';
import { VW, VH } from './const.js';

export const cam = { s: 1, ox: 0, oy: 0 };

export const updateCam = () => {
  cam.s = Math.min(W / VW, H / VH);
  cam.ox = (W - VW * cam.s) / 2;
  cam.oy = (H - VH * cam.s) / 2;
};

/** 화면(CSS px) → 월드 좌표 @param {number} sx @param {number} sy */
export const toWorld = (sx, sy) => ({ x: (sx - cam.ox) / cam.s, y: (sy - cam.oy) / cam.s });

/** 월드 변환 적용 (draw 시작 시) */
export const beginWorld = () => {
  ctx.save();
  ctx.translate(cam.ox, cam.oy);
  ctx.scale(cam.s, cam.s);
};

export const endWorld = () => ctx.restore();

/** 오버드로우 좌우 여백 — 화면이 월드보다 넓을 때 배경이 커버해야 하는 범위 */
export const overdrawX = () => Math.max(0, (W / cam.s - VW) / 2) + 40;
export const overdrawY = () => Math.max(0, (H / cam.s - VH) / 2) + 40;
