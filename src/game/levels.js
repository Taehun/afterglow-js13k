// 레벨 정의 — 프로토타입 3레벨.
// plats: [x0, x1, topY] (오버드로우를 위해 화면 밖까지 연장)
// 설계 의도:
//   L1 다리 — 아치의 기본(발판) 학습
//   L2 오르막 — 아치를 경사로로 쓰는 법 + 높이 감각
//   L3 비 — 아치의 세 번째 용도(우산), 잉크 예산 압박

/**
 * @typedef {Object} Level
 * @property {string} name
 * @property {string} hint
 * @property {number[][]} plats  [x0, x1, topY][]
 * @property {[number, number]} spawn
 * @property {[number, number]} gate  게이트 바닥 위치
 * @property {number} foals
 * @property {number} ink
 * @property {[number, number]=} rain  비 내리는 x 구간
 */

/** @type {Level[]} */
export const LEVELS = [
  {
    name: 'The First Arch',
    hint: 'Drag to draw a rainbow. Bring the foals home!',
    plats: [[-500, 300, 440], [560, 1460, 440]],
    spawn: [90, 440],
    gate: [830, 440],
    foals: 5,
    ink: 780,
  },
  {
    name: 'Stairway of Light',
    hint: 'Arches make fine ramps, too.',
    plats: [[-500, 340, 470], [520, 1460, 300]],
    spawn: [70, 470],
    gate: [880, 300],
    foals: 5,
    ink: 900,
  },
  {
    name: 'Shelter from the Storm',
    hint: 'A rainbow overhead keeps the rain away.',
    plats: [[-500, 260, 450], [700, 1460, 450]],
    spawn: [70, 450],
    gate: [900, 450],
    foals: 5,
    ink: 1120,
    rain: [320, 640],
  },
];

/** 플랫폼 표면 y들 @param {Level} lv @param {number} x @param {number[]} out */
export const platSurfaces = (lv, x, out) => {
  for (const [x0, x1, y] of lv.plats) if (x >= x0 && x <= x1) out.push(y);
  return out;
};

/**
 * 아치 끝점 스냅용 — (x, y) 근처의 플랫폼 표면 y (없으면 null)
 * @param {Level} lv @param {number} x @param {number} y
 */
export const nearGround = (lv, x, y) => {
  let best = null, bd = 1e9;
  for (const [x0, x1, py] of lv.plats) {
    if (x < x0 - 10 || x > x1 + 10) continue;
    const d = Math.abs(py - y);
    if (d < bd) { bd = d; best = py; }
  }
  return best;
};
