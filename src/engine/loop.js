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
    // 탭 전환 복귀 시 거대한 dt 스파이크 방지 (최대 0.1초만 따라잡기)
    acc += Math.min((now - last) / 1000, 0.1);
    last = now;
    while (acc >= STEP) {
      update(STEP);
      acc -= STEP;
    }
    draw();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
};
