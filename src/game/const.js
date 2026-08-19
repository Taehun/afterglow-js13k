// 월드(디자인) 좌표계와 튜닝 상수.
// 모든 게임플레이는 VW×VH 고정 월드에서 일어나고, cam.js가 화면에 맞춰
// 균등 스케일한다 (배경은 오버드로우로 레터박스를 감춘다).

export const VW = 960;
export const VH = 540;

// 하늘 섬 — 초원은 하늘에 떠 있는 작은 섬이다 (중심 0,0)
export const AW = 880;   // 섬 반폭
export const AH = 570;   // 섬 반높이
export const CR = 260;   // 섬 모서리 반경 (둥근 슬랩 실루엣)

/**
 * 섬 안으로 클램프 (둥근 모서리 포함) @param {number} x @param {number} y @param {number} m 여백
 * @returns {[number, number]}
 */
export const clampIsle = (x, y, m) => {
  let cx = Math.max(-AW + m, Math.min(AW - m, x));
  let cy = Math.max(-AH + m, Math.min(AH - m, y));
  const kx = AW - CR, ky = AH - CR;
  const qx = Math.abs(cx) - kx, qy = Math.abs(cy) - ky;
  if (qx > 0 && qy > 0) {
    const d = Math.hypot(qx, qy), lim = CR - m;
    if (d > lim) {
      cx = Math.sign(cx) * (kx + (qx / d) * lim);
      cy = Math.sign(cy) * (ky + (qy / d) * lim);
    }
  }
  return [cx, cy];
};

/** 섬 내부인가 @param {number} x @param {number} y @param {number} [m] */
export const insideIsle = (x, y, m = 0) => {
  const [cx, cy] = clampIsle(x, y, m);
  return Math.abs(cx - x) < 0.5 && Math.abs(cy - y) < 0.5;
};

// ── 파스텔 새벽 팔레트 ─────────────────────────────────────────────────────
export const SKY_TOP = '#ffdbe7';
export const SKY_MID = '#e3d9ff';
export const SKY_BOT = '#c9ecff';
export const HILL_FAR = '#c4b2ec';
export const HILL_NEAR = '#a88fdd';
export const PLAT_BODY = '#6f5aa8';
export const PLAT_EDGE = '#5d4a91';
export const GRASS = '#93e6a8';

/** 무지개 7색 (바깥→안) @type {string[]} */
export const RAINBOW = [0, 28, 52, 120, 195, 235, 285].map(h => `hsl(${h} 88% 64%)`);
/** 파티클용 순수 hue 값 */
export const RAINBOW_H = [0, 28, 52, 120, 195, 235, 285];
