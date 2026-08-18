// 고정 타임스텝 게임 루프.
// update는 항상 STEP(1/60초) 단위로 호출되어 프레임레이트와 무관하게
// 물리/게임플레이가 결정적으로 동작한다. draw는 rAF당 1회.

export const STEP = 1 / 60;

/**
 * @param {(dt: number) => void} update 고정 스텝 업데이트 (dt는 항상 STEP)
 * @param {() => void} draw 프레임당 1회 렌더
 */
export const start = (update, draw) => {
  let last = performance.now();
  let acc = 0;
  /** @param {number} now */
  const frame = now => {
    // rAF를 먼저 예약 — 한 프레임에서 예외가 나도 루프는 죽지 않는다
    // (콘솔 에러 0은 별개로 지켜야 하는 규칙이지만, 루프 사망은 최악의 실패 모드)
    requestAnimationFrame(frame);
    // 탭 전환 복귀 시 거대한 dt 스파이크 방지 (최대 0.1초만 따라잡기)
    acc += Math.min((now - last) / 1000, 0.1);
    last = now;
    while (acc >= STEP) {
      update(STEP);
      acc -= STEP;
    }
    draw();
  };
  requestAnimationFrame(frame);
};
