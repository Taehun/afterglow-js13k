// 유니콘 망아지 — 레밍스 최소형 워커(직진 + 벽에서 반전 + 낙하)와
// 이 게임의 그래픽 간판인 프로시저럴 벡터 렌더링.
// 규칙: AI는 상태 1개(걷기)만. 복잡한 판단 금지 — 퍼즐은 아치가 만든다.

import { ctx } from '../engine/view.js';
import { FOAL_VX, CLIMB, DROP, GRAV, KILL_Y, SLIDE_ACC, SLIDE_DEC } from './const.js';
import { arcSurfaces } from './arcs.js';
import { platSurfaces } from './levels.js';
import { sparkle, poof, ring } from './fx.js';
import { rescueChord, poofNote } from './music.js';

/**
 * @typedef {Object} Foal
 * @property {number} x @property {number} y
 * @property {number} dir  1|-1
 * @property {number} vy
 * @property {boolean} air
 * @property {number} stun   남은 스턴 시간
 * @property {number} phase  걷기 애니메이션 위상
 * @property {number} hue    갈기 색 오프셋
 * @property {number} wait   스폰 대기 시간 (>0이면 미등장)
 * @property {number} saving 구조 연출 진행 (0=아님, 0→1)
 * @property {number} blink  눈 깜빡임 타이머
 * @property {number} slope  현재 밟은 표면 기울기 (px/px, +는 내리막) — 슬라이드 속도용
 * @property {number} land   마지막 착지 시각 (스쿼시 연출)
 */

/** @type {Foal[]} */
export let foals = [];
export const rescue = { count: 0, total: 0 };

/** @type {import('./levels.js').Level} */
let lv;

/** 레벨 시작 @param {import('./levels.js').Level} level */
export const spawnFoals = level => {
  lv = level;
  foals = [];
  rescue.count = 0;
  rescue.total = level.foals;
  for (let i = 0; i < level.foals; i++) {
    foals.push({
      x: level.spawn[0], y: level.spawn[1], dir: 1, vy: 0, air: false,
      stun: 0, phase: Math.random() * 6, hue: i * 47 + 10,
      wait: 0.4 + i * 0.9, saving: 0, blink: 1 + Math.random() * 3,
      slope: 0, land: 0,
    });
  }
};

/** @param {Foal} f */
const respawn = f => {
  sparkle(f.x, Math.min(f.y, KILL_Y - 20), 8, 90);
  poofNote();
  f.x = lv.spawn[0];
  f.y = lv.spawn[1];
  f.dir = 1;
  f.air = false;
  f.vy = 0;
  f.wait = 0.5;
  poof(f.x, f.y - 14);
};

/** 이번 위치의 걷기 후보 표면 (플랫폼+아치) @param {number} x */
const surfacesAt = x => arcSurfaces(x, platSurfaces(lv, x, []));

/** @param {number} dt @param {number} t */
export const updateFoals = (dt, t) => {
  for (const f of foals) {
    if (f.saving > 0) { // 구조 연출: 떠오르며 사라짐
      f.saving += dt;
      f.y -= 55 * dt;
      if (Math.random() < 0.4) sparkle(f.x, f.y, 1, 50);
      continue;
    }
    if (f.wait > 0) {
      f.wait -= dt;
      if (f.wait <= 0) poof(f.x, f.y - 14);
      continue;
    }
    f.blink -= dt;
    if (f.blink < -0.13) f.blink = 1.5 + Math.random() * 3.5;
    if (f.stun > 0) { f.stun -= dt; continue; }

    if (f.air) {
      f.y += f.vy * dt;
      f.vy += GRAV * dt;
      // 착지: 이번 프레임에 가로지른 표면 위에 선다
      const prevY = f.y - f.vy * dt;
      let land = null;
      for (const s of surfacesAt(f.x)) {
        if (s >= prevY - 1 && s <= f.y + 2 && (land == null || s < land)) land = s;
      }
      if (land != null && f.vy > 0) {
        f.y = land;
        f.air = false;
        f.vy = 0;
        f.phase += 0.5;
        f.land = t;
        f.slope = 0;
        sparkle(f.x, f.y, 3, 60);
      } else if (f.y > KILL_Y) respawn(f);
      continue;
    }

    // 걷기 — 고정 스텝이라 프레임당 이동량이 일정해 판정이 안정적.
    // 내리막(무지개 미끄럼틀)은 가속, 오르막은 감속 — 아치 모양이 곧 플레이가 된다.
    const speedMul = f.slope > 0
      ? 1 + Math.min(1, f.slope * SLIDE_ACC)
      : Math.max(0.55, 1 - Math.abs(f.slope) * SLIDE_DEC);
    f.phase += dt * 9 * speedMul;
    const nx = f.x + f.dir * FOAL_VX * speedMul * dt;

    // 월드 밖 반전
    if (nx < 20 || nx > 940) { f.dir *= -1; continue; }

    // 이동량이 커질 수 있으므로 판정 창도 배율에 비례
    const cands = surfacesAt(nx).filter(s => s >= f.y - CLIMB * speedMul && s <= f.y + DROP * speedMul);
    if (cands.length) {
      // 오를 수 있는 표면 중 가장 높은 곳 — 아치 뿌리에서 자연스럽게 올라탄다
      const ny = Math.min(...cands);
      const dx = Math.abs(nx - f.x) || 1;
      f.slope = (ny - f.y) / dx; // y-down 좌표계: +면 진행 방향 내리막
      // 빠른 내리막에선 발밑 반짝이
      if (f.slope > 0.6 && Math.random() < dt * 20) sparkle(f.x, f.y, 1, 40);
      f.x = nx;
      f.y = ny;
    } else {
      // 벽(오를 수 없는 플랫폼 단차)이면 반전
      const wall = platSurfaces(lv, nx, []).some(s => s < f.y - CLIMB && s > f.y - 220);
      if (wall) { f.dir *= -1; f.slope = 0; continue; }
      // 틈새 건너기 — 아치 끝이 플랫폼에 몇 px 못 미쳐도 총총 건너간다.
      // (플레이어의 드로잉 오차를 시스템이 흡수하는 어시스트)
      let hopped = false;
      for (let k = 4; k <= 26; k += 4) {
        const hx = nx + f.dir * k;
        const hc = surfacesAt(hx).filter(s => s >= f.y - 10 && s <= f.y + 12);
        if (hc.length) {
          f.x = hx;
          f.y = Math.min(...hc);
          f.phase += 0.6;
          hopped = true;
          break;
        }
      }
      if (!hopped) { f.x = nx; f.air = true; f.vy = 0; f.slope = 0; }
    }

    // 게이트 도착
    const [gx, gy] = lv.gate;
    if (Math.abs(f.x - gx) < 24 && Math.abs(f.y - gy) < 46) {
      f.saving = 0.001;
      rescue.count++;
      rescueChord();
      ring(f.x, f.y - 20);
      sparkle(f.x, f.y - 16, 16, 120);
    }
  }
  foals = foals.filter(f => f.saving < 1.1);
};

// ── 렌더링 ─────────────────────────────────────────────────────────────────

/** @param {number} t */
export const drawFoals = t => {
  for (const f of foals) {
    if (f.wait > 0) continue;
    ctx.save();
    ctx.translate(f.x, f.y);
    if (f.saving > 0) ctx.globalAlpha = Math.max(0, 1 - f.saving);
    if (!f.air && f.saving === 0) { // 그림자
      ctx.fillStyle = 'rgba(60,40,90,.26)';
      ctx.beginPath();
      ctx.ellipse(0, 1.5, 15, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.scale(f.dir, 1);
    const bob = f.air ? 0 : Math.sin(f.phase * 2) * 1.3;
    ctx.translate(0, -13 + bob);
    if (f.stun > 0) ctx.rotate(Math.sin(t * 30) * 0.06);
    if (f.air) ctx.rotate(Math.min(0.25, f.vy / 900));
    // 착지 스쿼시 — 0.15초간 눌렸다 펴진다
    const sq = Math.max(0, (0.15 - (t - f.land)) / 0.15);
    if (sq > 0) ctx.scale(1 + 0.18 * sq, 1 - 0.18 * sq);
    // 경사 기울기 반영
    if (!f.air) ctx.rotate(Math.atan(f.slope * f.dir) * 0.5);
    drawFoal(f, t);
    ctx.restore();
  }
};

/** 장식용 망아지 (타이틀/엔드 화면) — 좌표·기울기만 받아 걷는 모습을 그린다
 * @param {number} x @param {number} y @param {number} t @param {number} hue @param {number} [angle] */
export const drawDecoFoal = (x, y, t, hue, angle = 0) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.translate(0, -13 + Math.sin(t * 18) * 1.3);
  drawFoal(/** @type {Foal} */ ({
    x, y, dir: 1, vy: 0, air: false, stun: 0, phase: t * 9, hue,
    wait: 0, saving: 0, blink: 1, slope: 0, land: 0,
  }), t);
  ctx.restore();
};

/**
 * 망아지 본체 — 원점은 몸통 중심(발 위 13px)
 * @param {Foal} f @param {number} t
 */
const drawFoal = (f, t) => {
  const walk = f.air ? 0 : 1;
  // 다리 4개 (앞뒤 × 좌우) — 위상차 걷기
  ctx.strokeStyle = '#f6ecf4';
  ctx.lineWidth = 3.6;
  ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const px = i < 2 ? 8 : -8;
    const ph = f.phase * 2 + (i % 2) * Math.PI + (i < 2 ? 0.6 : 0);
    const lift = f.air ? (i < 2 ? -3 : 3) : Math.max(0, Math.sin(ph)) * 4;
    const sway = f.air ? (i < 2 ? 4 : -4) : Math.cos(ph) * 3 * walk;
    ctx.beginPath();
    ctx.moveTo(px, 4);
    ctx.lineTo(px + sway, 13 - lift);
    ctx.stroke();
  }
  // 꼬리 — 무지개 3가닥 스위시
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = `hsl(${f.hue + i * 40} 85% 70%)`;
    ctx.lineWidth = 2.2;
    const sw = Math.sin(t * 3 + i) * 4;
    ctx.beginPath();
    ctx.moveTo(-13, -2 + i);
    ctx.quadraticCurveTo(-20, 2 + i * 2 + sw, -18 - i * 2, 8 + i * 2 + sw);
    ctx.stroke();
  }
  // 몸통 + 머리 — 밝은 배경에서 분리되도록 옅은 아웃라인
  ctx.fillStyle = '#fffaf5';
  ctx.strokeStyle = 'rgba(74,59,92,.3)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 8.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // 머리
  ctx.beginPath();
  ctx.arc(12, -9, 7.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // 주둥이
  ctx.fillStyle = '#ffe9f0';
  ctx.beginPath();
  ctx.arc(17, -7, 3.6, 0, Math.PI * 2);
  ctx.fill();
  // 귀
  ctx.fillStyle = '#fffaf5';
  ctx.beginPath();
  ctx.moveTo(8, -14);
  ctx.lineTo(10.5, -20);
  ctx.lineTo(13, -14.5);
  ctx.closePath();
  ctx.fill();
  // 뿔 — 금색 + 반짝
  ctx.fillStyle = '#ffd76e';
  ctx.beginPath();
  ctx.moveTo(13.5, -15);
  ctx.lineTo(16 + Math.sin(t * 2) * 0.4, -23);
  ctx.lineTo(17.5, -14);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = `hsl(48 100% 85% / ${0.5 + 0.5 * Math.sin(t * 5 + f.hue)})`;
  ctx.fillRect(15, -22, 1.6, 1.6);
  // 갈기 — 무지개 아치 3개
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = `hsl(${f.hue + i * 40} 85% 68%)`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(6 - i * 4.5, -8 + i * 1.5, 5, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
  }
  // 눈 (깜빡임) + 볼터치
  const open = f.blink > 0 && f.stun <= 0;
  ctx.fillStyle = '#4a3b5c';
  if (open) {
    ctx.beginPath();
    ctx.arc(13.5, -10.5, 1.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#4a3b5c';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(13.5, -10.5, 1.8, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,150,170,.5)';
  ctx.beginPath();
  ctx.arc(15.5, -6.5, 1.8, 0, Math.PI * 2);
  ctx.fill();
  // 스턴 물방울
  if (f.stun > 0) {
    ctx.fillStyle = 'rgba(120,180,255,.9)';
    ctx.beginPath();
    ctx.arc(6, -18 - Math.sin(t * 12) * 2, 2, 0, Math.PI * 2);
    ctx.fill();
  }
};
