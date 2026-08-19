# jk13k-2026 — js13kGames 2026 출품작

js13kGames 2026 (15회차) 참가 프로젝트. 테마: **"Unicorns and Rainbows"**.
게임: **AFTERGLOW** — 무지개 잔광이 곧 무기인 유니콘 뱀서라이크.
스토리: "폭풍이 세상의 색을 삼켰다. 달려라, 마지막 유니콘 — 너의 잔광이
색을 되태운다." 달린 자리의 잔광이 그림자 무리를 태우고(정지 = 화력 0),
지나간 들판은 색을 되찾는다(blooms). 아케이드/퍼즐 대안 탐색 이력과 근거는
docs/IDEAS.md·docs/research/, 폐기된 프로토는 arclight/looplight/sunshower
브랜치에 보존.

모든 규칙은 2026-08-18에 공식 페이지(https://js13kgames.com/2026/rules)에서
직접 확인한 원문 기준이다.

## 절대 규칙 — 위반 시 실격이거나 랭킹 제외

1. **최종 zip ≤ 13,312 bytes** (13×1024). `index.html`이 아카이브 최상위에 있고,
   압축 해제 즉시 브라우저에서 플레이 가능해야 한다. 빌드가 하드 가드한다
   (초과 시 `npm run build` 실패).
2. **외부 리소스 전면 금지.** 모든 에셋·데이터·코드가 zip 안에 있어야 한다.
   Google Fonts 등 외부 로드 폰트 불가, 애널리틱스/추적 전면 금지, CDN 없음.
   단, zip 안에 직접 포함한 커스텀 폰트는 허용(FAQ 명시)이고, 특수문자/이모지
   폴백용 웹폰트 live-load는 "없어도 게임이 동작한다"는 전제 하에 허용.
3. **최신 Chrome + Firefox 두 브라우저에서 플레이 가능, 콘솔 에러 0.**
   콘솔 에러는 규칙상 필수 조건이다. `npm run smoke`가 자동 검증한다.
4. **same-origin 공유** — js13kgames.com에서 모든 출품작이 origin을 공유한다.
   - localStorage 접근은 반드시 `src/engine/save.js`를 통해서만 (네임스페이스 `arclight26:` 강제 —
     변경하면 기존 플레이어 세이브가 전부 고아가 되므로 대회 기간 중 절대 바꾸지 않는다).
   - `localStorage.clear()` 절대 금지 — 다른 참가자의 세이브를 전부 날린다.
   - sessionStorage/IndexedDB/Cache Storage를 쓰게 되면 같은 네임스페이스 원칙 적용.
5. **동일 게임을 플랫폼별 별도 제출물로 중복 제출 금지** (예: 데스크톱 빌드와
   모바일 빌드를 각각 제출). Desktop과 Mobile 중 한 카테고리만 노리는 것 자체는
   규칙상 유효하다 — 단, 이 프로젝트는 **단일 빌드로 양쪽 모두 대응하는 것이
   기본 전략**이다(카테고리 전략 섹션 참고). 입력은 `src/engine/input.js`
   추상화(포인터+키보드 통합)만 사용하고, 레이아웃은 `src/engine/view.js`의
   W/H에 반응하도록 작성한다. 나중에 붙이면 바이트 예산이 안 맞는다.
6. **신작만.** 기존 게임 재제출 불가(BLACKOUT PROTOCOL 압축판 불가), 튜토리얼
   클론(Breakout/Flappy)은 평점 직격탄. 본인이 작성한 엔진 코드 재사용은 허용.
7. **소스 리포는 readable.** 제출물은 (1) 13KB zip + (2) 빌드 가능한 전체 소스가
   있는 GitHub 리포 2종. 난독화·압축은 빌드 단계(`tools/`)에서만 하고 `src/`는
   주석 포함 읽기 좋은 상태를 유지한다. 리포는 js13kGames org에 학습 자료로 클론된다.
8. **테마는 심사 배점 기준(rating criterion)이며 점수에 영향을 준다** — 원문 명시.
   해석은 자유지만 무시하면 손해. 신선한 아이디어는 공식적으로 환영받는다
   ("기술적으로 거칠어도 신선한 아이디어 환영" — New content only 섹션 원문).
   채점 항목은 **Overall + Theme/Innovation/Gameplay/Graphics/Audio/Controls**
   (2026-08-18, js13kgames.com/2026/games 페이지의 SORT BY 옵션에서 확인).

## 일정 (KST 기준)

| 날짜 | 마일스톤 |
|---|---|
| ~8/26 | (별도 프로젝트) BLACKOUT PROTOCOL 마감 — 그동안 js13k는 아이디어 메모만 |
| 8/27 | js13k 킥오프 — 게임 컨셉/스코프 확정 |
| 8/27~29 | 프로토타입 — 코어 메카닉 검증 |
| 8/30~9/5 | 코어 게임플레이 + 테마 반영 |
| 9/6~9/8 | 오디오/폴리시, 콘솔 에러 0 확인 (Chrome+Firefox 실물 확인) |
| 9/9 | 사이즈 압축 라운드 (`npm run build:max`) |
| **9/10** | **1차 제출** — 수동 심사(수일 소요) + 리젝 대응 버퍼 확보 |
| 9/13 20:00 | 최종 마감 (13:00 CEST) |
| 9/14 | Unfinished 제출 마지노선(미제출 드래프트 삭제됨) / 사소한 버그 수정 PR 가능 |
| 9/14~10/4 | 투표 — 플레이 불가 수준의 치명적 버그만 수정 PR 가능 |

드래프트는 **동시에 1개만** 열 수 있다. 제출 폼은 **개막(8/13) 시점엔 미오픈**
("The Submit form will open in a few days" — 공식 블로그, 8/20 확인 시점에도 /submit은 404).
열리면 js13kgames.com 상단 LOG IN 경유로 접근 — 블로그/소셜 공지를 확인할 것.

## 명령어

| 명령 | 용도 |
|---|---|
| `npm run dev` | 개발 서버 (http://localhost:1313, 저장 시 자동 리로드, 소스맵) |
| `npm run build` | 프로덕션 빌드 + 사이즈 리포트. **13,312B 초과 시 실패** |
| `npm run build:max` | 제출용 최대 압축 (Roadroller -O2, 느림 — 제출 직전에만) |
| `npm run size` | 빌드 후 한 줄 사이즈 요약 |
| `npm run build -- --fast` | Roadroller 생략한 빠른 사이즈 근사치 |
| `npm run build -- --log` | 결과를 `size-history.csv`에 기록 (회귀 추적) |
| `npm run smoke` | 빌드 산출물을 실제 브라우저로 검증 (콘솔 에러 0, 애니메이션 구동) |
| `npm run playtest` | E2E 자동 플레이 — 3레벨 전부 실제로 클리어 + 단계별 스크린샷(.playtest/) |
| `npm run lint` | ESLint flat config (src=브라우저, tools=노드, vendor 제외) |
| `npm run typecheck` | JSDoc 기반 tsc strict 체크 |
| `npm run check` | lint + typecheck + build + smoke 전부 |

**Node >= 22 필요** (`fs.globSync`, `import.meta.dirname` 사용; CI는 Node 24).
`zip`은 시스템 기본, `advzip`은 선택(`brew install advancecomp`) — 없으면 zip -9로 폴백.

## 작업 규율 — Claude가 지킬 것

- **기능을 추가/수정하면 `npm run check`를 돌리고 결과(특히 zip 바이트)를 보고한다.**
  모든 기능은 "몇 바이트짜리인지"를 항상 인지한 상태로 작업한다.
- 마감 주가 아닌데 예산의 96%(12,800B)를 넘기면 새 기능보다 다이어트를 먼저 제안한다.
- 하루 작업 마무리 시 `npm run build -- --log`로 `size-history.csv`에 기록한다.
- 콘솔 에러를 만들 수 있는 코드(미정의 참조, 실패 가능한 API)는 반드시 가드한다.
  오디오처럼 환경 의존적인 것은 try/catch (`src/engine/sfx.js` 참고).
- `src/` 코드는 읽기 좋게 유지한다 — 사이즈 최적화를 이유로 소스를 난독화하지
  않는다. 사이즈는 빌드 파이프라인이 만든다.

## 아키텍처

```
src/
├── main.js            엔트리 — 루프에 update/draw 연결
├── engine/            게임과 무관한 재사용 코어 (안정 유지, 함부로 수정하지 않기)
│   ├── loop.js        고정 타임스텝(1/60) 업데이트 + rAF 렌더
│   ├── view.js        반응형 캔버스 (W/H 논리 좌표, DPR 반영, resize 자동)
│   ├── input.js       입력 추상화 — 마우스/터치(Pointer Events)/키보드 통합
│   ├── sfx.js         ZzFX 래퍼 — 첫 입력 시 AudioContext 언락, 실패해도 안 죽음
│   └── save.js        네임스페이스 강제 localStorage 래퍼
├── game/              게임 로직 — 실제 작업은 대부분 여기서
│   └── game.js        (현재: 파이프라인 검증용 플레이스홀더 데모)
├── vendor/zzfx.js     ZzFXMicro v1.3.2 (MIT) — lazy AudioContext로 수정됨
└── index.html         dev 셸 (최종 HTML은 build.mjs가 별도 생성)
tools/
├── build.mjs          esbuild → terser → Roadroller → HTML 인라인 → zip → advzip
├── dev.mjs            esbuild watch + serve
└── smoke.mjs          playwright-core 스모크 테스트 (Chromium 필수, Firefox 있으면)
```

프레임 흐름: `loop.start(update, draw)` → update는 고정 STEP으로 0~N회 실행되고
**각 update 틱 끝에 `input.endFrame()`**(justDown류 초기화, main.js가 배선) →
draw는 rAF당 1회. endFrame을 렌더 프레임 끝으로 옮기면 안 된다 — 90/120Hz
화면에서 입력이 유실된다. 게임 코드는 `ptr`, `keys`, `keysJust`, `W`, `H`만
보고 작성하면 데스크톱/모바일이 동시에 처리된다. 포인터는 첫 번째 것만
추적(멀티터치 제스처 필요 시 input.js 확장), 창 blur 시 입력 상태 전부 해제.

## 사이즈 최적화 노하우

- 파이프라인: esbuild(번들) → terser(3-pass, unsafe, toplevel mangle) →
  **Roadroller** → HTML 인라인 → `zip -9 -X` → `advzip -z -4`(zopfli).
  Roadroller/terser 두 후보를 **각각 zip까지 압축한 뒤 최종 zip이 작은 쪽을
  자동 선택**한다 — Roadroller 출력은 고엔트로피라 zip이 못 줄이므로 코드가
  작을 땐 terser 쪽이 이긴다(raw 크기로 비교하면 틀린다). advzip은
  `brew install advancecomp`.
- **프로퍼티 맹글링 컨벤션**: `_`로 시작하는 객체 프로퍼티만 terser가 맹글한다.
  자주 쓰는 내부 객체 프로퍼티는 `_x`처럼 짓고, DOM/표준 API 이름과 겹치는
  `_`프리픽스는 만들지 않는다. (모듈 레벨 함수/변수는 toplevel mangle로 자동 처리)
- 압축(deflate/Roadroller)은 **반복 패턴**에 강하다: 비슷한 코드는 비슷한 형태로
  쓰고, 데이터는 문자열 테이블/배열 리터럴로 모으고, Math 함수는 지역 별칭보다
  그대로 반복하는 편이 나을 때가 많다 — 추측하지 말고 `npm run size`로 전후 비교.
- 에셋은 전부 코드로 생성: 그래픽 = 프로시저럴 캔버스/SVG path 문자열/셰이더,
  사운드 = ZzFX 파라미터(https://killedbyapixel.github.io/ZzFX/ 에서 디자인),
  음악 = 필요 시 ZzFXM 추가. 비트맵/오디오 파일은 넣지 않는다.
- Closure Compiler ADVANCED는 현재 파이프라인에 없다 — terser 대비 이득이
  크지 않고 property renaming 디버깅 비용이 크다. 막판에 바이트가 아쉬우면
  별도 브랜치에서 실험한다.

## 품질 게이트 — 기능 "완료" 선언 전 확인

1. `npm run check` 통과 (typecheck + 13KB 가드 + 콘솔 에러 0 + 애니메이션 구동)
2. 모바일 확인: dev 서버를 폰에서 열거나 devtools 모바일 뷰포트로 터치 동작 확인
3. 제출 전 최종: Firefox 실물 수동 플레이, 실기기 터치, 오디오 언락 동작,
   새로고침 후 세이브 유지, `dist/index.html` 압축 해제 상태로 더블클릭 실행 확인

## 카테고리 전략

- **Desktop + Mobile** (base): 규칙 5의 단일 빌드 구조로 자동 대응. 기본 목표.
- **Online** (선택, 신설·실험적): 공식 WebSocket relay 제공(Cloudflare Durable
  Objects). 참가 조건 — ① 오프라인/싱글플레이로도 동작(온라인은 부가 기능),
  ② 주고받는 데이터는 전부 자기 게임이 생성한 것, ③ 방은 휘발성(서버 저장 없음).
  PartySocket v1.3.0은 주최측 서버에서 무료 import 가능(13KB 밖).
  relay 프로토콜: 접속 시 `@내ID`, 타인 접속 `+ID`, 퇴장 `-ID` 수신,
  `@{clientId}|메시지`로 DM. 규칙: https://js13kgames.com/2026/online#rules
- **WebXR**: A-Frame/Babylon/PlayCanvas/Three 중 하나를 무료로 쓸 수 있지만,
  쓰는 순간 base 카테고리에서 제외된다 → 참가하지 않음(기본 방침).
- **Wavedash**: 정식 카테고리가 아닌 파트너 상금 트랙. 참가자 전원 $10 크레딧 —
  제출 시 체크만 하면 되는지 확인 후 참가.

## 제출 체크리스트 (9/10 목표)

- [ ] `npm run build:max` → `dist/game.zip` ≤ 13,312B
- [ ] zip 압축 해제 → `index.html` 더블클릭 → 플레이 가능
- [ ] Chrome + Firefox 실물 플레이, 콘솔 에러 0
- [ ] 모바일 실기기 터치 플레이
- [ ] GitHub 리포 public + README에 빌드 방법 명시 (`npm ci && npm run build`)
- [ ] js13kgames.com LOG IN → 제출 폼에서 draft 등록 → 라이브 프리뷰 확인 → 제출
      (폼 오픈 여부 먼저 확인 — 8/20 기준 아직 미오픈)
