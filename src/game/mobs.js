// 먹구름 무리 — 유니콘을 향해 몰려온다. 시간에 따라 스폰이 가속.
// 피격 플래시·넉백·팝 사망까지 타격감의 절반이 여기 산다.

import { ctx } from '../engine/view.js';
import { P } from './player.js';
import { sparkle, poof } from './fx.js';

/**
 * @typedef {Object} Mob
 * @property {number} x @property {number} y
 * @property {number} hp @property {number} maxHp
 * @property {number} r @property {number} sp
 * @property {number} flash 피격 플래시 잔여
 * @property {number} kx @property {number} ky 넉백 속도
 * @property {number} seed
 * @property {number} tick 잔광 데미지 틱 쿨다운
 * @property {boolean} big
 */

/** @type {Mob[]} */
export let mobs = [];
let spawnAcc = 0;
let spawned = 0;

export const resetMobs = () => { mobs = []; spawnAcc = 0; spawned = 0; };

/**
 * @param {number} dt @param {number} elapsed
 */
export const spawnMobs = (dt, elapsed) => {
  // 스폰 간격: 1.1초 → 15분 어치까지 선형 가속 (스파이크는 0.22초 바닥)
  const interval = Math.max(0.22, 1.1 - elapsed * 0.009);
  spawnAcc += dt;
  while (spawnAcc > interval && mobs.length < 130) {
    spawnAcc -= interval;
    spawned++;
    const big = spawned % 9 === 0;
    const a = Math.random() * Math.PI * 2;
    const d = 560 + Math.random() * 80;
    const hpMul = 1 + elapsed * 0.02; // 시간이 갈수록 단단해짐
    mobs.push({
      x: P.x + Math.cos(a) * d,
      y: P.y + Math.sin(a) * d,
      hp: (big ? 26 : 6) * hpMul,
      maxHp: (big ? 26 : 6) * hpMul,
      r: big ? 30 : 16,
      sp: big ? 34 : 52 + Math.random() * 18,
      flash: 0, kx: 0, ky: 0,
      seed: Math.random() * 9,
      tick: 0,
      big,
    });
  }
};

/** @param {number} dt */
export const updateMobs = dt => {
  for (const m of mobs) {
    const d = Math.hypot(P.x - m.x, P.y - m.y) || 1;
    m.x += ((P.x - m.x) / d) * m.sp * dt + m.kx * dt;
    m.y += ((P.y - m.y) / d) * m.sp * dt + m.ky * dt;
    m.kx *= 1 - Math.min(1, dt * 8);
    m.ky *= 1 - Math.min(1, dt * 8);
    if (m.flash > 0) m.flash -= dt;
    if (m.tick > 0) m.tick -= dt;
  }
};

/**
 * 데미지 적용. 죽으면 true.
 * @param {Mob} m @param {number} dmg @param {number} kx @param {number} ky 넉백 방향
 */
export const hurt = (m, dmg, kx, ky) => {
  m.hp -= dmg;
  m.flash = 0.09;
  m.kx += kx;
  m.ky += ky;
  if (m.hp <= 0) {
    mobs = mobs.filter(v => v !== m);
    sparkle(m.x, m.y, m.big ? 16 : 8, m.big ? 180 : 120);
    poof(m.x, m.y);
    return true;
  }
  return false;
};

/**
 * 그림자 생물 렌더 — 스토리: 세상의 색을 삼킨 폭풍의 앞잡이들.
 *   소형 = 그림자 위습: 빛나는 보라 눈의 잉크 유령, 치맛단이 일렁인다
 *   대형 = 뇌운 브루트: 뿔과 번개 눈썹이 달린 육중한 폭풍 짐승
 * @param {number} t
 */
export const drawMobs = t => {
  for (const m of mobs) {
    ctx.save();
    ctx.translate(m.x, m.y + Math.sin(t * 2 + m.seed * 7) * 2.5);
    const white = m.flash > 0;
    const d = Math.hypot(P.x - m.x, P.y - m.y) || 1;
    const lx = (P.x - m.x) / d, ly = (P.y - m.y) / d; // 시선 방향

    if (!m.big) {
      // ── 그림자 위습
      const s = m.r / 16;
      ctx.scale(s, s);
      ctx.rotate(lx * 0.12); // 추격 방향으로 살짝 기운다
      // 잉크 방울 그림자
      ctx.fillStyle = 'rgba(10,6,25,.3)';
      ctx.beginPath();
      ctx.ellipse(0, 18, 13, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // 몸통 — 돔 + 일렁이는 치맛단
      const g = ctx.createLinearGradient(0, -16, 0, 16);
      g.addColorStop(0, white ? '#fff' : '#4b4270');
      g.addColorStop(1, white ? '#fff' : '#2a2344');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, -3, 13, Math.PI, 0);
      const wob = t * 7 + m.seed * 9;
      for (let i = 0; i <= 6; i++) {
        const wx = 13 - (26 * i) / 6;
        ctx.lineTo(wx, 10 + Math.sin(wob + i * 2.1) * 3.5 + (i % 2) * 4);
      }
      ctx.closePath();
      ctx.fill();
      if (!white) {
        // 빛나는 눈 (가산) — 유니콘을 노려본다
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = 'rgba(201,166,255,.9)';
        for (const ex of [-5, 5]) {
          ctx.beginPath();
          ctx.ellipse(ex + lx * 1.5, -5 + ly * 1.5, 2.6, 3.2, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
        // 성난 눈꺼풀
        ctx.strokeStyle = '#1c1633';
        ctx.lineWidth = 2.4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-8.5, -10);
        ctx.lineTo(-2, -7.5);
        ctx.moveTo(8.5, -10);
        ctx.lineTo(2, -7.5);
        ctx.stroke();
      }
    } else {
      // ── 뇌운 브루트
      const s = m.r / 30;
      ctx.scale(s, s);
      ctx.fillStyle = 'rgba(10,6,25,.3)';
      ctx.beginPath();
      ctx.ellipse(0, 27, 24, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // 하단 어두운 층 + 본체 퍼프
      ctx.fillStyle = white ? '#fff' : '#241d3d';
      ctx.beginPath();
      ctx.ellipse(0, 12, 26, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = white ? '#fff' : '#3a3158';
      for (const [ox, oy, r] of [[-18, 2, 16], [0, -8, 21], [17, 2, 16], [2, 8, 18]]) {
        ctx.beginPath();
        ctx.arc(ox, oy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      // 뿔 2개
      ctx.fillStyle = white ? '#fff' : '#1c1633';
      for (const hs of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(hs * 12, -22);
        ctx.lineTo(hs * 20, -34);
        ctx.lineTo(hs * 17, -20);
        ctx.closePath();
        ctx.fill();
      }
      if (!white) {
        // 몸속 스파크
        if (Math.sin(t * 9 + m.seed * 13) > 0.82) {
          ctx.strokeStyle = 'rgba(255,235,140,.9)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-8, 2);
          ctx.lineTo(-2, 5);
          ctx.lineTo(-6, 9);
          ctx.stroke();
        }
        // 빛나는 노란 눈 + 번개 눈썹
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = 'rgba(255,220,120,.95)';
        for (const ex of [-8, 8]) {
          ctx.beginPath();
          ctx.arc(ex + lx * 2, -3 + ly * 2, 3.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = '#ffe98c';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        for (const hs of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(hs * 13, -12);
          ctx.lineTo(hs * 8, -10);
          ctx.lineTo(hs * 10, -8);
          ctx.lineTo(hs * 4, -7);
          ctx.stroke();
        }
        // HP 링
        if (m.hp < m.maxHp) {
          ctx.strokeStyle = 'rgba(255,235,140,.75)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, 32, -Math.PI / 2, -Math.PI / 2 + (m.hp / m.maxHp) * Math.PI * 2);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }
};
