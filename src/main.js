// 엔트리 포인트 — 모든 것을 조립한다.
import './engine/view.js'; // 캔버스/리사이즈 초기화 (부수효과)
import { start } from './engine/loop.js';
import { endFrame } from './engine/input.js';
import { update, draw } from './game/game.js';

// endFrame은 반드시 "update 틱 끝"에서 호출한다 (렌더 프레임 끝이 아니라).
// rAF 프레임 끝에서 호출하면: 90/120Hz 화면에서는 update가 0회인 프레임이
// justDown을 지워 입력이 유실되고, 저프레임에서는 update 여러 번이 같은
// justDown을 중복 소비한다.
start(dt => {
  update(dt);
  endFrame();
}, draw);
