// 세이브 — 네임스페이스 강제 localStorage 래퍼.
//
// [규칙 7 "Be neighbourly" — 위반 시 다른 참가자 게임을 망가뜨린다]
// js13kgames.com에서는 모든 출품작이 same-origin을 공유한다. 따라서:
//   - 모든 키는 반드시 NS 프리픽스를 붙인다 (이 모듈 밖에서 localStorage 직접 접근 금지)
//   - localStorage.clear() 절대 금지 (다른 게임의 세이브가 전부 날아간다)
//   - sessionStorage / IndexedDB / Cache Storage를 쓰게 되면 같은 원칙 적용

const NS = 'arclight26:'; // 고유 네임스페이스 — 초기 코드네임에서 유래, 규칙 4상 대회 중 절대 변경 금지 (세이브 고아화)

/** @param {string} k @param {unknown} v */
export const save = (k, v) => {
  try { localStorage.setItem(NS + k, JSON.stringify(v)); } catch { /* 프라이빗 모드 등 */ }
};

/**
 * @template T
 * @param {string} k
 * @param {T} d 기본값
 * @returns {T}
 */
export const load = (k, d) => {
  try {
    const s = localStorage.getItem(NS + k);
    return s == null ? d : JSON.parse(s);
  } catch {
    return d;
  }
};
