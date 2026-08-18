// 음악/사운드 — WebAudio 미니 시퀀서.
// 컨셉: 무지개를 그리는 행위가 곧 하프 연주. 배경 음악은 펜타토닉이라
// 어떤 인터랙션 사운드와도 불협화음이 나지 않고(설계로 보장),
// 구조한 망아지 수에 따라 레이어가 쌓이는 어댑티브 구성.
// (Audio 채점 항목 대응 축)

import { onFirstInput } from '../engine/input.js';
import { initAudio, getAudioCtx } from '../vendor/zzfx.js';
import { save, load } from '../engine/save.js';

/** @type {AudioContext | undefined} */
let ac;
/** @type {GainNode | undefined} */
let master;
/** @type {GainNode | undefined} */
let delaySend;

export const music = {
  muted: /** @type {boolean} */ (load('mute', false)),
  intensity: 0, // 0~1 — 구조 진행도에 따라 레이어 추가
  playing: false,
};

// C 메이저 펜타토닉 (C4 기준 반음 오프셋)
const PENTA = [0, 2, 4, 7, 9];
/** @param {number} semi */
const freq = semi => 261.63 * 2 ** (semi / 12);
/** 스케일 인덱스 → 주파수 (옥타브 자동) @param {number} i */
const note = i => freq(PENTA[((i % 5) + 5) % 5] + 12 * Math.floor(i / 5));

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

// ── 배경 시퀀서 ────────────────────────────────────────────────────────────
const STEP = 0.24; // 8분음표 ≈ 125bpm
let nextStep = 0;
let stepIdx = 0;
// 코드 진행: C → Am → F → G (펜타토닉 인덱스 기준 루트)
const PROG = [0, -2, 3, 4];

/** 매 프레임 호출 — 0.25초 앞까지 노트를 예약한다 */
export const updateMusic = () => {
  if (!ac || !music.playing) return;
  if (nextStep < ac.currentTime) nextStep = ac.currentTime + 0.05;
  while (nextStep < ac.currentTime + 0.25) {
    const bar = Math.floor(stepIdx / 8) % 4;
    const s = stepIdx % 8;
    const root = PROG[bar];
    // 레이어 1 (항상): 잔잔한 아르페지오
    const arpPat = [0, 2, 4, 2, 5, 4, 2, 4];
    if (s % 2 === 0 || music.intensity > 0.3) {
      pluck(note(root + arpPat[s]), nextStep, 0.09 + music.intensity * 0.03, 1.1);
    }
    // 레이어 2 (intensity ≥ .34): 한 옥타브 위 카운터 멜로디
    if (music.intensity >= 0.34 && (s === 1 || s === 5)) {
      pluck(note(root + 7 + (s === 5 ? 2 : 0)), nextStep, 0.07, 0.7);
    }
    // 레이어 3 (intensity ≥ .67): 베이스
    if (music.intensity >= 0.67 && s === 0) {
      pluck(note(root - 5) / 2, nextStep, 0.12, 1.6, 'sine');
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
