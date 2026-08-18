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

// ── 아치 드로잉 ────────────────────────────────────────────────────────────
export const SNAP = 20;         // 끝점 스냅 그리드 (px)
export const ARC_MIN = 80;      // 최소 현(chord) 길이
export const ARC_MAX = 480;     // 최대 현 길이
export const ARC_H_RATIO = 0.32; // 아치 높이 = 현 길이 × 비율 (20px 단위 반올림)
export const ROOT_SNAP = 42;    // 끝점이 이 거리 안이면 지면에 뿌리내림 (빠른 드래그 관용)
export const TAP_MAX = 15;      // 이 미만의 드래그는 탭(지우기)으로 취급
export const ERASE_R = 34;      // 탭 지우기 판정 반경

// ── 망아지 워커 ────────────────────────────────────────────────────────────
export const FOAL_VX = 65;      // 걷기 속도 (px/s) — 심사 세션 페이싱 고려
export const SLIDE_ACC = 1.2;   // 내리막 가속 계수 (아치 모양이 플레이에 의미를 갖게)
export const SLIDE_DEC = 0.8;   // 오르막 감속 계수
export const CLIMB = 3.4;       // 샘플당 오를 수 있는 높이 (px) — 초과 시 벽으로 판정
export const DROP = 4.5;        // 샘플당 따라 내려갈 수 있는 높이 — 초과 시 낙하
export const GRAV = 780;        // 낙하 중력
export const KILL_Y = 640;      // 이 아래로 떨어지면 스폰으로 복귀

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
