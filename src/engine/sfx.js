// 사운드 — ZzFX 래퍼.
// 브라우저 자동재생 정책 때문에 AudioContext는 첫 사용자 입력 때 생성/재개한다.
// (규칙: 콘솔 에러 0 — 정책 위반 경고도 남기지 않는 것이 목표)

import { zzfx, initAudio } from '../vendor/zzfx.js';
import { onFirstInput } from './input.js';

onFirstInput(() => { try { initAudio(); } catch { /* 오디오 미지원 환경 */ } });

/** 안전 재생 래퍼 — 오디오 불가 환경에서도 게임이 죽지 않게 한다 @param {number[]} p */
export const sfx = (...p) => { try { zzfx(...p); } catch { /* no-op */ } };

// 프리셋 사운드 — https://killedbyapixel.github.io/ZzFX/ 에서 디자인해서 교체할 것
export const S = {
  pop: () => sfx(1, .05, 925, .04, .3, .6, 1, .3, 0, 6.27, -184, .09, .17),
  // 폭탄 — 노이즈 파형의 묵직한 폭발 + 낮은 여운
  boom: () => sfx(1.7, .05, 333, .01, 0, .9, 4, 1.9, 0, 0, 0, 0, 0, .5, 0, .6, .1, .5, .05),
};
