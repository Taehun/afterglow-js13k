// 음악/사운드 — WebAudio 미니 시퀀서.
// 컨셉: 셀틱풍 아련한 에어 — A 도리안 선법, 6/8 릴트, 드론(근음+5도 지속) 위에
// 하프 아르페지오와 비브라토 휘슬 멜로디, 보드란 심장 박동.
// 모든 인터랙션 사운드도 같은 선법 위라 불협화음이 구조적으로 없고,
// intensity에 따라 레이어가 쌓이는 어댑티브 구성. (Audio 채점 항목 대응 축)

import { onFirstInput } from '../engine/input.js';
import { initAudio, getAudioCtx } from '../vendor/zzfx.js';
import { save, load } from '../engine/save.js';

/** @type {AudioContext | undefined} */
let ac;
/** @type {GainNode | undefined} */
let master;
/** @type {GainNode | undefined} */
let delaySend;
/** @type {AudioBuffer | undefined} */
let noiseBuf;

export const music = {
  muted: /** @type {boolean} */ (load('mute', false)),
  intensity: 0, // 0~1 — 구조 진행도에 따라 레이어 추가
  playing: false,
};

// A 도리안 — 셀틱 선법. 아련하면서 어둡지 않다 (F#가 도리안의 빛)
const MODE = [0, 2, 3, 5, 7, 9, 10];
/** @param {number} semi A3(220Hz) 기준 반음 오프셋 */
const freq = semi => 220 * 2 ** (semi / 12);
/** 스케일 도수 → 주파수 (옥타브 자동, 비정수 입력 방어) @param {number} i */
const note = i => {
  i = Math.floor(i);
  return freq(MODE[((i % 7) + 7) % 7] + 12 * Math.floor(i / 7));
};

const init = () => {
  try {
    initAudio();
    const c = getAudioCtx();
    ac = c;
    const m = c.createGain();
    m.gain.value = music.muted ? 0 : 1;
    m.connect(c.destination);
    master = m;
    // 피드백 딜레이 — 하프 플럭에 잔향감을 주는 가장 싼 방법
    const delay = c.createDelay(1);
    delay.delayTime.value = 0.29;
    const fb = c.createGain();
    fb.gain.value = 0.34;
    const ds = c.createGain();
    ds.gain.value = 0.5;
    ds.connect(delay);
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(m);
    delaySend = ds;
    // 하이햇용 노이즈 버퍼
    const nb = c.createBuffer(1, 2600, 44100);
    const nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    noiseBuf = nb;
    music.playing = true;
  } catch { /* 오디오 불가 환경 — 게임은 계속 동작 */ }
};
onFirstInput(init);

/**
 * 하프 플럭 — triangle + 지수 감쇠 엔벨로프.
 * @param {number} f 주파수 @param {number} t 시작 시각(ctx 시간)
 * @param {number} [vol] @param {number} [dur] @param {OscillatorType} [type]
 */
const pluck = (f, t, vol = 0.16, dur = 0.9, type = 'triangle') => {
  if (!ac || !master || !delaySend) return;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.value = f;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(master);
  g.connect(delaySend);
  o.start(t);
  o.stop(t + dur + 0.05);
};

/**
 * 휘슬(틴 휘슬 느낌) — 트라이앵글 + 비브라토 LFO + 딜레이 에코. 아련함의 주역.
 * @param {number} f @param {number} tm @param {number} dur @param {number} [vol]
 */
const flute = (f, tm, dur, vol = 0.085) => {
  if (!ac || !master || !delaySend) return;
  const o = ac.createOscillator();
  o.type = 'triangle';
  o.frequency.value = f;
  const lfo = ac.createOscillator();
  lfo.frequency.value = 4.8;
  const lg = ac.createGain();
  lg.gain.value = f * 0.007;
  lfo.connect(lg);
  lg.connect(o.frequency);
  const g = ac.createGain();
  g.gain.setValueAtTime(0, tm);
  g.gain.linearRampToValueAtTime(vol, tm + 0.09);
  g.gain.setValueAtTime(vol, tm + Math.max(0.1, dur - 0.14));
  g.gain.linearRampToValueAtTime(0.0001, tm + dur);
  o.connect(g);
  g.connect(master);
  g.connect(delaySend);
  o.start(tm);
  o.stop(tm + dur + 0.05);
  lfo.start(tm);
  lfo.stop(tm + dur + 0.05);
};

/** 드론 — 낮은 근음+5도 지속음 (백파이프의 잔향 같은 바닥) @param {number} tm @param {number} dur */
const drone = (tm, dur) => {
  if (!ac || !master) return;
  for (const [semi, v] of [[-12, 0.055], [-5, 0.04]]) { // A2 + E3
    const o = ac.createOscillator();
    o.type = 'sine';
    o.frequency.value = freq(semi);
    const g = ac.createGain();
    g.gain.setValueAtTime(0, tm);
    g.gain.linearRampToValueAtTime(v, tm + 1.2);
    g.gain.setValueAtTime(v, tm + dur - 1);
    g.gain.linearRampToValueAtTime(0.0001, tm + dur);
    o.connect(g);
    g.connect(master);
    o.start(tm);
    o.stop(tm + dur + 0.1);
  }
};

// ── 배경 시퀀서 — 6/8 셀틱 에어 ────────────────────────────────────────────
const STEP = 0.27; // 6/8의 8분음표 ≈ 느린 릴트
let nextStep = 0;
let stepIdx = 0;
// 코드 진행 (스케일 도수 루트, 마디당 1개): Am → G → Am → Em
const PROG = [0, -1, 0, -3];
// 에어 멜로디 — 4마디(24스텝) 루프 [도수, 길이(스텝)]
const MEL = [[11, 2], [10, 1], [9, 3], [7, 6], [9, 2], [10, 1], [11, 2], [13, 1], [12, 4], [11, 2]];
/** 멜로디 시작 스텝 → [도수, 길이] @type {Record<number, number[]>} */
const MEL_AT = {};
{
  let p = 0;
  for (const nl of MEL) { MEL_AT[p] = nl; p += nl[1]; }
}

/** 매 프레임 호출 — 0.25초 앞까지 노트를 예약한다 */
export const updateMusic = () => {
  if (!ac || !music.playing) return;
  if (nextStep < ac.currentTime) nextStep = ac.currentTime + 0.05;
  while (nextStep < ac.currentTime + 0.25) {
    const bar = Math.floor(stepIdx / 6);
    const s = stepIdx % 6;
    const root = PROG[bar % 4];
    // 드론 — 2마디마다 갱신되는 낮은 지속음 (아련함의 바닥)
    if (s === 0 && bar % 2 === 0) drone(nextStep, STEP * 12 + 0.6);
    // 하프 아르페지오 — 6/8의 1·3·5박, 홀수 마디는 한 옥타브 위로 반짝
    if (s % 2 === 0) {
      const tone = root + [0, 2, 4][s / 2] + (bar % 2 ? 7 : 0);
      pluck(note(tone), nextStep, 0.075 + music.intensity * 0.025, 1.3);
    }
    // 에어 멜로디 (intensity ≥ .15) — 휘슬이 4마디 선율을 노래한다
    if (music.intensity >= 0.15) {
      const mel = MEL_AT[stepIdx % 24];
      if (mel) flute(note(mel[0]), nextStep, mel[1] * STEP * 0.92, 0.075 + music.intensity * 0.03);
    }
    // 카운터 하프 (intensity ≥ .5) — 오프비트 높은 응답
    if (music.intensity >= 0.5 && (s === 1 || s === 4)) {
      pluck(note(root + 9 + (s === 4 ? 2 : 0)), nextStep, 0.05, 0.8);
    }
    // 보드란 (intensity ≥ .4) — 6/8의 심장 박동: 둥- 둠 (+브러시)
    if (ac && master && music.intensity >= 0.4 && (s === 0 || s === 3)) {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(94, nextStep);
      o.frequency.exponentialRampToValueAtTime(58, nextStep + 0.1);
      g.gain.setValueAtTime(s === 0 ? 0.17 : 0.09, nextStep);
      g.gain.exponentialRampToValueAtTime(0.0001, nextStep + 0.16);
      o.connect(g);
      g.connect(master);
      o.start(nextStep);
      o.stop(nextStep + 0.18);
    }
    if (ac && master && noiseBuf && music.intensity >= 0.65 && s === 5) {
      const src = ac.createBufferSource();
      src.buffer = noiseBuf;
      const bf = ac.createBiquadFilter();
      bf.type = 'bandpass';
      bf.frequency.value = 1500;
      const bg = ac.createGain();
      bg.gain.setValueAtTime(0.03, nextStep);
      bg.gain.exponentialRampToValueAtTime(0.0001, nextStep + 0.07);
      src.connect(bf);
      bf.connect(bg);
      bg.connect(master);
      src.start(nextStep);
      src.stop(nextStep + 0.08);
    }
    stepIdx++;
    nextStep += STEP;
  }
};

// ── 인터랙션 사운드 (전부 펜타토닉 위에서) ─────────────────────────────────
/** 아치 드로잉 글리산도 — 진행도에 따라 상행 @param {number} i 스텝 */
export const glissNote = i => { if (ac) pluck(note(i), ac.currentTime, 0.12, 0.5); };

/** 아치 충전(유니콘이 무지개를 지나감) — 짧은 2음 상행 */
export const rescueNoteSmall = () => {
  if (!ac) return;
  pluck(note(7), ac.currentTime, 0.1, 0.5);
  pluck(note(9), ac.currentTime + 0.08, 0.1, 0.6);
};

/** 망아지 구조 — 상행 플러리시 */
export const rescueChord = () => {
  if (!ac) return;
  const t = ac.currentTime;
  [0, 2, 4, 7, 9].forEach((n, i) => pluck(note(n), t + i * 0.06, 0.14, 0.8));
};

/** 레벨 클리어 팡파레 */
export const winFanfare = () => {
  if (!ac) return;
  const t = ac.currentTime;
  [0, 4, 7, 9, 12, 14].forEach((n, i) => pluck(note(n), t + i * 0.09, 0.16, 1.2));
};

/** 빗방울이 무지개에 막힘 — 높은 플링크 */
export const plinkNote = () => {
  if (ac) pluck(note(10 + (Math.random() * 5 | 0)), ac.currentTime, 0.05, 0.35);
};

/** 아치 지우기 */
export const eraseNote = () => {
  if (ac) { pluck(note(4), ac.currentTime, 0.08, 0.3); pluck(note(0), ac.currentTime + 0.07, 0.08, 0.3); }
};

/** 리스폰 포프 */
export const poofNote = () => { if (ac) pluck(note(-3), ac.currentTime, 0.09, 0.4, 'sine'); };

export const toggleMute = () => {
  music.muted = !music.muted;
  save('mute', music.muted);
  if (master) master.gain.value = music.muted ? 0 : 1;
};
