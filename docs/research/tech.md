# js13k에서 기술적으로 가능한 것과 심사에서 통하는 것 (Roadroller 시대 기준 조사)

조사 시점: 2026-08-18. js13kgames.com 본문은 Playwright 렌더러로 직접 확인했고, 나머지는 포스트모템/리포 원문 기준. 추측인 부분은 명시함.

---

## 1. 2026 대회 환경 (공식 규칙 확인)

- **13,312바이트(13×1024) zip**, 최상위에 `index.html`, 압축 해제 즉시 브라우저에서 실행돼야 함. 외부 리소스 전면 금지(Google Fonts도 금지).
- **최신 Chrome + Firefox 두 브라우저에서 동작해야 하고, 콘솔 에러가 없어야 함**(콘솔 에러는 수용 거부 사유, 게임플레이 중 기타 오류는 감점 요인).
- 2026 테마: **"Unicorns and Rainbows"**. 테마는 채점 기준 중 하나.
- 제출 기간: 2026-08-13 ~ **09-13 13:00 CEST**. 미완성작은 09-14까지 "Unfinished"로 제출 가능(= 스코프 초과 실패가 공식 카테고리가 될 만큼 흔함).
- 투표/심사 기준 6개: **Theme, Innovation, Gameplay, Graphics, Audio, Controls** (게임 목록 정렬 옵션으로 확인). **오디오가 독립 채점 항목**이므로 무음 게임은 구조적으로 불리.
- 카테고리: Desktop / Mobile(기본), Online, WebXR, Wavedash(2026 신설, 상금 $1500). 같은 게임을 데스크톱/모바일용으로 쪼개 중복 제출하는 것은 금지.
- **WebXR 카테고리 특례**: A-Frame 1.8.0 / Babylon.js 9.20.0 / PlayCanvas 2.21.3 / Three.js R185 중 하나를 **13KB 밖에서 무료로 사용 가능**(주최측 호스팅 버전만). 단 이 경우 Desktop/Mobile 기본 카테고리에는 동시 참가 불가.
- **Online 카테고리**: 주최측 WebSocket relay 제공 + PartySocket 1.3.0 무료 import 허용. 단 **오프라인(싱글)으로도 플레이 가능해야 함**.
- localStorage는 모든 게임이 같은 오리진을 공유하므로 **키에 고유 네임스페이스 필수, `localStorage.clear()` 금지**.
- 읽을 수 있는 소스의 GitHub 리포 제출 의무(js13kGames org에 클론됨) — 역대 기법 확인이 가능한 이유.
- 참가작 규모: 2021년 223개, 2022년 167개, 2023년 163개, 2024년 187개, 2025년 197개.

출처: https://js13kgames.com/rules , https://js13kgames.com/webxr , https://js13kgames.com/online , 각 연도 games 페이지

---

## 2. "Roadroller 시대"의 압축 파이프라인 — 실효 예산은 13KB가 아니다

2021년 Roadroller(강성훈/lifthrasiir 작) 등장 이후 표준 파이프라인은 대략:

**번들(Rollup/Vite/esbuild) → 미니파이(Terser/Closure) → Roadroller(JS 패킹) → ECT/advzip(zip 재압축)**

- Roadroller는 "최고 수준의 ZIP/gzip 재압축기 대비 **최대 15% 추가 압축**"을 공식 표방. ([github.com/lifthrasiir/roadroller](https://github.com/lifthrasiir/roadroller))
- 실측: **Q1K3**는 미니파이 후 26.5KB 소스가 Roadroller로 **12.0KB**가 됐고, zip 대비 **약 1.2KB 추가 절약**. ([phoboslab](https://phoboslab.org/log/2021/09/q1k3-making-of))
- **Dante**(2022 우승)는 Roadroller로 **약 2KB 절약**. ([repo](https://github.com/SalvatorePreviti/js13k-2022))
- **Space Huggers**의 Frank Force는 Closure + Uglify/Terser + Roadroller + ECT 조합으로 "몇 KB의 코드가 더 들어갔다. 사실상 JS15K가 됐다는 농담이 나왔다"고 씀. ([frankforce.com](https://frankforce.com/space-huggers-how-i-made-a-game-in-13-kilobytes/))
- 공식 리소스 페이지에는 ADVZIP("13kB ZIP을 9~11kB로 축소 가능"), ECT, RegPack, glslx(셰이더 미니파이), ZTML 등이 등재. ([resources](https://js13kgames.com/resources))

**결론: 미니파이 기준 25~30KB 안팎의 코드가 13KB zip에 들어간다.** Q1K3(26.5KB 소스)가 실증.

주의(Ashes of Ulthar, 2025 10위의 교훈): Roadroller 파이프라인은 개발 빌드와 최종 빌드가 크게 달라서 **최종 zip을 늦게 테스트하면 치명적**. 이 게임은 마감 직전 zip 빌드에서 게임이 깨지는 버그 + 약 1KB 초과가 발견돼 Help 화면을 통째로 삭제했다. ([7tonshark.com](https://7tonshark.com/posts/making-of-js13k-2025-ashes-of-ulthar/))

---

## 3. 기술적으로 인상 깊었던 역대 사례와 비용(KB)

### 3D / WebGL / 셰이더

**Q1K3 — Quake 데메이크 (Dominic Szablewski, 2021)** — 이 분야의 바이트 단위 벤치마크
- WebGL 렌더러, 단일 셰이더 프로그램, 프러스텀 컬링/오클루전 없이 GPU에 맡김, 동시 광원 32개 제한
- TrenchBroom으로 만든 맵을 축정렬 블록으로 변환, **블록당 6바이트**. 2개 레벨(563블록+188엔티티) = **비압축 4.5KB / zip 3.2KB**
- 커스텀 DSL로 **프로시저럴 텍스처 31장 = zip 1.3KB** (동일 PNG였다면 ~150KB)
- 개조 Sonant-X로 **오디오 라이브러리+SFX+음악 = zip 1.5KB**, 모델 1.6KB
- 최종 13.3KB. Kotaku/TechSpot에 보도될 만큼 화제였지만 **Overall 순위는 사이트 정렬 기준 15번째**였고, 공식 winners 발표에서는 "Super Special" 특별상 — **기술적 경이 ≠ 종합 순위**의 대표 사례
- 출처: https://phoboslab.org/log/2021/09/q1k3-making-of , https://www.freecodecamp.org/news/20-award-winning-javascript-games-js13kgames-2021-winners/ , https://js13kgames.com/2021/games

**Dante (Salvatore Previti, 2022 Overall+Mobile 1위)**
- BSP 트리 기반 **CSG로 지오메트리를 코드에서 생성**, **2레벨 cascaded shadowmaps**(LearnOpenGL 참조)
- 음악은 SoundBox player-small.js(베토벤 월광 편곡). 13KB 3D 게임이 모바일 카테고리까지 동시 석권 — **3D여도 모바일에서 돌아가게 만드는 것이 우승 공식**
- 출처: https://github.com/SalvatorePreviti/js13k-2022

**13th Floor (Rob Louie, 2024 1위)** — 3년간 개량한 자작 3D 엔진 기반 호러 스텔스
- WebGL2 **포인트 라이트 섀도우**(텍스처 큐브에 거리 기록, `EXT_color_buffer_float` + `OES_texture_float_linear` 필요, 구현에 5일), 스포트라이트+플래시라이트
- 구체/삼각형 충돌(경사·계단 자동 처리), **BFS 노드 경로탐색**과 노드 그래프를 적 시야 판정·아이템 배치·문 개폐에 재활용(레이캐스팅 회피)
- ZzFX를 버리고 **자체 신시사이저**로 엘리베이터 문·발소리 등 "사실적" SFX 합성. 3D 모델은 전부 코드로 제작
- "방마다 다른 깜짝 요소" 등은 잘라냄 — "13KB 개발의 본질은 코어 메커닉에 집중하는 것"
- 출처: https://roblouie.com/article/1219/the-making-of-the-13th-floor-js13k-2024/
- (참고: 엔진 스타터 공개 — https://github.com/roblouie/js13k-typescript-starter-webgl )

**DR1V3N WILD (Frank Force, 2024 8위 / Controls 1위 / Graphics 2위)**
- OutRun풍 3D 드라이빙. **WebGL 렌더러 + 프로시저럴 아트(나무/바위/배경)와 레벨 전부 포함 13KB**, "거의 모든 기기에서 잘 돌아감"
- 출처: https://frankforce.com/dr1v3n-wild-arcade-driving-in-13-kilobytes/ , https://github.com/KilledByAPixel/Drive13K

**Underrun (phoboslab, 2018)** — Roadroller 이전이지만 수치가 정밀해 참고 가치 큼
- 모든 지오메트리를 단일 버퍼에 넣고 **프레임당 드로우콜 1회**, 버텍스 라이트 32개, 320×180 저해상도로 한계 은폐
- **레벨을 PNG로 저장: 64×64 타일맵당 ~300바이트**(raw 4KB 대비), 텍스처 아틀라스 2.12KB, Sonant-X 개조(음악+SFX 포함 ~2KB, 30% 축소·2배 고속화)
- 출처: https://phoboslab.org/log/2018/09/underrun-making-of

### 프로시저럴 지형 / 물리 / 파티클

**Space Huggers (Frank Force, 2021 8위/223)** — 파괴 가능 지형 + 대규모 파티클
- 노이즈 기반 지면 + 모듈러 룸 규칙으로 레벨 생성("게임에서 가장 복잡한 부분"), 전부 파괴 가능
- **커스텀 2D 물리/충돌 솔버 자작**, 불 전파·폭발 연쇄, 혈흔/눈 파티클이 지형에 영구히 남는 시스템
- WebGL로 "대량의 스프라이트를 60FPS로" 렌더링. 아트는 **128×48 16색 시트 1장**을 런타임 틴팅/회전으로 돌려씀
- 사운드는 ZzFX SFX 11개뿐, **음악은 용량 부족으로 미포함**. 4인 코옵은 "아무도 안 써본 낭비 코드"였다고 자평
- 이 게임이 **LittleJS 엔진**의 모태. LittleJS는 js13k용 브랜치가 **7KB zip**으로 빌드됨(약 6KB 여유)
- 출처: https://frankforce.com/space-huggers-how-i-made-a-game-in-13-kilobytes/ , https://github.com/KilledByAPixel/LittleJS

**The Wandering Wraith (Mateusz Tomczyk, 2019)** — 물리 시뮬의 함정
- "물리적으로 올바른 강체 시뮬레이션은 플랫포머 캐릭터 조작에 매우 나쁜 선택"이어서 초기 빌드가 플레이 불가였다는 교훈. ZzFX로 바람 앰비언트 루프까지 합성
- 출처: https://medium.com/@mateusz.tomczyk/a-story-of-making-a-13-kb-game-in-30-days-the-wandering-wraith-post-mortem-9847c8992f49 (검색 스니펫 기준), https://github.com/tulustul/The-Wandering-Wraith

### 아트 인코딩 / 레벨 데이터

**13 Steps to Escape (Jonathan Vallet, 2024 4위)**
- 픽셀아트를 **RLE 문자열**("a"=흰색 1px, "b"=2px…)로 인코딩 — **"텍스트가 바이너리(WebP)보다 zip 압축에 유리"**
- 레벨은 정규식으로 파싱되는 문자열로, 20×10 그리드가 **최대 144자**. 팔레트 스왑으로 타일 재활용, 픽셀 폰트도 0/1 문자열로 재작성
- SoundBox 음악(드럼 없는 인트로 → 드럼 추가 루프로 용량 절약) + ZzFX SFX, 자작 레벨 에디터
- 출처: https://github.com/jonathan-vallet/js13k-2024/blob/main/POST_MORTEM.md

### 음악/사운드 (ZzFXM / SoundBox 계열의 실제 비용)

| 도구 | 비용 | 근거 |
|---|---|---|
| ZzFX | **압축 후 1KB 미만**, 20개 파라미터 SFX 신스 | https://github.com/KilledByAPixel/ZzFX |
| ZzFXM | 플레이어 **442바이트(gzip)**; "2~3분 음악+재생 코드 = gzip 1.5KB(예산의 ~10%)" 목표로 설계 | https://keithclark.co.uk/articles/zzfxm/ |
| Sonant-X | Q1K3: 라이브러리+SFX+음악 **1.5KB(zip)** / Underrun: **~2KB** | phoboslab 포스트모템 2건 |
| SoundBox (player-small) | Dante·13 Steps·Ashes of Ulthar가 사용. Ashes는 플레이어 하나만 넣으려고 **SFX까지 SoundBox로** 제작 | 각 리포/포스트모템 |
| 자체 신스 | 13th Floor — "사실적" 3D용 SFX는 ZzFX 한계라 미디 플레이어 기반 자작 | roblouie.com |

**2025년 새 트렌드: CLAWSTRIKE(2025 Overall+Mobile 1위)는 곡을 GPT-5로 생성**했고, 프롬프트/스크립트를 리포 `ai/` 디렉토리에 공개(ZzFX + Sonant-X로 재생). 출처: https://github.com/remvst/clawstrike

### 세이브 시스템
- **Non-Mewtonian Cat (2025 7위, 소스 9.22KB)**: 전문가 심사평에 "다시 와보니 진행 상황이 저장돼 있어서 좋았다"는 언급 — 13KB 퍼즐 게임에서 localStorage 진행 저장 + undo가 심사평에서 반복 호평받은 실례. 공식 규칙상 네임스페이스만 지키면 localStorage 사용은 자유.
- 출처: https://js13kgames.com/2025/games/non-mewtonian-cat , https://js13kgames.com/rules

---

## 4. 심사에서 통하는 것 (2021–2025 우승작 패턴)

역대 우승작: 2021 Space Garden(Ryan Malm) → 2022 Dante(Salvatore Previti) → 2023 Path to Glory(Rémi Vansteelandt) → 2024 13th Floor(Rob Louie) → 2025 CLAWSTRIKE(Rémi Vansteelandt). (각 연도 games 페이지 Overall 정렬 + 공식 발표)

1. **6개 기준의 균형이 Overall을 만든다.** 공식 dev.to 분석: "상위권에 가려면 모든 기준의 균형이 중요하다"(단, Gameplay나 Graphics에 집중하고 Theme/Audio를 버리는 전략으로 상위권에 든 사례도 있음). — https://dev.to/js13kgames/criteria-rankings-in-js13kgames-2024-3ac2
2. **모바일에서 돌아가면 이긴다.** Dante(2022)와 CLAWSTRIKE(2025)는 Overall과 Mobile을 동시 석권. DR1V3N WILD는 터치 대응 + "모든 기기에서 동작"으로 Controls 1위. Non-Mewtonian Cat은 터치 자동 활성 + 게임패드 지원으로 Controls 2위.
3. **오디오는 사실상 필수.** Audio가 독립 채점 항목. ZzFX(<1KB)+ZzFXM(0.5KB+곡)으로 1.5~2KB면 음악+SFX가 해결되므로 "용량이 없어서"는 변명이 안 되는 시대. Space Huggers는 음악 없이도 8위였지만 Frank Force 본인이 이후 버전에서 음악부터 추가했다.
4. **기술력만으로는 우승 못 한다.** Q1K3가 15위권(특별상), 반면 우승작들은 조작감·난이도 곡선·온보딩이 좋은 게임들. 2025년 7위 Non-Mewtonian Cat 심사평의 호평 포인트는 "레벨 디자인, undo, 저장, 온보딩, 음악"이었고 불평은 "레벨이 더 있었으면"뿐.
5. **13KB를 다 쓸 필요도 없다.** Non-Mewtonian Cat은 **9.22KB로 7위**. 용량보다 완성도.
6. **신선한 아이디어 > 기술적 완성도** (공식 규칙 명문): "쿨하고 신선한 아이디어는 기술적 정교함이 부족해도 환영받는다. 튜토리얼 Breakout/Flappy 클론은 낮은 평가를 받는다."

---

## 5. 흔한 실패 패턴 (사례 기반)

| 패턴 | 실제 사례/근거 |
|---|---|
| **스코프 초과 → 미완성** | 공식 "Unfinished" 카테고리가 존재할 만큼 흔함(rules). Space Huggers는 엔진 만드는 데 대회 기간 절반을 써서 콘텐츠가 빈약했다고 자평. 13th Floor도 기능 다수 컷 |
| **최종 zip 빌드 테스트 지연** | Ashes of Ulthar(2025 10위): 마감 직전에야 zip 빌드가 깨진 것 + ~1KB 초과 발견 → Help 화면 삭제. "최대 실수는 최종 출력물을 일찍 테스트하지 않은 것", 이후 매주 프로덕션 빌드 테스트 권고 |
| **물리 리얼리즘 함정** | The Wandering Wraith: 정확한 강체 물리로 만든 플랫포머가 조작 불능 → 가짜 물리로 재작성 |
| **아무도 안 쓰는 기능에 바이트 낭비** | Space Huggers 4인 코옵: "거의 아무도 안 해봤으니 그 코드는 낭비였을 것" |
| **오디오 없음** | Audio가 6개 채점 기준 중 하나(사이트 정렬 옵션으로 확인). 무음이면 해당 축 점수를 통째로 잃음 — *감점 폭 자체는 공개 데이터 없음(추측)* |
| **모바일/터치 미대응** | Mobile이 기본 카테고리이고 우승작들이 모바일 동시 석권하는 패턴(위 4-2). *투표자 중 모바일 플레이 비중 데이터는 못 찾았음(추측 영역)* |
| **콘솔 에러** | 규칙상 "콘솔 에러가 없어야 함" — 수용(acceptance) 단계에서 걸림 |
| **개발 환경 가정** | "플레이어는 내 폰트를 갖고 있지 않다" 등 환경 차이 gotcha — João Lopes, https://dev.to/lopis/gotchas-while-developing-a-tiny-web-game-4528 |
| **localStorage 오염** | 전 게임이 같은 오리진 공유. 네임스페이스 없는 키/`clear()`는 규칙 위반 |
| **온보딩 부재** | Ashes of Ulthar: Help 화면을 잘라낸 결과 Theme 60위·Controls 48위로 하락했다고 자체 분석. 13 Steps to Escape도 스파이크 타일 의미 전달 실패를 반성 |

---

## 6. 2026 전략 관점 요약

- **실효 예산**: 미니파이드 JS 25~30KB 상당(Roadroller+ECT 전제). 음악+SFX 1.5~2KB, 폰트 0.7KB(tinyfont), 2D 물리 1.5KB(Mini2Dphysics), WebGL 프레임워크 1.5~3KB(W/microW) 같은 기성 부품이 공식 리소스에 정리돼 있음 — https://js13kgames.com/resources
- **검증된 고득점 조합**: (a) 모바일에서 돌아가는 조작감 좋은 2D 액션/퍼즐 + 좋은 음악 + 명확한 온보딩(CLAWSTRIKE/Path to Glory 라인), (b) 코드 생성 지오메트리 + 그림자 라이팅의 분위기형 3D(Dante/13th Floor 라인 — 단 제작 난도 높음)
- **3D를 하려면**: Q1K3(맵 6바이트/블록, 텍스처 DSL), Dante(CSG), 13th Floor(포인트 라이트 섀도우) 리포가 모두 js13kGames org/개인 리포에 공개돼 있어 직접 기법 확인 가능
- **하지 말 것**: 최종 zip 테스트 미루기, 리얼 물리, 무음, 데스크톱 전용 조작, 튜토리얼 클론, 남는 기능욕심(코옵 등)

## KEY FACTS
- 2026 규칙: zip ≤ 13,312바이트, 최상위 index.html, 외부 리소스 전면 금지(Google Fonts 포함), 최신 Chrome+Firefox에서 콘솔 에러 없이 동작해야 함. 테마 'Unicorns and Rainbows', 마감 2026-09-13 13:00 CEST — https://js13kgames.com/rules (렌더러로 본문 확인)
- 심사(투표) 기준은 Theme, Innovation, Gameplay, Graphics, Audio, Controls 6개 — 게임 목록의 SORT BY 옵션으로 확인, 오디오가 독립 채점 항목 — https://js13kgames.com/2024/games
- 공식 카테고리에 'Unfinished'가 존재(마감 다음날까지 미완성작 제출 가능) — 스코프 초과 미완성이 공식적으로 흔한 실패 패턴 — https://js13kgames.com/rules
- WebXR 카테고리는 A-Frame 1.8.0 / Babylon.js 9.20.0 / PlayCanvas 2.21.3 / Three.js R185 중 하나(주최측 호스팅 버전)를 13KB 예산 밖에서 사용 허용, 대신 Desktop/Mobile 기본 카테고리 동시 참가 불가 — https://js13kgames.com/webxr
- Online 카테고리는 주최측 WebSocket relay + PartySocket 1.3.0 무료 import 제공, 단 게임은 오프라인(싱글)으로도 플레이 가능해야 함 — https://js13kgames.com/online
- localStorage는 전 게임이 같은 오리진 공유: 키 네임스페이스 필수, localStorage.clear() 금지 — https://js13kgames.com/rules
- Roadroller는 최고 수준 ZIP/gzip 재압축기 대비 최대 15% 추가 압축을 표방하는 js13k용 JS 패커 — https://github.com/lifthrasiir/roadroller
- Q1K3(2021, Dominic Szablewski): 미니파이 26.5KB 소스 → Roadroller 12.0KB(약 1.2KB 추가 절약), 맵은 블록당 6바이트로 2레벨 4.5KB(zip 3.2KB), 프로시저럴 텍스처 31장 zip 1.3KB(PNG였다면 ~150KB), 개조 Sonant-X 오디오 전체 zip 1.5KB, 모델 1.6KB, 총 13.3KB — https://phoboslab.org/log/2021/09/q1k3-making-of
- Q1K3는 언론 보도(Kotaku/TechSpot)에도 2021 Overall 정렬 기준 15번째였고 공식 발표에서는 'Super Special' 특별상 — 기술력만으로는 종합 우승 불가의 사례 — https://js13kgames.com/2021/games , https://www.freecodecamp.org/news/20-award-winning-javascript-games-js13kgames-2021-winners/
- Dante(2022 Overall+Mobile 1위, Salvatore Previti): BSP 트리 기반 CSG로 지오메트리 생성, 2레벨 cascaded shadowmaps, SoundBox player-small 음악, Roadroller로 약 2KB 절약 — https://github.com/SalvatorePreviti/js13k-2022
- 13th Floor(2024 1위, Rob Louie): WebGL2 포인트 라이트 섀도우(텍스처 큐브 + EXT_color_buffer_float/OES_texture_float_linear, 구현 5일), 구체/삼각형 충돌, BFS 노드 경로탐색을 적 시야 판정에 재활용, ZzFX 대신 자체 신스로 SFX 합성, 3D 모델 전부 코드 제작 — https://roblouie.com/article/1219/the-making-of-the-13th-floor-js13k-2024/
- DR1V3N WILD(2024 8위, Controls 1위, Graphics 2위, Frank Force): WebGL 렌더러+프로시저럴 아트/레벨 포함 13KB OutRun풍 3D 드라이빙, '거의 모든 기기에서 동작' — https://frankforce.com/dr1v3n-wild-arcade-driving-in-13-kilobytes/ , https://github.com/KilledByAPixel/Drive13K
- Space Huggers(2021 8위/223, Frank Force): 노이즈+모듈러 룸 프로시저럴 파괴 지형, 자작 2D 물리/충돌, 파티클이 지형에 영구 잔류, 128×48 16색 시트 1장, ZzFX SFX 11개에 음악은 용량 부족으로 미포함, 4인 코옵은 '낭비된 코드'로 자평, Closure+Terser+Roadroller+ECT 파이프라인('JS15K' 농담), LittleJS 엔진의 모태 — https://frankforce.com/space-huggers-how-i-made-a-game-in-13-kilobytes/
- LittleJS는 js13k용 브랜치가 7KB zip으로 빌드됨(약 6KB 여유) — https://github.com/KilledByAPixel/LittleJS
- Underrun(2018, phoboslab): 프레임당 드로우콜 1회, 레벨을 PNG로 저장해 64×64 타일맵당 ~300바이트, 텍스처 아틀라스 2.12KB, Sonant-X 개조 오디오 ~2KB — https://phoboslab.org/log/2018/09/underrun-making-of
- ZzFX는 압축 후 1KB 미만의 20-파라미터 SFX 신스 — https://github.com/KilledByAPixel/ZzFX ; ZzFXM 플레이어는 442바이트(gzip)이고 '2~3분 음악+재생 코드 = gzip 1.5KB(13KB 예산의 ~10%)'를 목표로 설계됨 — https://keithclark.co.uk/articles/zzfxm/
- 13 Steps to Escape(2024 4위, Jonathan Vallet): 픽셀아트를 RLE 문자열로 인코딩('텍스트가 WebP 등 바이너리보다 zip 압축에 유리'), 레벨은 20×10 그리드가 최대 144자 문자열, SoundBox 음악+ZzFX SFX — https://github.com/jonathan-vallet/js13k-2024/blob/main/POST_MORTEM.md
- The Wandering Wraith(2019): '물리적으로 올바른 강체 시뮬레이션은 플랫포머 조작에 매우 나쁜 선택'이라는 포스트모템 교훈(초기 빌드 플레이 불능) — https://medium.com/@mateusz.tomczyk/a-story-of-making-a-13-kb-game-in-30-days-the-wandering-wraith-post-mortem-9847c8992f49 (검색 스니펫 기준, 원문 접근 차단)
- Ashes of Ulthar(2025 10위): 최대 실수는 최종 zip 출력물을 늦게 테스트한 것 — 마감 직전 게임 깨지는 버그+약 1KB 초과 발견, Help 화면 삭제로 대응했고 그 결과 Theme 60위/Controls 48위로 하락 분석 — https://7tonshark.com/posts/making-of-js13k-2025-ashes-of-ulthar/
- CLAWSTRIKE(2025 Overall+Mobile 1위, Rémi Vansteelandt): TypeScript+자작 빌드 파이프라인+내장 레벨 에디터, ZzFX+Sonant-X 재생에 곡은 GPT-5로 생성(프롬프트를 리포 ai/ 디렉토리에 공개) — https://github.com/remvst/clawstrike
- Non-Mewtonian Cat(2025 7위, Mohammed Saud): 소스 9.22KB로 7위 — 13KB를 다 쓸 필요 없음. localStorage 진행 저장('진행이 저장돼 있어 좋았다'는 전문가 심사평), 터치 자동 활성+게임패드로 Controls 2위 — https://js13kgames.com/2025/games/non-mewtonian-cat
- 공식 분석 '상위권에 가려면 6개 기준의 균형이 중요하다'(일부는 Gameplay/Graphics 집중 전략으로도 상위권) — https://dev.to/js13kgames/criteria-rankings-in-js13kgames-2024-3ac2
- 역대 우승작: 2021 Space Garden, 2022 Dante, 2023 Path to Glory, 2024 13th Floor, 2025 CLAWSTRIKE — 각 연도 games 페이지 Overall 정렬(렌더러 확인) 및 https://gamedevjs.com/competitions/js13kgames-2025-winners-annouced/
- 공식 리소스 페이지에 ADVZIP('13kB ZIP을 9~11kB로'), ECT, RegPack, glslx, tinyfont(<700B), Mini2Dphysics(1.5KB), W(3KB WebGL), js13k-ecs(1KB) 등 기성 부품이 등재 — https://js13kgames.com/resources
- 환경 차이 gotcha: '플레이어는 개발자와 같은 폰트를 갖고 있지 않다' 등 — https://dev.to/lopis/gotchas-while-developing-a-tiny-web-game-4528
- 참가작 수: 2021년 223개, 2022년 167개, 2023년 163개, 2024년 187개, 2025년 197개 — 각 연도 https://js13kgames.com/{연도}/games (렌더러 확인)
- 추측으로 표시한 것: 무음 게임의 구체적 감점 폭, 투표자의 모바일 플레이 비중은 공개 데이터를 찾지 못함 — 본문에 추측임을 명시
