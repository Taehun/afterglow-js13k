// 비 — 3레벨의 위협. 무지개 아치가 우산이 된다.
// 빗방울이 아치에 막히면 그 자리의 무지개 밴드 색으로 플링크(시각+청각).

import { ctx } from '../engine/view.js';
import { VH } from './const.js';
import { overdrawY } from './cam.js';
import { arcBlocks } from './arcs.js';
import { platSurfaces } from './levels.js';
import { foals } from './foals.js';
import { plink } from './fx.js';
import { plinkNote } from './music.js';

/** @typedef {{x:number, y:number, vy:number}} Drop */
/** @type {Drop[]} */
let drops = [];
/** @type {[number, number] | null} */
let zone = null;
let spawnAcc = 0;

/** @param {import('./levels.js').Level} lv */
export const initRain = lv => {
  drops = [];
  zone = lv.rain ?? null;
  spawnAcc = 0;
};

/** @param {import('./levels.js').Level} lv @param {number} dt */
export const updateRain = (lv, dt) => {
  if (!zone) return;
  spawnAcc += dt * 26; // 초당 방울 수
  while (spawnAcc > 1) {
    spawnAcc -= 1;
    drops.push({
      x: zone[0] + Math.random() * (zone[1] - zone[0]),
      y: -80,
      vy: 340 + Math.random() * 120,
    });
  }
  const alive = [];
  for (const d of drops) {
    const py = d.y;
    d.y += d.vy * dt;
    // 아치에 막힘 → 플링크
    const hit = arcBlocks(d.x, py, d.y);
    if (hit != null) {
      plink(d.x, hit - 2, (d.x * 7) % 360);
      if (Math.random() < 0.3) plinkNote();
      continue;
    }
    // 망아지 명중 → 스턴
    let hurt = false;
    for (const f of foals) {
      // 공중(f.air)은 제외 — 낙하 물리가 스턴에 얼어붙는 것 방지
      if (f.wait > 0 || f.saving > 0 || f.stun > 0 || f.air) continue;
      if (Math.abs(f.x - d.x) < 11 && d.y > f.y - 30 && d.y < f.y + 4) {
        f.stun = 0.9;
        hurt = true;
        break;
      }
    }
    if (hurt) continue;
    // 지면 → 작은 스플래시 후 소멸
    const g = platSurfaces(lv, d.x, []);
    if (g.length && d.y >= Math.min(...g)) {
      plink(d.x, Math.min(...g), 210);
      continue;
    }
    // 세로형 화면에서도 항상 가시 영역 밖에서 소멸하도록 오버드로우 기준
    if (d.y < VH + overdrawY() + 80) alive.push(d);
  }
  drops = alive;
};

export const drawRain = () => {
  if (!zone) return;
  ctx.strokeStyle = 'rgba(140,180,255,.7)';
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (const d of drops) {
    ctx.moveTo(d.x + 1.5, d.y - 10); // 살짝 기울여 속도감
    ctx.lineTo(d.x, d.y);
  }
  ctx.stroke();
};

/** 비구름 렌더 (배경용) — 프레임 안에 완전히 들어오게 @param {number} t */
export const drawStormCloud = t => {
  if (!zone) return;
  const cx = (zone[0] + zone[1]) / 2;
  // 번개 플리커 — 결정적 유사난수 타이밍 (5.3초 주기 중 0.12초)
  const ph = t % 5.3;
  const bolt = ph < 0.12;
  if (bolt) {
    ctx.fillStyle = 'rgba(255,255,255,.08)';
    ctx.fillRect(-2000, -2000, 4000, 4000);
    ctx.strokeStyle = 'hsl(55 100% 85%)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    let bx = cx + Math.sin(t * 999) * 60, by = 74;
    ctx.moveTo(bx, by);
    for (let s = 0; s < 4; s++) {
      bx += (s % 2 ? 14 : -12);
      by += 26;
      ctx.lineTo(bx, by);
    }
    ctx.stroke();
  }
  // 어두운 밑층 → 본체 순서로 입체감
  ctx.fillStyle = bolt ? 'rgba(255,240,255,.9)' : 'rgba(75,65,115,.9)';
  for (let i = 0; i < 4; i++) {
    const ox = (i - 1.5) * 52 + Math.sin(t * 0.6 + i) * 5;
    ctx.beginPath();
    ctx.arc(cx + ox, 52 + Math.sin(t + i) * 3, 34, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = bolt ? 'rgba(255,244,255,.95)' : 'rgba(105,95,150,.9)';
  for (let i = 0; i < 6; i++) {
    const ox = (i - 2.5) * 44 + Math.sin(t * 0.7 + i) * 5;
    ctx.beginPath();
    ctx.arc(cx + ox, 30 + Math.sin(t + i * 2) * 4, 42 - Math.abs(i - 2.5) * 7, 0, Math.PI * 2);
    ctx.fill();
  }
};
