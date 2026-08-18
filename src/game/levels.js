// SUNSHOWER 레벨 — 문자열 격자.
//   '#' 크리스탈 벽   '.' 풀밭   'O' 틈(건널 수 없음)   'C' 구름(밀기)
//   'U' 유니콘 시작   'G' 아기 망아지(골)
// suns: 벽 위 태양의 위치와 광선 방향. 광선은 벽/구름에 막힌다.
//
// 핵심 규칙: 구름이 머문 타일은 젖는다. "젖은 틈 + 빛 = 무지개 다리."
// 구름은 비의 원천이면서 빛의 그림자 — 적시고, 비켜서, 빛을 들여라.

/**
 * @typedef {Object} Level
 * @property {string} name
 * @property {string} hint
 * @property {string[]} rows
 * @property {{x:number, y:number, dx:number, dy:number}[]} suns
 */

/** @type {Level[]} */
export const LEVELS = [
  {
    name: 'First Sunshower',
    hint: 'Rain on the gap, step aside, let the light in.',
    rows: [
      '#########',
      '#.......#',
      '#U.CO..G#',
      '#.......#',
      '#########',
    ],
    suns: [{ x: 0, y: 2, dx: 1, dy: 0 }],
  },
  {
    name: 'Double Rainbow',
    hint: 'One cloud can water many gaps.',
    rows: [
      '###########',
      '#.........#',
      '#U.CO.O..G#',
      '#.........#',
      '###########',
    ],
    suns: [{ x: 0, y: 2, dx: 1, dy: 0 }],
  },
  {
    name: 'Light from Above',
    hint: 'Sunbeams fall, too.',
    rows: [
      '#########',
      '#.......#',
      '#.......#',
      '#U.CO...#',
      '#.......#',
      '#...G...#',
      '#########',
    ],
    suns: [{ x: 4, y: 0, dx: 0, dy: 1 }],
  },
  {
    name: 'Cross the Beam',
    hint: 'Push across the light, not along it.',
    rows: [
      '##########',
      '#....U...#',
      '#....C...#',
      '#........#',
      '#....O..G#',
      '#........#',
      '##########',
    ],
    suns: [{ x: 0, y: 4, dx: 1, dy: 0 }],
  },
  {
    name: 'Sunshower Waltz',
    hint: 'Two suns, one cloud, one dance.',
    rows: [
      '###########',
      '#.........#',
      '#U.CO.....#',
      '#.........#',
      '#......O.G#',
      '#.........#',
      '###########',
    ],
    suns: [
      { x: 0, y: 2, dx: 1, dy: 0 },
      { x: 7, y: 0, dx: 0, dy: 1 },
    ],
  },
];
