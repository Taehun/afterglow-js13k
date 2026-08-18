// 보드 상태와 규칙 — 결정론 턴제. 렌더링은 art.js/game.js가 담당.
//
// 이동 규칙:
//   - 유니콘은 4방향 한 칸. 풀밭/골/무지개 타일로만 이동 가능.
//   - 구름은 소코반처럼 밀린다: 풀밭 또는 틈(구름은 떠 있으므로) 위로.
//     벽/다른 구름/골 위로는 못 민다.
//   - 구름이 머문 타일은 영구히 젖는다.
//   - 무지개 = 틈 && 젖음 && 빛이 지남 && 구름 없음 → 걸을 수 있다.
//   - 밀기와 동시에 그 타일이 무지개가 되면 그대로 올라탈 수 있다(선적용 후 검증).

/** @param {number} x @param {number} y */
const K = (x, y) => x + ',' + y;

export const board = {
  w: 0, h: 0,
  /** @type {string[]} */ rows: [],
  /** @type {{x:number, y:number, dx:number, dy:number}[]} */ suns: [],
  ux: 0, uy: 0,
  /** @type {number[][]} */ clouds: [],
  /** @type {Set<string>} */ wet: new Set(),
  /** @type {Set<string>} */ lit: new Set(),
  /** @type {Set<string>} */ rainbows: new Set(),
  /** 광선 빔 (렌더용): 시작 타일과 길이 @type {{x:number, y:number, dx:number, dy:number, len:number}[]} */
  beams: [],
  /** @type {{ux:number, uy:number, clouds:number[][], wet:string[]}[]} */
  hist: [],
  won: false,
  moves: 0,
};

/** 정적 타일 문자 @param {number} x @param {number} y */
export const tile = (x, y) => {
  if (x < 0 || y < 0 || y >= board.h || x >= board.w) return '#';
  const c = board.rows[y][x];
  return c === 'C' || c === 'U' ? '.' : c; // 동적 요소의 바닥은 풀밭
};

/** @param {number} x @param {number} y */
export const cloudAt = (x, y) => board.clouds.find(c => c[0] === x && c[1] === y);

/** @param {import('./levels.js').Level} lv */
export const loadLevel = lv => {
  board.rows = lv.rows;
  board.h = lv.rows.length;
  board.w = lv.rows[0].length;
  board.suns = lv.suns;
  board.clouds = [];
  board.wet = new Set();
  board.hist = [];
  board.won = false;
  board.moves = 0;
  for (let y = 0; y < board.h; y++) {
    for (let x = 0; x < board.w; x++) {
      const c = lv.rows[y][x];
      if (c === 'U') { board.ux = x; board.uy = y; }
      if (c === 'C') board.clouds.push([x, y]);
    }
  }
  soak();
  recompute();
};

/** 구름이 머무는 타일을 적신다 */
const soak = () => {
  for (const [x, y] of board.clouds) board.wet.add(K(x, y));
};

/** 광선·무지개 재계산 */
export const recompute = () => {
  board.lit = new Set();
  board.beams = [];
  for (const s of board.suns) {
    let x = s.x + s.dx, y = s.y + s.dy, len = 0;
    while (tile(x, y) !== '#' && !cloudAt(x, y)) {
      board.lit.add(K(x, y));
      len++;
      x += s.dx;
      y += s.dy;
    }
    if (len) board.beams.push({ x: s.x + s.dx, y: s.y + s.dy, dx: s.dx, dy: s.dy, len });
  }
  board.rainbows = new Set();
  for (let y = 0; y < board.h; y++) {
    for (let x = 0; x < board.w; x++) {
      const k = K(x, y);
      if (tile(x, y) === 'O' && board.wet.has(k) && board.lit.has(k) && !cloudAt(x, y)) {
        board.rainbows.add(k);
      }
    }
  }
};

const snapshot = () => {
  board.hist.push({
    ux: board.ux, uy: board.uy,
    clouds: board.clouds.map(c => [...c]),
    wet: [...board.wet],
  });
  if (board.hist.length > 200) board.hist.shift();
};

export const undo = () => {
  const s = board.hist.pop();
  if (!s) return false;
  board.ux = s.ux;
  board.uy = s.uy;
  board.clouds = s.clouds;
  board.wet = new Set(s.wet);
  recompute();
  return true;
};

/** 유니콘이 설 수 있는 타일인가 @param {number} x @param {number} y */
const walkable = (x, y) => {
  const c = tile(x, y);
  if (cloudAt(x, y)) return false;
  return c === '.' || c === 'G' || (c === 'O' && board.rainbows.has(K(x, y)));
};

/**
 * 한 수 진행. 결과: 'move' | 'push' | 'win' | null(막힘)
 * @param {number} dx @param {number} dy
 */
export const tryMove = (dx, dy) => {
  if (board.won) return null;
  const tx = board.ux + dx, ty = board.uy + dy;
  if (tile(tx, ty) === '#') return null;

  const c = cloudAt(tx, ty);
  let kind = 'move';
  if (c) {
    const bx = tx + dx, by = ty + dy;
    const bt = tile(bx, by);
    if (bt === '#' || bt === 'G' || cloudAt(bx, by)) return null;
    // 선적용: 구름을 밀고 재계산한 뒤 유니콘이 설 수 있는지 검증
    snapshot();
    c[0] = bx;
    c[1] = by;
    soak();
    recompute();
    if (!walkable(tx, ty)) { undo(); return null; }
    kind = 'push';
  } else {
    if (!walkable(tx, ty)) return null;
    snapshot();
  }
  board.ux = tx;
  board.uy = ty;
  board.moves++;
  if (tile(tx, ty) === 'G') { board.won = true; return 'win'; }
  return kind;
};
