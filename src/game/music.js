// 음악/사운드 — WebAudio 미니 시퀀서.
// 컨셉: 젠틀 셀틱 판타지 — ElevenLabs 레퍼런스 트랙(D장조, 68bpm, D 페달+V 터치)을
// 분석·이식한 컨투어. 
// 끊김 없이 잔물결치는 하프 아르페지오가 주역, 코드를 따라가는 지속 패드,
// 쉼 많은 롱톤 휘슬 에어, 깊은 딜레이 잔향. 타악기 없음(레퍼런스 준수) —
// 고조는 하프 벨로시티와 한 옥타브 위 '에코 하프'가 만든다.
// 모든 인터랙션 사운드도 같은 조성이라 불협화음이 구조적으로 없다.

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

// D 장조 — 따뜻하고 몽환적인 셀틱 판타지의 기본색
const MODE = [0, 2, 4, 5, 7, 9, 11];
/** @param {number} semi D3(146.83Hz) 기준 반음 오프셋 */
const freq = semi => 146.83 * 2 ** (semi / 12);
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
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 4200; // 모서리를 둥글려 꿈결처럼
    m.connect(lp);
    lp.connect(c.destination);
    master = m;
    // 피드백 딜레이 — 하프 플럭에 잔향감을 주는 가장 싼 방법
    const delay = c.createDelay(1);
    delay.delayTime.value = 0.39;
    const fb = c.createGain();
    fb.gain.value = 0.47;
    const ds = c.createGain();
    ds.gain.value = 0.62;
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
 * 판타지 하프 플럭 — 살짝 디튠된 기본음 2개(반짝임) + 2·3배음이 각자 다른
 * 속도로 사그라드는 4보이스. 어택은 짧게(현을 뜯는 순간), 잔향은 길게.
 * type이 'sine'이면 단일 보이스(저음/효과음용).
 * @param {number} f 주파수 @param {number} t 시작 시각(ctx 시간)
 * @param {number} [vol] @param {number} [dur] @param {OscillatorType} [type]
 */
const pluck = (f, t, vol = 0.16, dur = 0.9, type = 'triangle') => {
  if (!ac || !master || !delaySend) return;
  const voices = type === 'triangle'
    ? [[f, vol, dur, 'triangle'], [f * 1.004, vol * 0.5, dur * 0.9, 'triangle'],
       [f * 2, vol * 0.28, dur * 0.5, 'sine'], [f * 3.01, vol * 0.09, dur * 0.28, 'sine']]
    : [[f, vol, dur, type]];
  for (const [vf, vv, vd, vt] of voices) {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = /** @type {OscillatorType} */ (vt);
    o.frequency.value = /** @type {number} */ (vf);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(/** @type {number} */ (vv), t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + /** @type {number} */ (vd));
    o.connect(g);
    g.connect(master);
    g.connect(delaySend);
    o.start(t);
    o.stop(t + /** @type {number} */ (vd) + 0.05);
  }
};

/**
 * 휘슬(틴 휘슬 느낌) — 트라이앵글 + 비브라토 LFO + 딜레이 에코. 아련함의 주역.
 * @param {number} f @param {number} tm @param {number} dur @param {number} [vol]
 */
const flute = (f, tm, dur, vol = 0.11) => {
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
  g.gain.linearRampToValueAtTime(vol, tm + 0.14);
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

/** 코드 패드 — 진행을 따라가는 근음+5도 지속음 (부드러운 바닥)
 * @param {number} tm @param {number} root @param {number} dur */
const pad = (tm, root, dur) => {
  if (!ac || !master) return;
  for (const [deg, v] of [[root, 0.05], [root + 4, 0.035], [root + 7, 0.02]]) {
    const o = ac.createOscillator();
    o.type = 'sine';
    o.frequency.value = note(deg);
    const g = ac.createGain();
    g.gain.setValueAtTime(0, tm);
    g.gain.linearRampToValueAtTime(v, tm + 0.9);
    g.gain.setValueAtTime(v, tm + dur - 0.8);
    g.gain.linearRampToValueAtTime(0.0001, tm + dur);
    o.connect(g);
    g.connect(master);
    o.start(tm);
    o.stop(tm + dur + 0.1);
  }
};

// ── 배경 시퀀서 — 잔물결 하프 (마디 = 8스텝) ──────────────────────────────
const STEP = 0.2205; // 68bpm 16분음표 — 레퍼런스 실측
let nextStep = 0;
let stepIdx = 0;
// 코드 진행 (8마디 형식): D 페달 위에 IV의 온기와 V-I 종지 — 루프에 기승전결
const PROG = [0, 0, 4, 0, 3, 0, 4, 4];
// 하프 잔물결 2패턴 교대 — 9도 색채 상행/하행 + 쉼표(-1)로 숨 쉬는 패턴
const ARPS = [
  [0, 2, 4, 7, 9, 7, 4, 2],
  [0, 4, 7, -1, 9, -1, 7, 4],
];
// 휘슬 에어 — ElevenLabs 레퍼런스에서 추출·양자화한 8마디(64스텝) 컨투어:
// A절 = A4(5도)에 머물며 E5를 스치고, B절 = D5로 해소하며 A5 정점 후 롱톤 마무리
const MEL = [
  [11, 6], [-1, 2],
  [11, 2], [15, 3], [11, 3],
  [11, 4], [9, 2], [11, 2],
  [-1, 2], [11, 6],
  [14, 4], [14, 2], [15, 2],
  [18, 4], [15, 2], [14, 2],
  [14, 6], [11, 2],
  [14, 8],
];
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
    const bar = Math.floor(stepIdx / 8);
    const s = stepIdx % 8;
    const root = PROG[bar % 8];
    // 코드 패드 — 마디마다 진행을 따라간다
    if (s === 0) pad(nextStep, root, STEP * 8 + 0.5);
    // 피아노풍 저음 — 마디 첫 박 (intensity ≥ .35)
    if (s === 0 && music.intensity >= 0.35) {
      pluck(note(root), nextStep, 0.11, 2, 'sine');
    }
    // 하프 잔물결 — 마디마다 패턴 교대, 쉼표는 쉼표대로, 타이밍·세기 휴머나이즈
    const ap = ARPS[bar % 2][s];
    let tone = root + 7;
    if (ap >= 0) {
      tone = root + 7 + ap;
      pluck(
        note(tone),
        nextStep + (Math.random() - 0.5) * 0.02,
        ((s === 0 ? 0.08 : 0.05) + music.intensity * 0.02) * (0.85 + Math.random() * 0.3),
        2.2,
      );
    }
    // 에코 하프 (intensity ≥ .55) — 한 스텝 뒤 한 옥타브 위에서 되울린다
    if (ap >= 0 && music.intensity >= 0.55) {
      pluck(note(tone + 7), nextStep + STEP * 0.5, 0.028, 1.6);
    }
    // 휘슬 에어 — 처음부터 노래한다 (이 곡의 얼굴), 고조되면 커진다
    {
      const mel = MEL_AT[stepIdx % 64];
      if (mel && mel[0] >= 0) flute(note(mel[0]), nextStep, mel[1] * STEP * 0.94, 0.085 + music.intensity * 0.045);
    }
    stepIdx++;
    nextStep += STEP;
  }
};

// ── 인터랙션 사운드 (전부 같은 조성 위에서) ────────────────────────────────
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
