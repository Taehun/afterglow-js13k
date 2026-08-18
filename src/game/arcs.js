// 무지개 아치 — 이 게임의 유일한 도구.
// 설계 원칙(심사 렌즈 반영): 자유곡선 금지. 드래그의 양 끝점을 스냅하고
// 높이는 현 길이에서 유도해 "항상 예쁜 포물선"만 나온다(어시스트 드로잉).
// 그리는 즉시 폴리라인 지오메트리로 굳혀 충돌은 순수 기하 판정만 한다.

import { ctx } from '../engine/view.js';
import { SNAP, ARC_MIN, ARC_MAX, ARC_H_RATIO, ROOT_SNAP, RAINBOW, RAINBOW_H } from './const.js';
import { glint } from './fx.js';
import { glissNote } from './music.js';

/**
 * @typedef {Object} Arc
 * @property {number} x0 @property {number} y0
 * @property {number} x1 @property {number} y1
 * @property {number} h    아치 높이
 * @property {number} len  잉크 비용(≈곡선 길이)
 * @property {number} born 생성 시각(글로우 애니메이션용)
 * @property {boolean} charged 망아지가 한 번 건너 충전됨 (잉크 일부 환급됨)
 * @property {number} flash 충전 반짝임 시각
 * @property {number[][]} pts 샘플 폴리라인 [x,y][]
 */

/** @type {Arc[]} */
export let arcs = [];

/** @param {number} v @param {number} step */
const q = (v, step) => Math.round(v / step) * step;

/**
 * 포물선 y값. u=(x-x0)/(x1-x0)
 * @param {Arc | {x0:number,y0:number,x1:number,y1:number,h:number}} a @param {number} x
 */
export const arcY = (a, x) => {
  const u = (x - a.x0) / (a.x1 - a.x0);
  return a.y0 + (a.y1 - a.y0) * u - a.h * 4 * u * (1 - u);
};

/**
 * 드래그 입력을 양자화된 아치 후보로 변환. 유효하지 않으면 null.
 * @param {number} ax @param {number} ay @param {number} bx @param {number} by
 * @param {(x:number, y:number) => number | null} snapGround x 근처 지면 y를 주는 함수
 */
export const quantize = (ax, ay, bx, by, snapGround) => {
  // 항상 왼쪽→오른쪽으로 정규화
  if (bx < ax) { [ax, bx] = [bx, ax]; [ay, by] = [by, ay]; }
  let x0 = q(ax, SNAP), x1 = q(bx, SNAP);
  let y0 = q(ay, SNAP), y1 = q(by, SNAP);
  if (x1 - x0 < ARC_MIN) x1 = x0 + ARC_MIN;
  if (x1 - x0 > ARC_MAX) x1 = x0 + ARC_MAX;
  // 끝점이 지면 근처면 뿌리내림 — 망아지가 자연스럽게 올라탈 수 있도록
  const g0 = snapGround(x0, y0);
  const g1 = snapGround(x1, y1);
  if (g0 != null && Math.abs(g0 - y0) < ROOT_SNAP) y0 = g0;
  if (g1 != null && Math.abs(g1 - y1) < ROOT_SNAP) y1 = g1;
  const chord = Math.hypot(x1 - x0, y1 - y0);
  const h = Math.max(50, q(chord * ARC_H_RATIO, 20));
  const len = Math.round(chord * 1.15);
  const a = { x0, y0, x1, y1, h, len, born: 0, charged: false, flash: 0, pts: /** @type {number[][]} */ ([]) };
  sample(a);
  return a;
};

/** 폴리라인 캐시 생성 @param {Arc} a */
const sample = a => {
  a.pts = [];
  const n = Math.max(12, ((a.x1 - a.x0) / 14) | 0);
  for (let i = 0; i <= n; i++) {
    const x = a.x0 + ((a.x1 - a.x0) * i) / n;
    a.pts.push([x, arcY(a, x)]);
  }
};

/** @param {Arc} a @param {number} now */
export const addArc = (a, now) => { a.born = now; arcs.push(a); };

/** 장식용(타이틀 등) 고정 아치 @param {number} x0 @param {number} y0 @param {number} x1 @param {number} y1 @param {number} h */
export const staticArc = (x0, y0, x1, y1, h) => {
  const a = { x0, y0, x1, y1, h, len: 0, born: 0, charged: false, flash: 0, pts: /** @type {number[][]} */ ([]) };
  sample(a);
  return a;
};

/** x 위치의 아치 표면 y들 @param {number} x @param {number[]} out */
export const arcSurfaces = (x, out) => {
  for (const a of arcs) if (x >= a.x0 && x <= a.x1) out.push(arcY(a, x));
  return out;
};

/**
 * 점에서 가장 가까운 아치 (지우기 판정) — 반경 r 안이면 반환
 * @param {number} x @param {number} y @param {number} r
 */
export const arcAt = (x, y, r) => {
  let best = null, bd = r;
  for (const a of arcs) {
    for (const [px, py] of a.pts) {
      const d = Math.hypot(px - x, py - y);
      if (d < bd) { bd = d; best = a; }
    }
  }
  return best;
};

/** @param {Arc} a */
export const removeArc = a => { arcs = arcs.filter(v => v !== a); };
export const clearArcs = () => { arcs = []; };

/**
 * 빗방울이 아치에 막히는지 — 막히면 [x, 표면y] 반환
 * @param {number} x @param {number} yTop 이번 프레임 이동 전 y @param {number} yBot 이동 후 y
 */
export const arcBlocks = (x, yTop, yBot) => {
  for (const a of arcs) {
    if (x < a.x0 || x > a.x1) continue;
    const sy = arcY(a, x);
    if (sy >= yTop - 2 && sy <= yBot + 2) return sy;
  }
  return null;
};

// ── 렌더링 ─────────────────────────────────────────────────────────────────

const BAND_W = 4.2;

/**
 * 아치 한 개를 7색 밴드로 그린다. 법선 방향으로 밴드를 쌓는다.
 * @param {Arc} a @param {number} t 현재 시각 @param {number} alpha
 */
export const drawArc = (a, t, alpha = 1) => {
  const age = t - a.born;
  // 생성 직후 좌→우로 탄성 있게 자라나는 연출 (easeOutCubic)
  const lin = a.born ? Math.min(1, age * 2.2) : 1;
  const grow = 1 - (1 - lin) ** 3;
  const nPts = Math.max(2, Math.ceil(a.pts.length * grow));
  const flashing = a.flash && t - a.flash < 0.5 ? 1 - (t - a.flash) * 2 : 0; // 충전 반짝임
  const bw = BAND_W * (1 + 0.35 * Math.max(0, 1 - age * 4)); // 솟는 순간 굵었다가 정착

  // 글로우 (가산) — round cap이 뿌리에 흰 덩어리를 만들지 않도록 butt + 끝점 제외
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = `hsl(300 80% 80% / ${(0.13 + flashing * 0.2 + (a.charged ? 0.05 : 0)) * alpha})`;
  ctx.lineWidth = BAND_W * 11;
  ctx.lineCap = 'butt';
  strokePts(a.pts, Math.max(2, nPts - 1), 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  ctx.lineCap = 'round';

  for (let b = 0; b < 7; b++) {
    const off = (b - 3) * BAND_W;
    const amp = a.charged ? 0.2 : 0.14;
    const shimmer = Math.min(1, 0.88 + amp * Math.sin(t * (a.charged ? 3.2 : 2.4) + b * 0.9) + flashing * 0.4);
    ctx.strokeStyle = RAINBOW[b].replace(')', ` / ${alpha * shimmer})`);
    ctx.lineWidth = bw + 0.6;
    strokePts(a.pts, nPts, off, b);
  }
  // 자라나는 중이면 머리 끝에 반짝이
  if (lin < 1) {
    const [hx, hy] = a.pts[nPts - 1];
    glint(hx, hy, RAINBOW_H[(age * 14 | 0) % 7]);
  }
};

/**
 * 폴리라인을 법선 오프셋으로 스트로크
 * @param {number[][]} pts @param {number} n @param {number} off @param {number} band
 */
const strokePts = (pts, n, off, band) => {
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const [x, y] = pts[i];
    // 법선 근사: 이웃 점 기울기
    const [px, py] = pts[Math.max(0, i - 1)];
    const [nx2, ny2] = pts[Math.min(pts.length - 1, i + 1)];
    const dx = nx2 - px, dy = ny2 - py;
    const dl = Math.hypot(dx, dy) || 1;
    const ox = (-dy / dl) * off, oy = (dx / dl) * off;
    i ? ctx.lineTo(x + ox, y + oy) : ctx.moveTo(x + ox, y + oy);
  }
  ctx.stroke();
};

// ── 드로잉 프리뷰 상태 ─────────────────────────────────────────────────────

export const preview = {
  active: false,
  /** @type {Arc | null} */ arc: null,
  ok: true,           // 잉크가 충분한가
  sx: 0, sy: 0,       // 드래그 시작(월드)
  lastGliss: -1,      // 마지막으로 연주한 글리산도 스텝
};

/**
 * 드래그 중 프리뷰 갱신 + 글리산도 (잉크 부족 시 소리·반짝이 없음)
 * @param {Arc | null} a @param {boolean} ok
 */
export const setPreview = (a, ok) => {
  preview.arc = a;
  preview.ok = ok;
  if (a && ok) {
    const step = (a.len / 60) | 0;
    if (step !== preview.lastGliss) {
      preview.lastGliss = step;
      glissNote(step);
      const [hx, hy] = a.pts[a.pts.length - 1];
      glint(hx, hy, RAINBOW_H[step % 7]);
    }
  }
};

/** @param {number} t */
export const drawPreview = t => {
  if (!preview.active || !preview.arc) return;
  ctx.globalAlpha = preview.ok ? 0.55 : 0.22;
  drawArc(preview.arc, t, 0.8);
  ctx.globalAlpha = 1;
  // 끝점 마커 (잉크 부족이면 경고색)
  const a = preview.arc;
  for (const [mx, my] of [[a.x0, a.y0], [a.x1, a.y1]]) {
    ctx.fillStyle = preview.ok ? '#fff' : '#ff6b81';
    ctx.beginPath();
    ctx.arc(mx, my, 5 + Math.sin(t * 6) * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
};
