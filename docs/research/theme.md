# js13k 2026 "Unicorns and Rainbows" 테마 해석 방향 조사

조사 시점: 2026-08-18 (대회 시작 8/13, 마감 9/13). 출처는 각 절에 명시. **추측인 부분은 [추측]으로 표시.**

---

## 1. 주최측이 보낸 시그널 (공식 발표문 분석)

공식 발표문(https://js13kgames.com/blog/competition-has-started, Andrzej Mazur, 8/13)의 핵심:

- **테마 기원**: "It all started last year when Xem mentioned **fun** as a factor when judging entries." — 작년(2025) 심사에서 Xem이 '재미(fun)'를 평가 요소로 언급한 것이 계기. 즉 이 테마는 **"올해는 밝고 재밌는 게임을 보고 싶다"는 심사 성향의 선언**이기도 하다.
- **해석 자유 명시**: "unicorns as main characters, rainbows in the background, make the game kid friendly, **or create the evil unicorns wreaking havoc and bringing the apocalypse** — All up to you."
- 시사점: **주최측이 '악당 유니콘 아포칼립스'라는 다크 반전을 발표문에서 먼저 제시해 버렸다.** 다크 반전은 이제 '반전'이 아니라 두 번째로 뻔한 선택지가 됐다. [추측: 다크 트위스트 엔트리가 대량 나올 것]
- 카테고리: Desktop / Mobile / **Online(정식화)** / WebXR / **Wavedash(신설, 상금 $1,500)** / Unfinished. 평가 기준은 Theme, Innovation, Gameplay, Graphics, Audio, Controls 6개(게임 목록 정렬 옵션 기준).

---

## 2. 역대 js13k: "정공법" vs "반전/펀(pun)/다크 해석" 상위작 성적

연도별 게임 목록(Overall 정렬)을 js13kgames.com에서 직접 확인한 결과.

### 정공법(테마를 배경/스킨으로 삼고 완성도로 승부)이 우승한 사례
| 연도/테마 | 게임 | 성적 | 해석 방식 |
|---|---|---|---|
| 2025 Black Cat | **CLAWSTRIKE** (Rémi Vansteelandt) | 종합 1위 + Theme/Graphics/Audio 부문 1위 | 검은 고양이가 주인의 복수를 하는 die-and-retry 액션. 테마는 주인공 스킨, 승부는 게임필·폴리시 |
| 2025 | **Cat Survivors** (Elias Ku 외) | 종합 2위, Gameplay/Controls 1위 | Vampire Survivors 클론에 고양이 스킨 — 검증된 장르 + 테마 스킨 |
| 2023 13th Century | **Path to Glory** (Rémi Vansteelandt) | 종합 1위 | 중세 배경 정공법 |
| 2022 Death | **Dante**(Salvatore Previti) 1위, **Dying Dreams** 2위, **Norman the Necromancer** 3위 | 1~3위 | 어두운 테마를 그대로 어둡게 — 정공법 스윕 |
| 2018 Offline | **UNDERRUN** (Dominic Szablewski) | 종합 1위 | 시스템이 오프라인이 된 지하 시설 — 테마 결합은 느슨, 기술·연출로 압승 |

### 반전/말장난/개념 해석이 상위권에 오른 사례
| 연도/테마 | 게임 | 성적 | 해석 방식 |
|---|---|---|---|
| 2020 "404" | **Edge Not Found** (Tom Hermans) | 종합 2위 | "edge not found" 말장난을 **무한 반복 그리드 소코반 메커닉**으로 변환 — 펀→메커닉의 교과서 |
| 2020 | **I want to google the game** (Mark Vasilkov) | 8위 | 검색/404 개념 자체를 게임화 |
| 2021 Space | **Space Garden** (Ryan Malm) | 종합 1위 | 우주 테마의 디폴트(슈터)를 뒤집은 **코지/힐링 트위스트** — '죽은 행성에 꽃을 피우는 수분(pollinator) 워킹심'. 밝은 해석이 우승한 대표 사례 |
| 2025 Black Cat | **Black Cat Squadron** (Jesper Rasmussen) | 5위 | 실존 WW2 미 해군 'Black Cat' 야간 폭격 비행대 소재 — **리서치 기반 측면 해석** |
| 2025 | **Celestial Paws** (Daniel Cohen) | 12위권 | "스칸디나비아에선 검은 고양이가 행운"이라는 반전 사실을 소재로 — 클리셰(불운) 뒤집기 |
| 2025 | **Catculus** (6위), **Non-Mewtonian Cat** (7위) | 6~7위 | 말장난(cat+calculus, non-Newtonian)을 퍼즐 메커닉으로 |
| 2018 Offline | **Off The Line** (Bryan Perfetto) | 9위 | "선(line)에서 뛰어내린다"는 말장난 아케이드 |
| 2018 | **The Chroma Incident** (Ryan Malm) | 5위 | "색이 오프라인이 됐다"(작가 스스로 'shameless theme plug'라 표현) — **무지개 테마와 직결되는 색 복원 트윈스틱 슈터 선례** |
| 2025 | **Ashes of Ulthar** (Elliot Nelson) | 10위 | 러브크래프트 「울타르의 고양이」 기반 으스스한 해석 — 귀여운 테마 해에 다크 해석으로 톱10 |

### 반례(테마 무시의 한계)
- 2021 **Q1K3** (Dominic Szablewski, Quake 데모): 기술적으로 그 해 최대 화제작이었지만 'Space' 테마 결합이 약해 **종합 15위**. 테마 점수는 6개 평가축 중 하나라 무시하면 종합 우승은 어렵다.

### 패턴 요약
1. **우승은 대부분 '테마=스킨 + 압도적 완성도(게임필/그래픽/오디오)' 조합** — 특히 Rémi Vansteelandt(2020·2023·2025 우승)가 이 공식의 최강자.
2. **펀→메커닉 변환형은 Innovation 부문과 종합 2~9위권을 안정적으로 가져감** (Edge Not Found 2위가 최고 기록).
3. **귀여운 테마 해(2025 Black Cat)에도 다크 해석은 톱10에 들었지만 우승은 못 함** — 우승·2위·3위 모두 테마를 긍정적으로 껴안은 작품.
4. 2025는 2026과 가장 유사한 '동물/귀여움' 계열 테마라 참고 가치가 가장 높음.

---

## 3. 커뮤니티 반응 (8/13 발표 후 ~ 8/18)

### 공식 채널 반응 규모
- **X(@js13kGames) 테마 발표 트윗** (https://x.com/js13kGames/status/2087856698358993387): 조회 표시 약 10만, 리포스트 21, 좋아요 61, 답글 9 (8/18 렌더링 기준. 답글 내용은 로그인 장벽으로 대부분 비공개, 확인된 답글은 Grzegorz Tańczyk의 GIF 정도).
- **Mastodon 발표 포스트** (https://mastodon.gamedev.place/@js13kGames/117087858348412717): 부스트 7, 즐겨찾기 7.
- **dev.to 발표글** (https://dev.to/js13kgames/the-js13kgames-2026-competition-has-started-2n53): 댓글 0 (8/18 기준).
- **Reddit(r/gamedev 등)**: 8/18 기준 2026 테마 관련 스레드가 검색에 잡히지 않음(직접 접근은 네트워크 차단으로 실패, 검색 인덱스에도 없음). **아직 레딧 논의는 사실상 없다**고 보는 게 정확.
- **Slack/Discord**: 발표문이 브레인스토밍 장소로 안내하나 비공개라 내용 확인 불가.

### 실제 아이디어/데브로그 챗터 (Mastodon #js13k 태그, 확인된 전부)
- **Remvst(= Rémi Vansteelandt, 디펜딩 챔피언)**: Day 1 "no unicorns yet, but we have physics" → Day 3 "Unicorns are a thing. Tomorrow, rainbows" → Day 4 "rainbows and **crash animations**" → Day 5 "colors and visual details, 파일 87%". **물리 + 크래시 애니메이션 기반 유니콘 게임을 5일 만에 87%까지 진행** [추측: 탈것/돌진 계열 물리 액션]. (https://mastodon.gamedev.place/@Remvst)
- **fabiosantoscode** (2024 "Please Finish In 13th Place" 작자): "**Shadow of the Colossus처럼 여러 종류의 끔찍한 유니콘을 사냥하는 게임**"을 구상 중이나 3D·물리에 자신 없다고 — **다크 해석 자리는 이미 Day 1부터 선점 경쟁 중**. (https://mastodon.social/@fabiosantoscode)
- **Alex_ADEdge**: 작년 말 만든 3D/셰이더/모바일 템플릿 리팩터로 시작, 53.9% 사용, "For once I don't have a specific game idea in mind". "Fun theme this year as always!" (https://mastodon.social/@Alex_ADEdge)
- **snukey**: 참가 의사 + "And of course no F-ing Claude" — **AI 코드 생성에 대한 반감**이 커뮤니티 일부에 존재한다는 신호. (https://mastodon.social/@snukey)
- 전반적 톤: 테마에 대한 반발 없이 호의적("Fun theme"). 발표문의 "not the usual death, destruction, doom and gloom" 노선이 그대로 수용되는 분위기.

---

## 4. 유니콘/무지개 클리셰 지도 — 피해야 할 것

이 소재의 기존 게임 지형(외부 레퍼런스):

| 클리셰 | 근거 | 위험도 |
|---|---|---|
| **무지개 트레일 유니콘 엔드리스 러너/대시** | Robot Unicorn Attack(2010, Adult Swim — 첫 주 100만 플레이, Erasure 'Always')과 무수한 모바일 클론(Unicorn Dash, Flappy Super Unicorn 등) (https://en.wikipedia.org/wiki/Robot_Unicorn_Attack) | 최고. 가장 먼저 떠오르는 아이디어 = 가장 많이 나올 아이디어 [추측] |
| **아이러니한 '메탈/악마 유니콘'** | RUA 'Heavy Metal' 에디션이 이미 존재 + 주최측이 발표문에서 'evil unicorns apocalypse'를 직접 제안 + fabiosantoscode가 Day1에 유니콘 사냥 SotC 구상 | 높음. '반전'이 아니라 제2의 정공법이 됨 |
| 파스텔 캔디랜드 점프 게임 (Charlie the Unicorn/캔디마운틴, Pink Fluffy Unicorns Dancing on Rainbows 밈 계열) | https://en.wikipedia.org/wiki/Pink_Fluffy_Unicorns_Dancing_on_Rainbows | 중~높음 |
| Nyan Cat식 무지개 궤적 밈 그래픽 | 2011 밈, 수많은 오마주 | 중 |
| **'유니콘 스타트업' 풍자** (기업가치 $1B, Aileen Lee가 2013년 명명) | 개발자 청중인 잼 특성상 누구나 떠올릴 말장난 — 클리커/인크리멘털 풍자 다수 예상 [추측] | 중~높음 |
| 무지개 끝 금항아리/레프러콘 수집 게임 | 아일랜드 민담 | 중 |
| Rainbow Road식 레이싱 오마주 | Mario Kart | 중 |
| **회색 세계에 색을 되돌리는 게임** | 메인스트림(Gris, de Blob, Hue)에 더해 **js13k 내부에서도 기출**: The Chroma Incident(2018, 5위), Gamut Shift(2021) | 중. js13k 심사자들이 이미 본 문법 |

참고로 js13k에서 흔히 겹치는 장르 자체의 클리셰도 있음: 2024~2025 상위권에 서바이버류/러너가 여럿(Cat Survivors, Xiicur Surviivors 등) — 서바이버류+유니콘 스킨도 다수 예상 [추측].

---

## 5. 알고리즘적/기계적 해석 카탈로그 (빈 공간 후보)

### 무지개 = 광학/스펙트럼 (물리 사실 기반)
- **관측자 의존성**: 무지개는 물체가 아니라 관측자–태양–물방울의 기하(반태양점 기준 42° 원뿔, 2차 무지개는 51°·색 순서 반전). → **"내가 서 있는 위치에 따라 무지개가 이동한다", "무지개 끝에는 절대 도달할 수 없다"는 것 자체를 퍼즐/추격 메커닉으로**. 시점 이동 퍼즐(Monument Valley 계열의 광학 버전)은 js13k 기출에 없음 — 빈 공간.
- **프리즘/분산**: 백색광→7색 분해, 렌즈/굴절(스넬 법칙) 광선 퍼즐. 단, Chromatron 등 라이트빔 퍼즐 장르 선례가 많아 '광선 반사 퍼즐' 그 자체는 반쯤 기출 — **빗방울을 동적 렌즈로 쓰거나, 분해된 색마다 다른 게임 규칙을 부여**하면 신선.
- **가시광 밖 스펙트럼**: IR/UV 등 '보이지 않는 색' 레이어 — 파장을 튜닝해 같은 레벨의 다른 층을 보는 메커닉. Innovation 점수 노리기 좋은 빈 공간.
- **가산(RGB) vs 감산(CMY) 색 혼합**: 빛과 물감의 혼합 규칙이 다른 것을 이중 규칙 퍼즐로.
- **색↔음 시네스시지아**: ROYGBIV 7색 ↔ 7음계 매핑 — Audio 평가축과 시너지. 13KB에서 절차적 오디오(SoundBox/ZzFX 관행)와 궁합이 좋음.
- **기상 조건**: 무지개 = 비와 해가 동시에 필요 → 상반된 두 자원을 동시에 유지하는 밸런싱 메커닉.
- **실용적 이점**: HSL hue 회전만으로 무지개 팔레트가 공짜로 나옴 — 13KB 용량 제약과 테마의 궁합이 이례적으로 좋음.

### 유니콘 = 희소성/전설/뿔 (개념·전승 기반)
- **희소성 그 자체**: '유니콘'은 게임 용어로 초희귀 드랍/1-in-N 스폰. → 초레어 스폰을 추적하는 게임, 드랍률/가챠 구조 자체의 게임화. 개발자 청중에게 직관적으로 통하는 메타 해석.
- **크립티드/목격담**: 아무도 실물을 못 본 전설의 동물 — 절차 생성된 '목격 증거'를 조합해 실체를 추론하는 수사/탐사물. The Last Unicorn(1982)의 '마지막 남은 개체' 멜랑콜리도 이 축 — 다크가 아니라 **애수(elegiac)** 톤은 빈 공간.
- **중세 동물지(bestiary) 전승**: ① 뿔이 독을 정화한다 → 오염된 수원을 정화하는 메커닉, ② 순수한 자에게만 다가온다 → **힘으로는 잡을 수 없는 대상(신뢰 쌓기/무폭력 스텔스)** — '사냥' 해석의 정반대라 차별화됨.
- **뿔 = 나선 기하**: 유니콘 뿔의 나선(및 '바다의 유니콘' 일각고래) → 로그 나선/드릴/코르크스크류 이동 메커닉.
- **비프뢰스트(Bifröst)**: 북유럽 신화의 무지개 다리 — 무지개를 '건너는 구조물(아치/포물선 다리 놓기)'로 쓰는 물리 퍼즐. Rainbow Islands(1987, Taito — 무지개를 발판이자 무기로 사용)가 유일한 굵은 선례인데 40년 전 게임이라 클리셰라기보다 재발굴 대상.
- **결합 해석**: 유니콘(초희귀) × 무지개(관측자 의존, 도달 불가) — "볼 수는 있지만 잡을 수 없는 것"이라는 공통 구조가 있음. 두 소재를 하나의 메커닉으로 통합하면 Theme 점수에서 유리 [추측].

---

## 6. 전략 제언 [추측 포함]

1. **우승 공식은 불변**: 테마를 밝게 껴안은 스킨 + 즉각 재시작되는 타이트한 게임필 + 절차적 오디오. 단 이 레인은 Remvst가 이미 물리 유니콘 게임으로 5일차 87%까지 달리는 중.
2. **다크 반전은 이미 혼잡**: 주최측이 발표문에서 제안했고 참가자가 Day 1부터 구상 중. 하려면 '으스스한 전승'(Ashes of Ulthar 노선)처럼 리서치 깊이로 차별화해야 함.
3. **Innovation 상위권을 노린다면**: 펀→메커닉 변환(Edge Not Found 공식) — '무지개는 관측자마다 다르게 보인다/끝에 도달할 수 없다', '유니콘은 1-in-N이다' 같은 **정의 자체를 규칙으로 만드는** 해석이 역대 데이터상 가장 가성비 좋음.
4. **'fun' 시그널을 진지하게**: 테마 기원이 심사평의 '재미'였으므로, 냉소적·우울한 해석은 올해 심사 분위기와 역행할 위험 [추측].
5. AI 생성 코드에 대한 커뮤니티 일부의 반감(snukey 발언)이 존재 — 데브로그 공개 시 톤 주의 [추측 아님, 단일 사례에 기반한 약한 신호].


## KEY FACTS
- js13k 2026(제15회) 테마는 'Unicorns and Rainbows'로 2026-08-13 발표, 마감은 9/13 — 출처: https://js13kgames.com/blog/competition-has-started
- 테마 기원: 주최자 Andrzej Mazur가 '작년 심사에서 Xem이 fun(재미)을 평가 요소로 언급한 것'이 계기라고 명시 — 출처: https://js13kgames.com/blog/competition-has-started
- 주최측이 발표문에서 해석 예시로 '유니콘 주인공, 배경 무지개, 키드 프렌들리' 외에 'evil unicorns wreaking havoc and bringing the apocalypse'(악당 유니콘 아포칼립스)를 직접 제안 — 출처: https://js13kgames.com/blog/competition-has-started
- 2026 카테고리: Desktop/Mobile/Online/WebXR/Unfinished + 신설 Wavedash(상위 3팀 총 $1,500) — 출처: https://js13kgames.com/blog/competition-has-started, https://mastodon.gamedev.place/@js13kGames/117084645046110781
- X 테마 발표 트윗은 8/18 기준 조회 표시 약 10만·리포스트 21·좋아요 61·답글 9 — 출처: https://x.com/js13kGames/status/2087856698358993387
- Mastodon 발표 포스트는 부스트 7·즐겨찾기 7, dev.to 발표글 댓글 0, Reddit에는 8/18 기준 2026 테마 스레드가 검색되지 않음 — 출처: https://mastodon.gamedev.place/@js13kGames/117087858348412717, https://dev.to/js13kgames/the-js13kgames-2026-competition-has-started-2n53
- 2025 우승자 Rémi Vansteelandt(Remvst)가 물리+크래시 애니메이션 기반 유니콘/무지개 게임을 데브로그 중(Day5에 파일 87%) — 출처: https://mastodon.gamedev.place/@Remvst (2026-08-15~18 포스트)
- 참가자 fabiosantoscode는 'Shadow of the Colossus처럼 끔찍한 유니콘들을 사냥하는 게임'을 구상 — 다크 해석이 Day 1부터 등장 — 출처: https://mastodon.social/@fabiosantoscode (2026-08-13 포스트, #js13k 태그)
- 2025 'Black Cat'(2026과 가장 유사한 귀여운 동물 테마) 종합 1~3위는 CLAWSTRIKE, Cat Survivors, Witchcat으로 모두 테마를 긍정적으로 수용한 정공법 — 출처: https://dev.to/js13kgames/js13kgames-2025-winners-announced-20nl, https://js13kgames.com/2025/games
- CLAWSTRIKE는 2025 종합 1위이면서 Theme(4.24)/Graphics/Audio 부문도 1위 — 정공법+완성도 조합의 대표 사례 — 출처: https://dev.to/js13kgames/js13kgames-2025-criteria-rankings-3ao0
- 펀→메커닉 반전 해석의 최고 성적: 2020 '404' 테마에서 Edge Not Found(무한 그리드 소코반)가 종합 2위 — 출처: https://js13kgames.com/2020/games/edge-not-found
- 밝은 반전 해석의 우승 사례: 2021 'Space'에서 코지 게임 Space Garden(죽은 행성에 꽃을 피우는 워킹심)이 종합 1위 — 출처: https://js13kgames.com/2021/games/space-garden
- 리서치 기반 측면 해석 사례: 실존 WW2 미 해군 Black Cat 비행대 소재의 Black Cat Squadron이 2025 종합 5위 — 출처: https://js13kgames.com/2025/games/black-cat-squadron
- 테마 무시의 한계: Quake 데메이크 Q1K3(2021)는 화제성에도 불구하고 Space 테마 결합이 약해 종합 15위 — 출처: https://js13kgames.com/2021/games (Overall 정렬)
- '색을 되돌리는' 무지개 인접 메커닉은 js13k 기출: The Chroma Incident가 2018 'Offline'에서 종합 5위 (작가 스스로 'shameless theme plug'라 표현) — 출처: https://js13kgames.com/2018/games/the-chroma-incident
- 유니콘+무지개 최대 클리셰인 Robot Unicorn Attack(2010, Adult Swim)은 무지개 트레일 엔드리스 러너로 첫 주 100만 플레이, 이후 Heavy Metal 에디션 등 다수 후속·클론 존재 — 출처: https://en.wikipedia.org/wiki/Robot_Unicorn_Attack
- 커뮤니티 일부에 AI 생성 코드 반감 존재: 참가자 snukey가 발표 리플라이에서 'no F-ing Claude'라 언급 — 출처: https://mastodon.social/@snukey (2026-08-14, mastodon.gamedev.place #js13k 타임라인)
- 8/18 기준 2026 games 페이지 등록 엔트리 0개(제출 폼은 시작 며칠 후 오픈 예정으로 공지) — 출처: https://js13kgames.com/2026/games, https://js13kgames.com/blog/competition-has-started
