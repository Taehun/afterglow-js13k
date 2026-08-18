// LOOPLIGHT (스파이크) — 무지개 컨트레일로 고리를 그려 먹구름을 터뜨리는
// 원터치 선회 비행 아케이드.
// 조작: 화면 왼쪽/오른쪽 절반 홀드 = 좌/우 선회 (키보드: ←→ 또는 A/D)
// 코어 루프 검증용 — 재미가 확인되면 본선 구조(웨이브/보스/메타)를 얹는다.

import { ctx, W, H } from '../engine/view.js';
import { ptr, keys, keysJust } from '../engine/input.js';
import { save, load } from '../engine/save.js';
import { S } from '../engine/sfx.js';
import { updateCam, beginWorld, endWorld } from './cam.js';
import { drawSky, drawHills } from './bg.js';
import { updateFx, drawFx, clearFx, sparkle } from './fx.js';
import { updateMusic, music, toggleMute, rescueChord, rescueNoteSmall, winFanfare, eraseNote } from './music.js';
import { P, resetPlayer, updatePlayer, tailPos, drawPlayer } from './player.js';
import { resetTrail, pushTrail, updateTrail, tryCloseLoop, addFlash, inPoly, drawTrail } from './trail.js';
import { clouds, resetClouds, updateClouds, popCloud, drawClouds } from './clouds.js';

let t = 0;
/** @type {'play' | 'over'} */
let state = 'play';
let score = 0;
let best = /** @type {number} */ (load('best', 0));
let hearts = 3;
let elapsed = 0;
let shake = 0;
let started = false; // 첫 조작 전 온보딩 표시
let loops = 0;       // 닫은 고리 수 (통계/테스트)

/** 점수 팝업 @type {{x:number, y:number, txt:string, t0:number}[]} */
let pops = [];

const reset = () => {
  resetPlayer();
  resetTrail();
  resetClouds();
  clearFx();
  score = 0;
  hearts = 3;
  elapsed = 0;
  shake = 0;
  pops = [];
  state = 'play';
};

/** 현재 조작 입력 -1/0/1 */
const steer = () => {
  let turn = 0;
  if (keys.has('ArrowLeft') || keys.has('KeyA')) turn -= 1;
  if (keys.has('ArrowRight') || keys.has('KeyD')) turn += 1;
  if (!turn && ptr.down) turn = ptr.x < W / 2 ? -1 : 1;
  return turn;
};

/** @param {number} dt */
export const update = dt => {
  t += dt;
  updateCam();
  updateMusic();
  if (keysJust.has('KeyM')) toggleMute();
  if (shake > 0) shake -= dt;

  if (state === 'over') {
    updateFx(dt);
    if (ptr.justDown || keysJust.has('KeyR') || keysJust.has('Space')) reset();
    return;
  }

  elapsed += dt;
  const turn = steer();
  if (turn) started = true;
  updatePlayer(turn, dt);

  const tp = tailPos();
  pushTrail(tp.x, tp.y, t);
  updateTrail(t);

  // 고리 닫힘 판정 — 이번 프레임 새 세그먼트 기준
  const poly = tryCloseLoop();
  if (poly) {
    loops++;
    const caught = clouds.filter(c => inPoly(c.x, c.y, poly));
    addFlash(poly, t, caught.length);
    if (caught.length) {
      for (const c of caught) popCloud(c);
      const pts = 10 * caught.length * caught.length; // 다중 포획 제곱 보너스
      score += pts;
      shake = Math.min(0.4, 0.1 + caught.length * 0.08);
      caught.length > 1 ? winFanfare() : rescueChord();
      // 폴리곤 중심에 점수 팝업
      let cx = 0, cy = 0;
      for (const [x, y] of poly) { cx += x; cy += y; }
      pops.push({ x: cx / poly.length, y: cy / poly.length, txt: caught.length > 1 ? `+${pts}  x${caught.length}!` : `+${pts}`, t0: t });
    } else {
      rescueNoteSmall(); // 빈 고리도 소리·플래시로 응답 — 다음엔 감싸고 싶어진다
    }
  }

  updateClouds(dt, t, elapsed);

  // 피격 판정
  if (P.inv <= 0) {
    for (const c of clouds) {
      if (Math.hypot(c.x - P.x, c.y - P.y) < c.r * 0.9 + 11) {
        popCloud(c); // 부딪힌 구름은 소멸 (점수 없음)
        hearts--;
        P.inv = 1.5;
        shake = 0.6;
        S.pop();
        eraseNote();
        if (hearts <= 0) {
          state = 'over';
          best = Math.max(best, score);
          save('best', best);
        }
        break;
      }
    }
  }

  music.intensity = Math.min(1, clouds.length / 9 + elapsed * 0.004);
  pops = pops.filter(p => t - p.t0 < 0.9);
  updateFx(dt);
};

// ── 렌더 ───────────────────────────────────────────────────────────────────

export const draw = () => {
  updateCam();
  beginWorld();
  if (shake > 0) ctx.translate((Math.random() - 0.5) * shake * 16, (Math.random() - 0.5) * shake * 16);
  drawSky(t);
  drawHills();
  drawTrail(t);
  drawClouds(t);
  drawPlayer(t);
  drawFx();
  // 점수 팝업 (월드 좌표)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const p of pops) {
    const age = (t - p.t0) / 0.9;
    ctx.globalAlpha = 1 - age;
    ctx.font = '800 22px system-ui, sans-serif';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(40,25,70,.7)';
    ctx.lineWidth = 4;
    ctx.strokeText(p.txt, p.x, p.y - age * 30);
    ctx.fillStyle = `hsl(${50 + age * 100} 100% 70%)`;
    ctx.fillText(p.txt, p.x, p.y - age * 30);
    ctx.globalAlpha = 1;
  }
  endWorld();
  drawHud();
  if (state === 'over') drawOver();
  else if (!started) drawHint();
};

const drawHud = () => {
  ctx.textBaseline = 'middle';
  // 점수 (상단 중앙)
  ctx.textAlign = 'center';
  ctx.font = `800 ${Math.max(20, H * 0.06)}px system-ui, sans-serif`;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(40,25,70,.55)';
  ctx.lineWidth = 5;
  ctx.strokeText(String(score), W / 2, 34);
  ctx.fillStyle = '#fff';
  ctx.fillText(String(score), W / 2, 34);
  // 최고 기록
  ctx.textAlign = 'right';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(93,74,145,.8)';
  ctx.fillText(`BEST ${best}`, W - 14, 22);
  // 하트
  for (let i = 0; i < 3; i++) heart(22 + i * 26, 24, i < hearts);
};

/** @param {number} x @param {number} y @param {boolean} lit */
const heart = (x, y, lit) => {
  ctx.fillStyle = lit ? '#ff6b81' : 'rgba(93,74,145,.25)';
  ctx.beginPath();
  ctx.moveTo(x, y + 7);
  ctx.bezierCurveTo(x - 11, y - 2, x - 5, y - 9, x, y - 3);
  ctx.bezierCurveTo(x + 5, y - 9, x + 11, y - 2, x, y + 7);
  ctx.fill();
};

const drawHint = () => {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = 0.7 + 0.3 * Math.sin(t * 3);
  ctx.fillStyle = '#5d4a91';
  ctx.font = `700 ${Math.max(14, H * 0.032)}px system-ui, sans-serif`;
  ctx.fillText('◀ hold left · hold right ▶', W / 2, H * 0.8);
  ctx.font = `500 ${Math.max(12, H * 0.026)}px system-ui, sans-serif`;
  ctx.fillText('Close a rainbow loop around the gloom!', W / 2, H * 0.8 + H * 0.05);
  ctx.globalAlpha = 1;
};

const drawOver = () => {
  ctx.fillStyle = 'rgba(255,255,255,.55)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#5d4a91';
  ctx.font = `800 ${Math.max(24, H * 0.07)}px system-ui, sans-serif`;
  ctx.fillText('The gloom got you!', W / 2, H * 0.34);
  ctx.font = `800 ${Math.max(20, H * 0.055)}px system-ui, sans-serif`;
  ctx.fillText(`SCORE ${score}`, W / 2, H * 0.46);
  ctx.font = `600 ${Math.max(13, H * 0.03)}px system-ui, sans-serif`;
  ctx.fillStyle = '#8a76b8';
  ctx.fillText(score >= best && score > 0 ? 'NEW BEST!' : `best ${best}`, W / 2, H * 0.54);
  ctx.globalAlpha = 0.65 + 0.35 * Math.sin(t * 3);
  ctx.fillStyle = '#5d4a91';
  ctx.font = `700 ${Math.max(14, H * 0.032)}px system-ui, sans-serif`;
  ctx.fillText('tap or R to fly again', W / 2, H * 0.68);
  ctx.globalAlpha = 1;
};

// 스파이크 시작 시 살짝 흩어지는 반짝이
sparkle(480, 240, 10, 100);

// 테스트 훅 (포획 판정 검증용 addCloud 포함 — 제출 빌드 전 제거)
/** @type {any} */ (globalThis).loopdbg = () => ({
  state, score, hearts, loops, clouds: clouds.length,
  px: P.x | 0, py: P.y | 0, pa: P.a,
});
/** @type {any} */ (globalThis).loopAddCloud = (/** @type {number} */ x, /** @type {number} */ y) =>
  clouds.push({ x, y, vx: 0, vy: 0, r: 24, seed: 1, born: 0 });
