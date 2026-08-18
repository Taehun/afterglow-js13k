# js13k 2026 Online 카테고리 기회 분석

## TL;DR

- 과거 Server/Online 카테고리는 **전체 참가작의 3~7%**(연 7~11개)에 불과한 초저경쟁 구역이었고, 2026년 상품은 13+13개(CosmoPirates, Web Maker)이므로 **완성작을 내면 카테고리 수상은 사실상 확정**에 가깝다.
- 다만 상품 가치는 소소하며(현금 아님), 과거 Online 엔트리의 **종합 순위 중앙값은 하위 50%**다. 예외적으로 2022년 "13"(Elias Ku)이 종합 7위, "Cooking for Skully"가 19위까지 올라갔는데, 공통점은 **혼자서도 완결되는 게임 + NPC/봇**이었다.
- 투표 기간의 "빈 방 문제"는 2025년 심사평에서 반복적으로 실증됨("nobody available when I played it"). 검증된 극복책은 봇/NPC, 로컬 멀티 폴백, 오프라인 AI 시뮬레이션, 라이브 고스트다.
- **결론: Desktop/Mobile 본선용 싱글 게임을 완성하는 것을 최우선으로 하되, presence 기반의 얇은 Online 레이어(고스트/공유 낙서/월드 장식)를 병행 추가하는 것이 ROI 최적.** offline-first가 의무라서 어차피 싱글 완결이 필요하고, 릴레이 연동 자체는 저비용이다.

---

## 1. 경쟁 밀도: 과거 Server/Online 카테고리 엔트리 수 (2019~2022, 2025)

js13kgames.com 아카이브의 연도별 게임 데이터(카테고리 비트마스크)를 직접 파싱해 집계했다. 개별 게임 페이지(SWAGSHOT, Space Huggers, 13, Cooking for Skully 등)의 카테고리 표기와 교차 검증 완료.

| 연도 | 전체 엔트리 | Server/Online | 비율 | 카테고리 내 종합순위 최고 |
|---|---|---|---|---|
| 2019 | 245 | **11** | 4.5% | Backshot Tactics — 종합 19위 |
| 2020 | 227 | **10** | 4.4% | Players not found — 종합 95위 |
| 2021 | 223 | **7** | 3.1% | Operation Cleanaholeic — 종합 30위 (Yet Another MOBA 83위) |
| 2022 | 167 | **11** | 6.6% | **13 — 종합 7위**, Cooking for Skully 19위, Planet B 37위 |
| 2023~2024 | 163 / 187 | **0 (카테고리 폐지)** | — | — |
| 2025 | 197 | **7** | 3.6% | Worms 13k — 종합 55위 |

핵심 맥락:

- 구 Server 카테고리(2013~2022)는 Node.js+socket.io를 Heroku에서 돌리는 방식이었고, **2022년 Heroku 무료 티어 종료로 폐지**됐다 (출처: js13kGames 공식 dev.to 글).
- 2025년에 Cloudflare 파트너십으로 **WebSocket 릴레이 기반 Online 카테고리로 부활**했는데, 대회 시작 8일 후에야 발표된 "막차 추가"였다(Ben Allfree: "We're already 25% through this year's contest, so it's a late entry"). 그런데도 7팀이 참가했다.
- 2026년은 **처음부터 규칙이 정비된 상태로 시작하는 첫 해**다. 2025년 심사평에서 운영진(Michał Chojnacki)이 "내년에는 이 카테고리를 원래 있어야 할 수준으로 끌어올리겠다"고 예고했으므로, 참가작 수는 2025년의 7개보다는 늘겠지만 Desktop(연 150~210개) 수준과는 비교가 안 될 것이다. **(추측: 2026년 Online은 15~30개 수준)**
- 상금 구조: 2025년은 카테고리 상위 5팀 CosmoPirates + 13팀 Web Maker였는데 참가작이 7개라 **전원이 뭔가를 받았다**. 2026년은 13×CosmoPirates + 13×Web Maker.

## 2. 투표자가 멀티플레이어 게임을 평가할 때의 현실적 문제

투표는 9/14~10/4 3주간 참가자 상호 평가 + 전담 심사위원 피드백으로 진행된다. 2025년 Online 엔트리 7개 전부의 심사평을 확인한 결과, **빈 방 문제가 실제 평가에 그대로 드러났다**:

- Roll For Mischief (종합 167위): *"I'd like to see what the multiplayer aspect brings, but **there was nobody available when I played it**"* — Jasper Renow-Clarke
- Color Cat (종합 164위): *"maybe my impression of the game isn't quite fair as **nobody else was currently playing**"* — Surma. 작가 스스로도 "모든 플레이어가 검은 고양이인데 1인칭이라 **혼자면 그걸 알 수가 없다**"고 인정
- Mewsterpiece (종합 75위): *"Drew some cats, **was alone, every time i tried**. So i drew some more cats in **two browser-windows**"* — 평가자가 두 창을 띄워 셀프 멀티로 평가
- Worms 13k (종합 55위, 2025 Online 1위): *"**not much to do in it without AI bots**"*, *"2 things are missing: back-flip and **AI**"* — 봇 부재가 반복 지적됨. 반면 심사위원 Michał은 파트너와 둘이서 플레이하고 호평
- Shadow Prowler (종합 173위): *"I don't get how the online feature works **so I didn't try that**"* — 온라인 기능이 아예 시도되지 않기도 함

관찰된 극복 전략(실제 사례):

1. **NPC/봇으로 방을 채운다** — 2022 "13"(종합 7위)은 PvP 슈터지만 중립 NPC를 배치해 혼자서도 점수 플레이가 성립. Carlini의 Yet Another MOBA(2021)도 AI 미니언/타워로 상대 부재를 보완. 2025 Shadow Network는 "Offline Mode: AI cats simulate activity when not connected"를 명시
2. **로컬 멀티 폴백** — Worms 13k는 "local multiplayer, or remote multiplayer" 겸용이라 심사위원이 옆 사람과 즉석 평가 가능
3. **라이브 고스트/co-presence** — Shadow Prowler: 같은 레벨을 달리는 다른 플레이어를 "유령 고양이"로 표시, 없어도 게임은 성립
4. **판정 구조를 혼자용으로 설계** — Mewsterpiece(MMO 고양이 컬러링북)는 혼자 그려도 완결, 둘이면 "reaction between two players was instant — very impressive"(Jonathan Vallet)
5. 사이트 자체도 돕는다 — 게임 페이지 플레이 버튼에 **"PLAY (N ONLINE)" 실시간 접속자 수가 표시**되어 방문자끼리 만날 확률을 높인다

심사위원이 실제로 보는 것(2025년 심사평 기준): ① 릴레이 프로토콜 준수 여부(*"several other games simply disregarded it entirely"*라고 비준수작을 공개 지적), ② **온라인이 게임플레이에 실질 기여하는가**(Wild Catch: "Online integration works just fine technically — but didn't really feel it had any impact on the gameplay"), ③ 혼자 접속했을 때도 게임이 이해·완결되는가.

## 3. relay + 휘발성 방 구조에 맞는 검증된 디자인 패턴

2026 릴레이의 제약: 서버 로직 없음(순수 브로드캐스트 + `@ID|` DM), 방은 전원 퇴장 시 소멸, 서버 저장 없음, 데이터는 모두 제출한 13KB 코드가 생성해야 함(게임 내 에디터 산출물은 예외적으로 허용).

**적합도 높음 (검증된 사례 있음):**

- **공유 캔버스/관전 낙서**: 상태가 곧 그림이라 동기화 충돌이 없고 지연에 둔감. Mewsterpiece가 원형이며 "smooth online integration의 쇼케이스"라는 심사평. 신규 접속자에게는 기존 클라이언트가 현재 상태를 DM으로 재전송하면 됨
- **NPC 채운 io류 아레나**: "13"(2022 종합 7위)이 증명한 공식 — 봇으로 베이스라인 재미 확보, 사람이 들어오면 PvP로 승격. 단, 릴레이에는 서버 권위가 없으므로 각자 자기 캐릭터만 권위를 갖는 클라이언트 분산 방식이나 선착 클라이언트가 방장이 되는 host-authoritative가 필요 **(추측: 방장 이탈 시 `-ID` 시스템 메시지로 감지해 승계하는 설계가 자연스러움)**
- **라이브 고스트 레이스/co-presence**: 위치 브로드캐스트만으로 성립하는 최저비용 패턴(Shadow Prowler). 실패해도 싱글 게임 가치가 보존됨
- **협동 퍼즐·협동 액션**: 저빈도 이벤트 기반이라 릴레이에 적합. 단 "2인 필수" 설계는 빈 방 문제에 정면으로 노출되므로 1인 완결 + 2인 가속 형태여야 함
- **UGC/레벨 코드 교환(비동기 멀티)**: 릴레이는 저장을 안 하므로 순수 비동기(고스트 기록 영속화)는 릴레이만으로는 불가. 규칙상 게임 내 에디터로 만든 UGC는 허용되므로, **리플레이/레벨을 문자열 코드로 내보내 URL·클립보드로 공유하고, 접속 시에는 릴레이로 실시간 교환하는 하이브리드**가 규칙 적합 **(설계 제안, 추측 표시)**. localStorage로 본인 기록 보존 가능(네임스페이스 접두어 의무)

**기술 레퍼런스:**

- Carlini의 13KB MOBA 포스트모템: 서버 권위 + 클라이언트 예측, 위치 대신 "이동 함수"를 보내 대역폭 10배 절감, 시계 동기화, 서버 증가식 ID 사용 등 — 릴레이 환경에도 이식 가능한 기법들
- Ben Allfree(2026 심사위원)의 **Lab13 SDK**(github.com/benallfree/lab13): "Add Lobby and MMO capabilities to your JS13K game" — 심사위원 본인이 만든 툴킷이므로 프로토콜 관례 파악용으로 필독
- PartySocket v1.3.0은 공식 서버에서 import 시 13KB에 미포함 — 재접속·버퍼링 공짜

**안티패턴 (2025년 실증):**

- 멀티 전제 설계(혼자면 의미 불명) → Color Cat 사례
- 시스템 메시지(`@`,`+`,`-`) 미처리로 콘솔 에러 → Shadow Network가 "Non-JSON WebSocket message: @..." 버그 지적받음. 콘솔 에러는 규칙 위반 소지
- 온라인·WebGPU 등 실험 기술 중복 베팅 → Color Cat은 평가자 다수가 실행조차 못 함

## 4. 결론: Desktop/Mobile 집중 대비 Online 병행의 ROI

**비용 측면** — 병행의 한계비용이 구조적으로 낮다:
- offline-first가 의무이므로 **어차피 싱글로 완결된 게임을 만들어야 한다**. Online은 순수 추가 레이어
- presence/고스트 수준이면 코드 수백 바이트~1KB, PartySocket은 용량 무료
- 반대로 서버권위 실시간 대전(예측·보정 포함)은 Carlini가 "barely under 13kb"라 할 만큼 비싸다 — 이 방향은 비추천

**편익 측면:**
- 카테고리 상품 26개 vs 예상 엔트리 15~30개(추측) → **수상 확률이 압도적으로 높음**. 단 상품 가치는 소소(Steam 게임 키, SaaS 구독)
- **전담 심사위원 2명(Ben Allfree, Michał Chojnacki)의 정성 피드백 + 주목도**: 2025년엔 Online 전 엔트리에 장문 피드백과 워크스루 영상까지 제공됨. 참가작이 적어 한 작품당 노출이 큼
- Innovation 점수 차별화 요소(Shadow Network는 약체 게임임에도 Innovation 66위)
- 종합 순위 자체에는 Online 여부가 가점이 아님 — 2025년 종합 top 13은 전부 비-Online이었고, 종합 순위는 폴리시(그래픽·오디오·컨트롤)가 지배

**리스크:**
- 온라인에 쓰는 시간이 코어 폴리시를 잠식하면 종합 순위 손해(과거 Online 중앙값 하위 50%가 방증)
- 멀티 의존 설계 시 빈 방 문제로 Gameplay 점수 하락
- "규칙이 언제든 바뀔 수 있는" 실험 카테고리라는 명시적 유동성

**권고:**
1. 1~3주차: Desktop/Mobile 본선 기준으로 싱글 완결 게임을 폴리시 포함해 완성 (종합 top 100 = 티셔츠+가젯 라인이 실질 목표)
2. 마지막 주: presence 기반의 얇은 Online 레이어 추가 — 고스트/공유 흔적/협동 낙서처럼 **혼자여도 아무것도 잃지 않고, 둘이면 확실히 좋아지는 것**. `+`/`-` 시스템 메시지 처리와 프로토콜 준수를 데모 가능하게
3. 심사 대비: 봇 또는 로컬 2인 폴백 중 하나를 반드시 넣어 "빈 방에서도 온라인 기능의 가치가 보이게" 할 것
4. 피해야 할 것: 서버권위가 필요한 실시간 대전 코어, 멀티 전제 설계, 실험 기술 중복 베팅

이 전략이면 Online 병행은 **낮은 추가 비용으로 카테고리 수상 확률 + 전담 심사위원 피드백 + Innovation 차별화**를 얻는 비대칭 베팅이다.

## KEY FACTS
- 2026 Online 카테고리 규칙: 공식 WebSocket 릴레이(브로드캐스트 + @ID DM + 접속/이탈 시스템 메시지), 방은 휘발성·서버 무저장, offline-first 의무(온라인 기능은 옵션이어야 함), PartySocket v1.3.0 공식 서버 import 시 13KB 미산입, 상품 13×CosmoPirates + 13×Web Maker, 전담 심사위원 Ben Allfree·Michał Chojnacki 2명 — https://js13kgames.com/online
- 과거 Server/Online 카테고리 엔트리 수: 2019년 11/245, 2020년 10/227, 2021년 7/223, 2022년 11/167, 2023~2024년 0(폐지), 2025년 7/197 — js13kgames.com 연도별 아카이브 데이터 파싱(https://js13kgames.com/2019/games ~ /2025/games, 데이터 파일 https://js13kgames.com/2019.js 등), 개별 게임 페이지 카테고리 표기로 교차 검증
- 구 Server 카테고리(Node.js+socket.io+Heroku, 클라+서버 합산 13KB)는 2022년 Heroku 무료 티어 종료로 폐지, 2025년 Cloudflare 릴레이 기반 Online으로 부활 — https://dev.to/js13kgames/online-category-with-websocket-relay-in-js13kgames-2025-24dh, https://github.com/js13kGames/js13kserver
- 2025년 Online 카테고리는 대회 시작 8일 후 늦게 발표됨(Ben Allfree: 'We're already 25% through this year's contest, so it's a late entry') — https://x.com/benallfree/status/1958474963532591395
- 2025 Online 7개 엔트리의 종합 순위(197개 중): Worms 13k 55위, Mewsterpiece 75위, Wild Catch 99위, Shadow Network 148위, Color Cat 164위, Roll For Mischief 167위, Shadow Prowler 173위 — 각 게임 페이지(https://js13kgames.com/2025/games/worms-13k 등)
- 빈 방 문제 실증: Roll For Mischief 심사평 'there was nobody available when I played it'(Jasper Renow-Clarke) — https://js13kgames.com/2025/games/roll-for-mischief; Color Cat 'nobody else was currently playing'(Surma) — https://js13kgames.com/2025/games/color-cat; Mewsterpiece 'was alone, every time i tried. So i drew some more cats in two browser-windows'(Christoph Schansky) — https://js13kgames.com/2025/games/mewsterpiece
- Worms 13k(2025 Online 중 최고 성적, 종합 55위)는 로컬 멀티 폴백 덕에 평가 가능했으나 'not much to do in it without AI bots' 등 봇 부재 지적을 반복해서 받음 — https://js13kgames.com/2025/games/worms-13k
- 심사위원 Michał Chojnacki는 Wild Catch에 '여러 다른 게임들이 릴레이 프로토콜을 무시하고 재발명했다'고 언급하며 프로토콜 준수를 평가에 반영했고, 'Online integration works just fine technically - but didn't really feel it had any impact on the gameplay'라고 게임플레이 기여도를 평가함 — https://js13kgames.com/2025/games/wild-catch
- 2022년 '13'(Elias Ku)은 Server 카테고리 소속으로 종합 7위 달성 — P2P 멀티 top-down 슈터에 중립 NPC를 배치해 혼자서도 플레이 성립(NPC 킬 +1점, 플레이어 킬 +10점) — https://js13kgames.com/2022/games/13, https://github.com/eliasku/13
- Nicholas Carlini의 Yet Another MOBA(2021 Server, 종합 83위) 포스트모템: 서버 권위 + 클라이언트 예측, 위치 대신 이동 함수를 전송해 대역폭 약 10배 절감, AI 미니언/타워로 상대 부재 보완 — https://nicholas.carlini.com/writing/2021/javascript-moba-13k.html
- Shadow Network(2025)는 'Offline Mode: AI cats simulate activity when not connected'로 오프라인 봇 시뮬레이션 패턴을 사용했고, 릴레이 시스템 메시지(@ 접두어)를 JSON으로 파싱하다 'Non-JSON WebSocket message' 에러를 지적받음 — https://js13kgames.com/2025/games/shadow-network
- Shadow Prowler(2025)는 라이브 고스트 패턴('see other players as ghostly cats racing through the same level in real-time') 사용 — https://js13kgames.com/2025/games/shadow-prowler
- 2026 심사위원 Ben Allfree는 Online 카테고리를 처음 추진한 인물로, 로비·MMO 기능 SDK인 Lab13을 공개함('Add Lobby and MMO capabilities to your JS13K game') — https://github.com/benallfree/lab13, 공로 언급: https://js13kgames.com/2025/games/mewsterpiece 의 심사평
- 심사위원 Michał Chojnacki가 2025년 Mewsterpiece 심사평에서 2026년 Online 카테고리 강화를 예고: 'by that time we will have put more time and effort in getting this category to where it should have been from the start' — https://js13kgames.com/2025/games/mewsterpiece
- js13k 게임 페이지의 플레이 버튼에는 실시간 접속자 수('PLAY (N ONLINE)')가 표시되어 방문자 매칭을 도움 — https://js13kgames.com/2025/games/worms-13k 등 Online 게임 페이지
- 2025년 전체 197개 엔트리, 종합 1위 CLAWSTRIKE(Rémi Vansteelandt), 종합 top 13에 Online 엔트리 없음 — https://dev.to/js13kgames/js13kgames-2025-winners-announced-20nl
- 2026 대회 일정: 제출 8/13~9/13, 투표 9/14~10/4, 테마 'Unicorns and Rainbows', 종합 top 100은 티셔츠+가젯 — https://js13kgames.com/rules, https://js13kgames.com/prizes
- Online 규칙상 UGC는 '게임 자체로 만든 콘텐츠(예: 레벨 에디터)'만 입력으로 허용되며, 릴레이는 데이터를 저장하지 않으므로 영속적 비동기 멀티(고스트 기록 보존)는 릴레이만으로는 불가 — https://js13kgames.com/online (이를 활용한 URL/코드 공유 하이브리드는 본 보고서의 설계 제안/추측)
- 2026년 Online 예상 엔트리 수 15~30개는 추측이며, 근거는 2025년 7개(늦은 발표) 대비 정식 편성·규칙 정비·심사위원 확대라는 정황뿐임
