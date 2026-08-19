// 음악/사운드 — WebAudio 미니 시퀀서.
// 컨셉: 몽환적·중독성 셀틱 판타지 — ElevenLabs 레퍼런스(D장조, 6/8 릴트 99bpm,
// D 페달 + vi 그늘)를 분석·이식. 하프 오스티나토가 6/8 주문처럼 돌고,
// 그 위로 "D5 D5 A4 D5" 귀벌레 휘슬 훅이 노래한다. 딜레이 에코는 정확히
// 한 맥박 뒤에 떨어져 그루브와 몽환을 동시에 만든다. 타악기 없음.
// 모든 인터랙션 사운드도 같은 조성이라 불협화음이 구조적으로 없다.

import { onFirstInput } from '../engine/input.js';
import { initAudio, getAudioCtx, setZzfxVolume } from '../vendor/zzfx.js';
import { save, load } from '../engine/save.js';

/** @type {AudioContext | undefined} */
let ac;
/** @type {GainNode | undefined} */
let master;
/** @type {GainNode | undefined} */
let delaySend;
/** @type {GainNode | undefined} */
let fxm; // 효과음 버스 — 로우패스/딜레이를 우회해 배경 위로 또렷하게 선다

export const music = {
  volume: /** @type {number} */ (load('vol', 1)), // 0~1, 0 = 음소거
  intensity: 0, // 0~1 — 구조 진행도에 따라 레이어 추가
  playing: false,
};

// D 장조 — D 페달이 만드는 최면적 부유감의 조성
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
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 3400; // 모서리를 둥글려 꿈결처럼
    m.connect(lp);
    lp.connect(c.destination);
    master = m;
    // 피드백 딜레이 — 하프 플럭에 잔향감을 주는 가장 싼 방법
    const delay = c.createDelay(1);
    delay.delayTime.value = 0.606; // 한 맥박(부점4분) 뒤 — 에코가 그루브를 강화
    const fb = c.createGain();
    fb.gain.value = 0.53;
    const ds = c.createGain();
    ds.gain.value = 0.68;
    ds.connect(delay);
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(m);
    delaySend = ds;
    const fx = c.createGain();
    fx.connect(c.destination);
    fxm = fx;
    setVolume(music.volume); // 저장된 볼륨을 마스터·효과음·zzfx에 일괄 적용
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
 * @param {number} [dry] 참이면 효과음 버스로 — 로우패스/딜레이 우회 (또렷하게)
 */
const pluck = (f, t, vol = 0.16, dur = 0.9, type = 'triangle', dry = 0) => {
  if (!ac || !master || !delaySend) return;
  t = Math.max(t, ac.currentTime); // 음수/과거 시각 방어 — 콘솔 에러 0
  const voices = type === 'triangle'
    ? [[f, vol, dur, 'triangle'], [f * 1.006, vol * 0.5, dur * 0.9, 'triangle'],
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
    g.connect((dry && fxm) || master);
    if (!dry) g.connect(delaySend);
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
  lfo.frequency.value = 4;
  const lg = ac.createGain();
  lg.gain.value = f * 0.009;
  lfo.connect(lg);
  lg.connect(o.frequency);
  const g = ac.createGain();
  g.gain.setValueAtTime(0, tm);
  g.gain.linearRampToValueAtTime(vol, tm + Math.min(0.16, dur * 0.3)); // 짧은 음도 안 뭉개지게
  g.gain.setValueAtTime(vol, tm + Math.max(0.1, dur - 0.26));
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
  for (const [deg, v] of [[root, 0.065], [root + 4, 0.05], [root + 7, 0.03]]) {
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

// ── 배경 시퀀서 — 6/8 릴트 (마디 = 6스텝, 맥박은 0·3스텝) ─────────────────
const STEP = 0.202; // 8분음표 — 부점4분 맥박 기준 99bpm (레퍼런스 실측)
let nextStep = 0;
let stepIdx = 0;
// 코드 진행 (8마디): D 페달의 최면 — 5·6마디만 vi(Bm)로 살짝 그늘이 진다
const PROG = [0, 0, 0, 0, 5, 5, 0, 0];
// 하프 오스티나토 — 마디마다 도는 6스텝 주문: 근음→3도→5도→옥타브→5도→3도
const OST = [0, 2, 4, 7, 4, 2];
// 휘슬 훅 — 8마디(48스텝) 귀벌레 컨투어: "D5 D5 A4 D5" 리프가 세 번 돌아오고
// (두 번째는 E5로 들어올린다), B절은 Bm 위의 B4-C#5 턴, 끝은 D6 반짝임→해소
const MEL = [
  [14, 1], [14, 1], [11, 2], [14, 2],
  [14, 4], [-1, 2],
  [14, 1], [14, 1], [11, 2], [12, 2],
  [15, 4], [-1, 2],
  [12, 1], [13, 1], [12, 2], [11, 2],
  [12, 2], [11, 2], [9, 2],
  [14, 1], [14, 1], [11, 2], [14, 2],
  [21, 2], [18, 2], [14, 2],
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
    const bar = Math.floor(stepIdx / 6);
    const s = stepIdx % 6;
    const root = PROG[bar % 8];
    // 코드 패드 — 마디마다 진행을 따라간다
    if (s === 0) pad(nextStep, root, STEP * 6 + 0.5);
    // 피아노풍 저음 — 마디 첫 박 (intensity ≥ .35)
    if (s === 0 && music.intensity >= 0.35) {
      pluck(note(root), nextStep, 0.11, 2, 'sine');
    }
    // 하프 오스티나토 — 6/8 릴트로 도는 주문. 맥박(0·3스텝)에 강세
    pluck(
      note(root + 7 + OST[s]),
      nextStep + (Math.random() - 0.5) * 0.015,
      ((s % 3 ? 0.032 : 0.06) + music.intensity * 0.018) * (0.9 + Math.random() * 0.2),
      2.6,
    );
    // 에코 오스티나토 (intensity ≥ .3) — 맥박만 한 옥타브 위에서 반짝인다
    if (!(s % 3) && music.intensity >= 0.3) {
      pluck(note(root + 14 + OST[s]), nextStep + STEP * 1.5, 0.02, 2);
    }
    // 휘슬 훅 — 처음부터 노래한다 (이 곡의 얼굴), 고조되면 커진다
    {
      const mel = MEL_AT[stepIdx % 48];
      if (mel && mel[0] >= 0) flute(note(mel[0]), nextStep, mel[1] * STEP * 0.94, 0.085 + music.intensity * 0.045);
    }
    stepIdx++;
    nextStep += STEP;
  }
};

// ── 인터랙션 사운드 (전부 같은 조성 위에서, 드라이 버스로 또렷하게) ─────────
/** 드라이 버스 플럭 — 인터랙션 전용 숏핸드
 * @param {number} i 스케일 도수 @param {number} v 볼륨 @param {number} d 길이
 * @param {number} [off] 시작 오프셋 @param {OscillatorType} [ty] */
const fxp = (i, v, d, off = 0, ty = 'triangle') => {
  if (ac) pluck(note(i), ac.currentTime + off, v, d, ty, 1);
};

/** 아치 드로잉 글리산도 — 진행도에 따라 상행 @param {number} i 스텝 */
export const glissNote = i => fxp(i, 0.15, 0.5);

/** 아치 충전(유니콘이 무지개를 지나감) — 짧은 2음 상행 */
export const rescueNoteSmall = () => {
  fxp(7, 0.1, 0.5);
  fxp(9, 0.1, 0.6, 0.08);
};

/** 망아지 구조 — 상행 플러리시 */
export const rescueChord = () => {
  [0, 2, 4, 7, 9].forEach((n, i) => fxp(n, 0.15, 0.8, i * 0.06));
};

/** 레벨 클리어 팡파레 */
export const winFanfare = () => {
  [0, 4, 7, 9, 12, 14].forEach((n, i) => fxp(n, 0.17, 1.2, i * 0.09));
};

/** 빗방울이 무지개에 막힘 — 높은 플링크 */
export const plinkNote = () => fxp(10 + (Math.random() * 5 | 0), 0.07, 0.35);

/** 아치 지우기 */
export const eraseNote = () => { fxp(4, 0.09, 0.3); fxp(0, 0.09, 0.3, 0.07); };

/** 리스폰 포프 */
export const poofNote = () => fxp(-3, 0.1, 0.4, 0, 'sine');

let lastVol = 1; // 음소거 해제 시 복원할 볼륨

/** 볼륨 설정 (0~1, 0 = 음소거) — 음악·인터랙션·zzfx 효과음 전부에 적용 @param {number} v */
export const setVolume = v => {
  music.volume = v;
  if (v) lastVol = v; // 드래그로 0을 만들어도 마지막 볼륨으로 복원되게
  save('vol', v);
  const g = v * v; // 지각 보정 커브
  if (master) master.gain.value = g;
  if (fxm) fxm.gain.value = g;
  setZzfxVolume(g);
};

export const toggleMute = () => setVolume(music.volume ? 0 : lastVol);
