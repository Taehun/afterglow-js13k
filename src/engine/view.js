// 반응형 캔버스 — 창 전체를 채우고 devicePixelRatio를 반영한다.
// 규칙: Desktop/Mobile 카테고리는 단일 빌드로 대응해야 하므로(별도 빌드 제출 금지)
// 처음부터 어떤 화면 크기·비율에서도 동작하도록 설계한다.
//
// 좌표계: W, H는 CSS 픽셀 단위 논리 크기. ctx는 DPR 스케일이 적용되어 있어
// 게임 코드는 항상 W×H 논리 좌표로만 그리면 된다. (input.js의 ptr 좌표와 동일 단위)

export const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('c'));
export const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));

export let W = 0, H = 0;

const DPR_CAP = 2; // 3x 폰에서 픽셀 4배 낭비 방지 (성능/배터리)

export const resize = () => {
  const dpr = Math.min(devicePixelRatio || 1, DPR_CAP);
  W = innerWidth;
  H = innerHeight;
  canvas.width = (W * dpr) | 0;
  canvas.height = (H * dpr) | 0;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
};

addEventListener('resize', resize);
resize();
