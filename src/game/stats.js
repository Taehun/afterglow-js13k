// 런 스탯 + 업그레이드 정의 — 레벨업 3택의 원천.

export const stats = {
  _life: 1.3,  // 잔광 지속 (초)
  _w: 1,       // 잔광 폭 배수
  _dmg: 4,     // 잔광 틱 데미지
  _stars: 1,        // 별 화살 개수
  _sdmg: 6,
  _spd: 1,        // 이동 배수
  _mag: 110,     // 조각 흡입 반경
  _hp: 3,
  _halo: 0,         // 호른 헤일로 — 선회하는 별 수
  _beam: 0,         // 프리즘 광선 레벨 (0 = 미보유)
};

export const resetStats = () => {
  stats._life = 1.3;
  stats._w = 1;
  stats._dmg = 4;
  stats._stars = 1;
  stats._sdmg = 6;
  stats._spd = 1;
  stats._mag = 110;
  stats._hp = 3;
  stats._halo = 0;
  stats._beam = 0;
};

/**
 * @typedef {Object} Upgrade
 * @property {string} name @property {string} desc
 * @property {string} icon 이모지 대신 쓸 한 글자/기호
 * @property {() => void} apply
 * @property {() => boolean} [ok] 선택 가능 조건
 */

/** @type {Upgrade[]} */
export const UPGRADES = [
  { name: 'Long Afterglow', desc: 'Trail lasts +35%', icon: '~', apply: () => { stats._life *= 1.35; } },
  { name: 'Wide Afterglow', desc: 'Trail is wider', icon: '≡', apply: () => { stats._w += 0.45; } },
  { name: 'Burning Colors', desc: 'Trail damage +40%', icon: '☀', apply: () => { stats._dmg *= 1.4; } },
  { name: 'Another Star', desc: '+1 star bolt', icon: '★', apply: () => { stats._stars += 1; }, ok: () => stats._stars < 6 },
  { name: 'Heavy Stars', desc: 'Star damage +45%', icon: '✦', apply: () => { stats._sdmg *= 1.45; } },
  { name: 'Gallop', desc: 'Move speed +12%', icon: '»', apply: () => { stats._spd *= 1.12; }, ok: () => stats._spd < 1.6 },
  { name: 'Shard Charm', desc: 'Pickup radius +45%', icon: '◇', apply: () => { stats._mag *= 1.45; } },
  { name: 'Brave Heart', desc: '+1 max heart, heal 1', icon: '♥', apply: () => { stats._hp += 1; }, ok: () => stats._hp < 6 },
  { name: 'Horn Halo', desc: '+1 orbiting star', icon: '☆', apply: () => { stats._halo += 1; }, ok: () => stats._halo < 4 },
  { name: 'Prism Ray', desc: 'Piercing beam +', icon: '⌁', apply: () => { stats._beam += 1; }, ok: () => stats._beam < 4 },
];

/** 조건을 만족하는 업그레이드 중 서로 다른 3개 추첨 */
export const rollUpgrades = () => {
  const pool = UPGRADES.filter(u => !u.ok || u.ok());
  const picks = [];
  while (picks.length < 3 && pool.length) {
    picks.push(pool.splice((Math.random() * pool.length) | 0, 1)[0]);
  }
  return picks;
};
