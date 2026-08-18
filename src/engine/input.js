// 통합 입력 추상화 — 마우스 + 터치(Pointer Events) + 키보드.
// 규칙상 동일 게임을 데스크톱/모바일 별도 빌드로 제출할 수 없으므로
// 단일 빌드가 두 입력을 모두 처리해야 한다. 게임 코드는 이 모듈만 바라본다.
//
// ptr 좌표는 CSS 픽셀 단위 == view.js의 W/H 논리 좌표와 동일 단위.
// 멀티터치: 첫 번째 포인터만 추적한다 — 폰을 쥔 손가락이 화면 가장자리에
// 닿아도 진행 중인 드래그가 끊기지 않는다. (멀티터치 제스처가 필요해지면
// 이 모듈을 포인터 배열 기반으로 확장할 것)

import { canvas } from './view.js';

/** 현재 눌려 있는 키 (KeyboardEvent.code) @type {Set<string>} */
export const keys = new Set();
/** 이번 update 틱에 새로 눌린 키 @type {Set<string>} */
export const keysJust = new Set();

/** 포인터 상태 (마우스/터치 공용). sx/sy는 이번 프레스의 시작 좌표 —
 *  빠른 플릭에서도 정확하도록 pointerdown 이벤트 시점에 캡처된다. */
export const ptr = { x: 0, y: 0, sx: 0, sy: 0, down: false, justDown: false };

/** 추적 중인 포인터 id (-1 = 없음) */
let activeId = -1;

/** @type {(() => void)[]} */
let unlockFns = [];
/** 첫 사용자 입력(제스처) 시 한 번 실행할 콜백 등록 — 오디오 언락 용도 @param {() => void} f */
export const onFirstInput = f => { unlockFns.push(f); };
const unlock = () => { for (const f of unlockFns) f(); unlockFns = []; };

addEventListener('keydown', e => {
  if (!e.repeat) { keys.add(e.code); keysJust.add(e.code); }
  unlock();
});
addEventListener('keyup', e => keys.delete(e.code));

// 창이 포커스를 잃으면 keyup을 받을 수 없다 — 잡고 있던 상태를 전부 해제해서
// 탭 복귀 후 "계속 걷는 캐릭터" 같은 고착 입력을 방지한다.
addEventListener('blur', () => {
  keys.clear();
  ptr.down = false;
  activeId = -1;
});

/** @param {PointerEvent} e */
const pos = e => { ptr.x = e.clientX; ptr.y = e.clientY; };

canvas.addEventListener('pointerdown', e => {
  if (activeId < 0) { // 첫 포인터만 추적 — 두 번째 손가락은 무시
    activeId = e.pointerId;
    pos(e);
    ptr.sx = e.clientX;
    ptr.sy = e.clientY;
    ptr.down = true;
    ptr.justDown = true;
    canvas.setPointerCapture(e.pointerId); // 캔버스 밖으로 드래그해도 추적 유지
  }
  unlock();
});
canvas.addEventListener('pointermove', e => {
  // 추적 중이면 그 포인터만, 아니면(마우스 호버) 자유롭게 위치 갱신
  if (activeId < 0 || e.pointerId === activeId) pos(e);
});
/** @param {PointerEvent} e */
const release = e => {
  if (e.pointerId === activeId) {
    activeId = -1;
    ptr.down = false;
  }
};
addEventListener('pointerup', release);
addEventListener('pointercancel', release);

// 모바일: 더블탭 줌/컨텍스트 메뉴 방지 (터치 스크롤은 CSS touch-action:none이 담당)
addEventListener('contextmenu', e => e.preventDefault());

/** 매 update 틱 끝에 호출 — justDown/keysJust 초기화 (main.js가 배선) */
export const endFrame = () => {
  ptr.justDown = false;
  keysJust.clear();
};
