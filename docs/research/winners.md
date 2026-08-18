# js13kGames 역대 수상작 메타 분석 (2019–2025)

> **조사 방법**: js13kgames.com 각 연도 게임 목록(기본 정렬 = Overall 순위)과 개별 게임 페이지(설명·기준별 점수·심사 코멘트)를 헤드리스 브라우저로 렌더링해 수집하고, 공식 우승 발표(블로그/dev.to/X)와 저자 포스트모템(roblouie.com, 7tonshark.com, eliasku.win, reitgames.com, danthedev.com, GitHub)으로 교차 검증했다.
> **한계**: 2019~2021년은 심사위원 순위제(게임 페이지에 "Overall rank 1/200" 식으로만 표기), 2022년 이후는 참가자+전문가 투표 기반 6개 기준(Theme/Innovation/Gameplay/Graphics/Audio/Controls) 점수제여서 연도 간 점수 직접 비교는 불가. 명시적으로 확인 못한 부분은 (추측)으로 표기했다.

---

## 1. 연도별 상위권 게임 (장르 · 핵심 메카닉 · 스코프)

### 2025 — 테마 "Black Cat" (197작 제출)
출처: https://js13kgames.com/2025/games , https://js13kgames.com/2025/blog/winners-announced

| 순위 | 게임 (저자) | 장르/메카닉 | 비고 |
|---|---|---|---|
| 1 | **CLAWSTRIKE** (Rémi Vansteelandt) | die-and-retry 액션 플랫포머. 죽은 주인의 복수를 하는 검은 고양이. 3연타 처치, 벽타기·활강·구르기, '야옹'으로 적 유인(스텔스), 즉시 리트라이+스피드런 타이머, 클리어 시 9 Lives 모드 해금 | Theme·Gameplay·Graphics·Audio 전부 **1위**. 12.99KB, TypeScript, 음악은 GPT-4+Sonant-X로 생성 ([repo](https://github.com/remvst/clawstrike)) |
| 2 | **Cat Survivors** (Elias Ku & Alexandra Al) | Vampire Survivors식 오토슈터. 10분 생존, 무기 11종·패시브 12종, 날씨 변화, 보스, 흰 고양이와 만나는 로맨틱 엔딩 | Gameplay·Controls 1위, Graphics 2위, Innovation은 48위(클론이라서). 절차적 벡터 그래픽, Canvas 2D ([포스트모템](https://eliasku.win/blog/cat-survivors-js13k-2025-postmortem/)) |
| 3 | **Witchcat** (Jonathan Vallet & Lylouf) | 젤다(Link's Awakening)풍 톱다운 어드벤처. 사라진 검은 고양이들을 찾기 위해 **4계절을 전환**해 지형을 바꾸는 퍼즐(겨울=얼음 위 보행, 여름=덩굴 등반 등) | 2인 팀(개발+픽셀아트 전담). Graphics 4위 |
| 4 | **Triska the Ninja Cat** (John Edvard) | 원터치 스윙 플랫포머. "고양이는 빨간 점을 좋아한다" — 빨간 점에 매달려 스윙, 17레벨, 클로버 수집 | 주인공은 js13k 공식 마스코트 고양이 Triska. Verlet 물리 두건, AI로 레벨 에디터 제작 ([포스트모템](https://reitgames.com/news/building-triska-the-ninja-cat)) |
| 5 | **Black Cat Squadron** (Jesper Rasmussen) | 원버튼 슈터. **실존 WW2 미해군 야간폭격 비행대 "Black Cats"(PBY Catalina)** 소재 | Audio 2위, Gameplay 3위. Theme는 32위 |
| 6 | **Catculus** (Antti Haavikko) | 숫자 합 퍼즐 + 메모리. 검은 고양이가 보드 타일을 **가려서** 기억해야 함, 로그라이트식 보너스 픽 | Theme 44위지만 Audio 3위·Graphics 7위 |
| 7 | **Non-Mewtonian Cat** (Mohammed Saud) | "고양이=액체" 밈 기반 소코반류 퍼즐. 고체/액체를 오가는 고양이, Undo 지원 | **9.22KB**(용량 여유), Controls 2위, 게임패드 지원 |
| 8 | **Whiskers Witch Adventure** (Rob Louie) | Spyro풍 3D 액션 플랫포머. 마녀의 사역마 검은 고양이가 버블에 갇힌 13인의 마녀 구출 | 자작 WebGL 엔진 4년째 개량(정점 키프레임 애니메이션 추가), 게임패드 진동 지원. Theme 2위 ([포스트모템](https://roblouie.com/article/1316/the-making-of-whiskers-witch-adventure-js13k-2025/)) |
| 9 | **Kuro Neko Market** (Federico Tibaldo) | 마우스 클릭만으로 하는 생선가게 아르바이트 아케이드(가격 계산→라벨 인쇄→부착) | Innovation 4위. 벡터 아트를 저해상도 캔버스에 그려 업스케일 |
| 10 | **Ashes of Ulthar** (Elliot Nelson) | 러브크래프트 「울타르의 고양이」 소재 마을 자원 시뮬(주민 자동화) | 실루엣+5색 팔레트 아트. **Theme 60위** — 저자 스스로 "테마가 겉돌았다"고 반성 ([포스트모템](https://7tonshark.com/posts/making-of-js13k-2025-ashes-of-ulthar/)) |

11~13위: Echoes of Nyx(Corentin Pillet), Celestial Paws(Daniel Cohen), Kittens United(Almut Kieffer-Jones).

### 2024 — 테마 "Triskaidekaphobia" (187작)
출처: https://js13kgames.com/2024/games , https://x.com/js13kGames/status/1842581301653622941

1. **13th Floor** (Rob Louie) — 3D 스텔스 호러. 13층 호텔에서 열쇠를 연쇄적으로 찾는 구조. 적이 **빛을 발산**해 문 밑 틈으로 새어 나오는 빛과 발소리로 위치를 파악하는 설계(HUD 없는 스텔스). Theme 1위, Graphics 3위(4.7). ([포스트모템](https://roblouie.com/article/1219/the-making-of-the-13th-floor-js13k-2024/))
2. **Coup Ahoo** (Antti Haavikko) — 주사위=화물=HP인 해적선 로그라이크 배틀러. "13을 만들면 불이익" 규칙으로 테마 통합. Audio 1위, Innovation 2위.
3. **Ghosted** (Jani Nykänen) — 13걸음 걸으면 유령으로 변하는 소코반 퍼즐(유령일 때만 코인 수집 가능, 대신 물체 못 밈). 12+1레벨.
4. **13 Steps to Escape** (Jonathan Vallet), 5. **The Way of the Dodo** (Jesper Rasmussen), 6. Brewing Disaster(Adrien Guéret), 7. Phantomicus(Cody Ebberson), 8. **DR1V3N WILD**(Frank Force), 9. Bubble Burst(John Edvard), 10. Aargh! Triskaideka attacks!(Christoph Schansky).

### 2023 — 테마 "13th Century" (163작)
출처: https://js13kgames.com/2023/games

1. **Path to Glory** (Rémi Vansteelandt) — "역사적으로 부정확한" 중세 벨트스크롤 벳뎀업, 웨이브 전투→최종 보스. 데스크톱/모바일 양쪽 1위. ([repo](https://github.com/remvst/knight))
2. **Merlin vs Alfonso** (Grav) — 알폰소 10세의 『Libro de los juegos』(1283)에 실린 중세 체스 규칙을 그대로 적 이동 규칙으로 쓴 퍼즐. Innovation 3위 — 테마의 '학술적' 재해석.
3. **Casual Crusade** (Antti Haavikko) — 타일 덱빌딩 경로 퍼즐. Audio 1위.
4. **Tiny Yurts** (burntcustard) — Mini Motorways풍 유르트-농장 연결 경영. **Canvas 없이 SVG+HTML+CSS만으로 제작**, 압축 전 소스 191KB→13KB(Roadroller).
5. **Upyri** (Rob Louie) — 3D 호러. 이후 Feast Night, Super Castle Game(Mark Vasilkov), Knight Dreams(Jani Nykänen) 등.

### 2022 — 테마 "Death" (167작)
출처: https://js13kgames.com/2022/games , https://github.blog/open-source/gaming/js13k-2022-winners/

1. **Dante** (Salvatore Previti) — 단테 신곡 소재 3D 퍼즐 플랫포머(13개의 잃어버린 영혼 수집, 1인칭/3인칭 전환). WebGL2 + 캐스케이드 섀도맵 + SVG 절차적 텍스처 + GPU 충돌 감지. 종합·모바일 1위. ([포스트모템](https://github.com/SalvatorePreviti/js13k-2022/blob/main/post-mortem.md))
2. **Dying Dreams** (Jani Nykänen) — 퍼즐 플랫포머. 3. **Norman the Necromancer** (Dan Prince) — 중력 투사체 조준 + 웨이브 방어 + 의식(리추얼) 업그레이드. 83개 픽셀 스프라이트, 트윈+파티클로 'juice' 구현. ([포스트모템](https://danthedev.com/norman-the-necromancer/)) 4. Soul Jumper(Ryan Tyler), 5. The Neatness(Mark Vasilkov), 6. Charon Jr.(Rob Louie).

### 2021 — 테마 "Space" (목록 223작 표기)
출처: https://js13kgames.com/2021/games

1. **Space Garden** (Ryan Malm) — 죽은 행성 수백 개에 꽃을 피우는 '스페이스 워킹 심'. 전투보다 **힐링·수집** 중심, 절차 생성 행성, 10.73KB. 2. **Beat Rocks** (Tomasz Wesołowski) — "Asteroids가 리듬게임이 된다면". 3. **The Adventures of Captain Callisto** (Cody Ebberson) — 짧은 3D 액션. 8. **Space Huggers** (Frank Force) — 파괴 가능 지형의 런앤건 플랫포머(LittleJS의 원형), 4인 협동 게임패드 지원. 16위권에 Q1K3(Dominic Szablewski의 Quake 데메이크)도 화제작.

### 2020 — 테마 "404" (목록 227작 표기)
출처: https://js13kgames.com/2020/games , https://github.blog/2020-10-11-top-ten-games-from-the-js13k-2020-competition/

1. **Ninja vs EVILCORP** (Rémi Vansteelandt) — Super Meat Boy+스텔스 플랫포머. 매 레벨이 "404 — PLANS NOT FOUND"로 끝나는 테마 처리. 모션 블러·클로스 시뮬 등 폴리시로 호평. 2. **Edge Not Found** (Tom Hermans) — **무한 반복 격자** 위의 소코반(경계가 '404'). 3. CHOCH — 웹 크롤러가 되어 사라진 페이지를 찾는 액션(CRT 미학). 4. Track not found?! (xem) — 원근 착시로 기차 길을 잇는 퍼즐. 9. Highway 404 (Jerome Lecomte) — HTTP 상태코드가 적으로 나오는 Spy Hunter풍 드라이빙.

### 2019 — 테마 "Back" (목록 245작 표기)
출처: https://js13kgames.com/2019/games , https://js13kgames.com/2019/games/xx142-b2exe

1. **xx142-b2.exe** (Ben Clark & Salvatore Previti) — 13초마다 삭제되는 AI 바이러스가 **이전 시도의 '백트레이스'(고스트)와 협동**하는 타임루프 퍼즐. WebGL 헥사곤 비주얼. 심사평: "겹치는 타임라인 퍼즐, 테마의 탁월한 사용, 거의 완벽한 실행". 2. Bounce Back (Frank Force), 3. Retrohaunt (Donitz), 5. The Wandering Wraith, 6. [SWAGSHOT] (Rémi Vansteelandt).

---

## 2. 2025 "Black Cat" 테마 처리 심층 분석

### 테마 접근 4유형 (top 13 기준)
1. **주인공=검은 고양이 + 고양이 행동의 메카닉화** (우승 공식): CLAWSTRIKE(야옹으로 유인, 9 Lives 모드, 할퀴기 3연타), Triska(빨간 점 스윙), Catculus(타일을 깔고 앉아 가리는 고양이), Non-Mewtonian Cat(액체 고양이 밈), Kuro Neko Market(생선 집착).
2. **미신·불운·9개 목숨 모티브**: CLAWSTRIKE 9 Lives 모드, 하위권까지 포함하면 Miss Fortune, Nine Lives, Lucky Charm 등 다수.
3. **문화·역사 레퍼런스**: Black Cat Squadron(실존 WW2 야간폭격대 — Wikipedia 링크까지 첨부), Ashes of Ulthar(러브크래프트), Bastet Night(이집트) 등.
4. **사역마(witch's familiar) 서사**: Witchcat, Whiskers Witch Adventure — 마녀+검은 고양이 콤비.

### 핵심 발견: Theme 점수와 순위의 관계
- **우승엔 테마 통합이 결정적**: 2025 CLAWSTRIKE는 Theme 1위(4.24), 2024 13th Floor도 Theme 1위(4.2). CLAWSTRIKE는 서사(주인의 복수 = "반대 방향의 존 윅" — 심사평), 아트(검은 실루엣 black-on-color), 메카닉(야옹 유인, 9 Lives) **세 층위 모두**에 테마를 녹였다.
- **top 10 진입 자체는 게임성으로 가능**: Catculus(Theme 44위), Non-Mewtonian Cat(47위), Ashes of Ulthar(60위)도 top 10에 들었다. 테마 점수는 6개 기준 중 1개일 뿐이므로, 나머지 5개가 강하면 커버된다. 단 이들은 1~3위와는 격차가 있었다.
- 저자들의 자기 평가도 일치: Triska 저자는 "클로버 대신 참치캔·캣닢을 썼어야 했다"며 테마 활용 부족을 아쉬워했고, Ashes of Ulthar 저자는 "내년엔 테마를 더 중심에 두겠다"고 썼다.
- 전문가 코멘트에서 반복된 칭찬 포인트: CLAWSTRIKE의 실루엣 스타일("black-on-color인데 레벨마다 새 컬러 테마" — Elliot Nelson), 이지모드 자동 제안 팝업(Björn Ritzl), "옛 플래시 시대 톱게임 느낌"(Emanuele Feronato).

---

## 3. 반복해서 상위권에 오르는 패턴

### 3.1 장르
- **종합 1위는 7년 중 5번이 '고폴리시 액션'**: 2020 스텔스 플랫포머, 2022 3D 플랫포머, 2023 벳뎀업, 2024 3D 스텔스 호러, 2025 액션 플랫포머. 예외는 2019(타임루프 퍼즐 — 단 WebGL 폴리시 극상)와 2021(힐링 탐험 심).
- **top 10 구성은 매년 비슷한 믹스**: 액션/플랫포머 3~4개 + 퍼즐 2~3개(소코반 변형이 특히 강세: Edge Not Found, Ghosted, Non-Mewtonian Cat) + 덱빌딩/주사위 로그라이트 1~2개(Casual Crusade→Coup Ahoo→Catculus, 전부 Antti Haavikko) + 미니 경영/심 1개(Tiny Yurts, Ashes of Ulthar, Kuro Neko Market, Space Garden).
- **'검증된 장르의 13KB 축소판'이 Innovation 감점을 감수하고도 고순위**: Cat Survivors(Vampire Survivors 클론, Innovation 48위인데 종합 2위), Tiny Yurts(Mini Motorways), Whiskers(Spyro). 반대로 Innovation 상위는 규칙 자체가 새로운 퍼즐(Merlin vs Alfonso, Kuro Neko Market)이 가져간다.

### 3.2 반복 수상자와 '엔진 자산의 복리'
- **Rémi Vansteelandt: 종합 우승 3회**(2020, 2023, 2025) + 2019 6위. 자작 js13k-compiler·툴체인 재사용.
- **Rob Louie: 2022부터 4년 연속 top 10**(6→5→1→8위). **같은 자작 WebGL 3D 엔진을 매년 개량**(충돌→조명/그림자→정점 애니메이션)한 것이 명시적 전략.
- **Antti Haavikko: 3년 연속 top 6**(3→2→6위), 매년 '카드/주사위/타일 로그라이트 + 1위급 오디오' 공식.
- **Salvatore Previti 2회 우승**(2019 공동, 2022), Jani Nykänen(2022 2위, 2024 3위 등 매년 다작), Frank Force(2019 2위, 2021 8위, 2024 8위 + ZzFX/LittleJS 제작자), Jonathan Vallet(2024 4위→2025 3위), John Edvard(2024 9위→2025 4위), Mark Vasilkov·xem·Elliot Nelson도 상습 상위권.
- 시사점: 상위권은 사실상 **리그 고정 멤버**이며, 이들의 공통점은 (a) 연도 간 엔진/빌드 파이프라인 재사용, (b) 포스트모템 작성으로 학습 축적, (c) 커뮤니티 피드백 활발 참여.

### 3.3 스코프 · 플레이 길이
- 1인 또는 2인(개발+아트) 팀. 2025 top 3 중 2팀이 2인 구성이며, 아트 전담이 있는 팀은 Graphics 점수가 최상위(Cat Survivors 2위, Witchcat 4위).
- 완주 15~30분 분량이 표준: CLAWSTRIKE 클리어 기록 11~16분(피드백 인증), Cat Survivors 10분 런, Ghosted 12+1레벨, Triska 17레벨, 13th Floor 13개 방.
- **단일 핵심 메카닉 + 레벨별 변주** 구조가 압도적. 13th Floor 저자: "13KB 개발의 본질은 핵심 메카닉에 집중하고 그것을 제대로 작동시키는 것"(원하던 부가 연출은 전부 잘라냄).
- 클리어 후 보상(뉴게임+)이 자주 등장: CLAWSTRIKE 9 Lives 모드, Ghosted 히든 레벨.

### 3.4 그래픽 스타일
- 3계열로 수렴: (1) **제한 팔레트 픽셀아트**(Jani Nykänen, Ashes of Ulthar 5색), (2) **미니멀 벡터/실루엣**(CLAWSTRIKE black-on-color, Cat Survivors 절차적 벡터, Tiny Yurts SVG), (3) **절차적 3D WebGL**(Rob Louie, Dante, Q1K3, MINIPUNK).
- 정적 그림보다 **모션 폴리시(juice)가 점수를 만든다**: 파티클, 트윈, 카메라 워크, 미세 애니메이션이 심사 코멘트에서 가장 자주 언급됨(CLAWSTRIKE "micro animations", Norman 포스트모템 "트윈과 파티클이 저해상도 스프라이트의 정적임을 감춘다").

### 3.5 오디오
- 상위 10위권에서 음악+SFX 미탑재 게임은 사실상 없음. 도구는 ZzFX/ZzFXM, SoundBox, Sonant-X, 순수 Web Audio 합성(Rob Louie의 '야옹' 신디사이징, 13th Floor 엘리베이터 문소리).
- Audio 기준 1위가 종합 1~3위와 겹치는 경우 다수(2024 Coup Ahoo, 2023 Casual Crusade, 2025 CLAWSTRIKE).

### 3.6 접근성 · 난이도 설계
- 반복 등장하는 승리 요소: **즉시 리트라이**(CLAWSTRIKE), **자동 이지모드 제안**(CLAWSTRIKE — 전문가가 콕 집어 칭찬), **Undo**(Ghosted, Non-Mewtonian Cat), **원버튼/마우스 온리 조작**(Black Cat Squadron, Coup Ahoo, Casual Crusade, Kuro Neko Market), 모바일 터치 지원(종합+모바일 동시 1위: Dante, Path to Glory, CLAWSTRIKE).
- 실패 사례의 교훈: Ashes of Ulthar는 용량 때문에 도움말 화면을 잘랐다가 Controls 48위로 추락, "플레이어가 튕겨 나갔다"고 자평. Triska는 "쉬운 완주 + 어려운 100% 완수"의 이원화가 필요했다고 반성.

### 3.7 툴체인 (포스트모템 공통 언급)
- 압축: **Roadroller**(2021년 이후 사실상 표준), ECT, Terser/esbuild + 커스텀 TypeScript 트랜스포머(Cat Survivors), js13k-compiler(Rémi).
- 최근 경향: **AI 활용의 부상** — CLAWSTRIKE는 음악을 GPT-4로 생성(repo의 /ai 디렉터리에 프롬프트 공개), Triska는 AI로 레벨 에디터를 한 번에 생성. (2026에는 더 보편화될 것으로 추측)
- 매주 zip 최종 빌드를 테스트하라(Ashes of Ulthar), 마지막 날은 기능 추가가 아니라 폴리시·스크린샷에 쓰라(Norman) 등 제출 리스크 관리 조언 반복.

---

## 4. 심사 코멘트·포스트모템이 말하는 승리 요인 요약
1. **폴리시 > 신선함**: "juice", "polish", "feels like a full game"이 1~2위 게임 피드백의 최빈 단어. Innovation 48위로도 종합 2위 가능(Cat Survivors).
2. **테마의 3층 통합(서사+아트+메카닉)이 우승 결정타**: 2024·2025 모두 Theme 1위 = 종합 1위.
3. **첫 30초 온보딩**: 조작 설명 부재는 즉시 순위 하락(Ashes of Ulthar Controls 48위). 튜토리얼 없는 자연스러운 학습 곡선(xx142 심사평 "플레이어가 똑똑하다고 느끼게 만드는 맵")이 이상형.
4. **오디오는 차별화 레버**: 13KB에서 음악 품질이 좋으면 심사자들이 반드시 언급.
5. **엔진·지식의 연차 축적**: 우승자 전원이 사실상 다년차 참가자. 첫 참가로 우승한 사례는 이 기간엔 확인되지 않음 (추측: Dan Prince처럼 첫 완주로 3위까지는 가능).
6. **난이도 안전장치**: 하드코어 난이도 자체는 감점이 아니나(CLAWSTRIKE는 어렵다는 평 다수에도 1위), 이지모드/즉시 리트라이 같은 탈출구가 함께 있어야 함.

## 5. 2026 도전 시사점 (의견/추측 포함)
- 가장 재현 가능한 공식: **검증된 액션·아케이드 장르 + 테마를 메카닉으로 번역 + 실루엣/제한 팔레트 아트 + ZzFX/Web Audio 음악 + 모바일 지원 + 즉시 리트라이·이지모드**.
- Innovation을 노린다면 '규칙이 새로운 퍼즐'(Merlin vs Alfonso 모델), 안정적 상위권을 노린다면 '유명 장르 13KB 증류'(Cat Survivors 모델)가 갈림길. (추측: 후자가 커뮤니티 투표제에서 유리 — 심사자들이 짧은 시간에 재미를 체감하기 쉬움)
- 테마 발표(매년 8/13) 전에 엔진·빌드 파이프라인·사운드 라이브러리를 준비해 두는 것이 상위권 공통 준비 형태.


## KEY FACTS
- 2025년(14회) 테마는 'Black Cat', 197작 제출, 종합 1위 CLAWSTRIKE(Rémi Vansteelandt), 2위 Cat Survivors, 3위 Witchcat — 출처: https://js13kgames.com/2025/blog/winners-announced
- CLAWSTRIKE는 Theme·Gameplay·Graphics·Audio 4개 기준에서 모두 1위였고 종합 점수 24.89를 기록한 die-and-retry 액션 플랫포머다 — 출처: https://js13kgames.com/2025/games/clawstrike
- CLAWSTRIKE의 테마 처리: 죽은 주인의 복수를 하는 검은 고양이 서사('반대 방향의 존 윅'이라는 심사평), 검은 실루엣 black-on-color 아트, '야옹'으로 적을 유인하는 스텔스 메카닉, 클리어 시 해금되는 9 Lives 모드 — 출처: https://js13kgames.com/2025/games/clawstrike
- CLAWSTRIKE의 음악은 GPT-4로 생성되었고 프롬프트와 스크립트가 repo의 /ai 디렉터리에 공개돼 있다(사운드는 ZzFX·Sonant-X) — 출처: https://github.com/remvst/clawstrike
- 2025년 2위 Cat Survivors는 Vampire Survivors 클론으로 Innovation 48위에 그쳤지만 Gameplay·Controls 1위, Graphics 2위로 종합 2위(24.67)를 차지했다 — 출처: https://js13kgames.com/2025/games/cat-survivors
- Cat Survivors 저자들은 실제로 기르는 검은 고양이(Chichi)에서 착안했고, 커스텀 TypeScript 트랜스포머로 필드명 압축, Canvas 2D 선택, 무기 진화 기능을 용량 때문에 삭제했다고 밝혔다 — 출처: https://eliasku.win/blog/cat-survivors-js13k-2025-postmortem/
- 2025년 top 10 중 Catculus(Theme 44위), Non-Mewtonian Cat(47위), Ashes of Ulthar(60위)처럼 테마 점수가 낮아도 다른 기준이 강하면 top 10 진입이 가능했다 — 출처: https://js13kgames.com/2025/games/catculus 등 각 게임 페이지
- Ashes of Ulthar 저자는 용량 때문에 도움말 화면과 ZzFX 효과음을 잘라낸 것이 Controls 48위 추락과 이탈의 원인이었으며, 매주 zip 최종 빌드를 테스트하고 테마를 더 중심에 두라는 교훈을 남겼다 — 출처: https://7tonshark.com/posts/making-of-js13k-2025-ashes-of-ulthar/
- Triska the Ninja Cat(2025 4위) 저자는 클로버 대신 참치캔·캣닢 등을 썼어야 했다며 테마 활용 부족을 자평했고, AI로 레벨 에디터를 한 번에 생성해 프로토타이핑 속도를 높였다고 밝혔다 — 출처: https://reitgames.com/news/building-triska-the-ninja-cat
- 2025년 5위 Black Cat Squadron은 실존 WW2 미해군 야간폭격 비행대 'Black Cats'(PBY Catalina)를 소재로 한 원버튼 슈터다 — 출처: https://js13kgames.com/2025/games/black-cat-squadron
- 2024년(13회) 테마는 'Triskaidekaphobia', 187작 제출, 1위 13th Floor(Rob Louie), 2위 Coup Ahoo(Antti Haavikko), 3위 Ghosted(Jani Nykänen) — 출처: https://x.com/js13kGames/status/1842581301653622941 , https://js13kgames.com/2024/games
- 2024 우승작 13th Floor는 적이 빛을 발산해 문 밑 틈으로 새는 빛과 발소리로 위치를 알리는 HUD 없는 3D 스텔스 호러였고 Theme 1위(4.2)였다 — 출처: https://roblouie.com/article/1219/the-making-of-the-13th-floor-js13k-2024/ , https://js13kgames.com/2024/games/13th-floor
- Rob Louie는 2022년부터 같은 자작 WebGL 3D 엔진을 매년 개량하며 2022 6위(Charon Jr.), 2023 5위(Upyri), 2024 1위(13th Floor), 2025 8위(Whiskers Witch Adventure)로 4년 연속 top 10에 들었다 — 출처: https://roblouie.com/article/1316/the-making-of-whiskers-witch-adventure-js13k-2025/
- 2023년 테마는 '13th Century', 163작 제출, 1위 Path to Glory(Rémi Vansteelandt, 벨트스크롤 벳뎀업, 데스크톱·모바일 동시 1위) — 출처: https://js13kgames.com/2023/games , https://github.com/remvst/knight
- Rémi Vansteelandt는 2020(Ninja vs EVILCORP), 2023(Path to Glory), 2025(CLAWSTRIKE)로 종합 우승 3회를 기록했다 — 출처: https://js13kgames.com/2020/games , https://js13kgames.com/2023/games , https://js13kgames.com/2025/games
- Antti Haavikko는 2023 3위(Casual Crusade, Audio 1위), 2024 2위(Coup Ahoo, Audio 1위·Innovation 2위), 2025 6위(Catculus, Audio 3위)로 3년 연속 카드/주사위/타일 로그라이트 + 최상위 오디오 공식을 반복했다 — 출처: https://js13kgames.com/2023/games/casual-crusade , https://js13kgames.com/2024/games/coup-ahoo , https://js13kgames.com/2025/games/catculus
- 2022년 테마는 'Death', 167작, 1위 Dante(Salvatore Previti)는 WebGL2 캐스케이드 섀도맵·SVG 절차 텍스처·GPU 충돌감지를 쓴 단테 신곡 소재 3D 플랫포머로 종합·모바일 동시 1위였다 — 출처: https://github.com/SalvatorePreviti/js13k-2022/blob/main/post-mortem.md , https://github.blog/open-source/gaming/js13k-2022-winners/
- 2022 3위 Norman the Necromancer 포스트모템: 83개 픽셀 스프라이트를 160x70 시트에 넣고, 애니메이션 프레임 대신 트윈과 파티클로 'juice'를 만들었으며, 마지막 날은 기능 추가가 아닌 폴리시·스크린샷에 쓰라고 조언 — 출처: https://danthedev.com/norman-the-necromancer/
- 2021년 테마는 'Space', 1위 Space Garden(Ryan Malm)은 죽은 행성들에 꽃을 피우는 힐링 탐험 게임(10.73KB)으로, 액션이 아닌 게임이 우승한 드문 사례다 — 출처: https://js13kgames.com/2021/games/space-garden
- 2020년 테마는 '404', 1위 Ninja vs EVILCORP(Rémi Vansteelandt)는 매 레벨이 '404 — PLANS NOT FOUND'로 끝나는 스텔스 플랫포머, 2위 Edge Not Found는 무한 반복 격자 소코반이었다 — 출처: https://github.blog/2020-10-11-top-ten-games-from-the-js13k-2020-competition/
- 2019년 테마는 'Back', 1위 xx142-b2.exe(Ben Clark & Salvatore Previti)는 13초마다 삭제되는 AI가 이전 시도의 백트레이스(고스트)와 협동하는 타임루프 퍼즐로, 심사평은 '테마의 탁월한 사용과 거의 완벽한 실행'이었다 — 출처: https://js13kgames.com/2019/games/xx142-b2exe
- 2022년 이후 순위는 참가자·전문가 투표 기반 6개 기준(Theme/Innovation/Gameplay/Graphics/Audio/Controls) 합산 점수제이며, 2019~2021 게임 페이지에는 기준별 점수 없이 종합 순위만 표기된다 — 출처: 각 연도 게임 상세 페이지(예: https://js13kgames.com/2019/games/xx142-b2exe vs https://js13kgames.com/2025/games/clawstrike)
- 2023 4위 Tiny Yurts는 Canvas 없이 SVG+HTML+CSS만으로 만든 Mini Motorways풍 게임으로, 압축 전 소스 191KB를 Roadroller로 13KB에 압축했다 — 출처: https://js13kgames.com/2023/games/tiny-yurts
- 종합 1위와 모바일 1위가 동시 달성된 사례가 반복된다: Dante(2022), Path to Glory(2023), CLAWSTRIKE(2025) — 출처: https://github.com/SalvatorePreviti/js13k-2022/blob/main/post-mortem.md , https://x.com/js13kGames/status/1977746907859431683
- 상위권 게임의 완주 분량은 대략 10~30분: CLAWSTRIKE 클리어 기록 11~16분(심사 피드백 인증), Cat Survivors 10분 생존 런, Ghosted 12+1레벨, Triska 17레벨 — 출처: https://js13kgames.com/2025/games/clawstrike , https://js13kgames.com/2024/games/ghosted
- 전문가 심사평에서 CLAWSTRIKE의 '너무 많이 죽으면 이지모드 전환을 제안하는 팝업'이 명시적으로 칭찬받는 등, 난이도 탈출구(이지모드·즉시 리트라이·Undo)가 상위권 공통 설계다 — 출처: https://js13kgames.com/2025/games/clawstrike (Björn Ritzl 코멘트)
- 2025년 top 100 전원에게 Badlucky 마스코트 티셔츠와 주사위 세트가 배송되는 등 실물 보상은 상위 100위까지 주어진다 — 출처: https://js13kgames.com/2025/blog/winners-announced
