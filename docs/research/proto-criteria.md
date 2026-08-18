# criteria 총평
프로토타입으로서는 상위 수준이다. 코어 루프(드래그→양자화 포물선→망아지 보행) 검증 완료, 3레벨 E2E 통과, zip 7,590B로 예산의 57%만 사용해 5,722B의 전략적 여유를 확보했다. 항목별 현황: [Theme] 무지개 축은 메카닉 하중을 완전히 받지만(발판/경사로/우산) 유니콘 축은 장식에 머물러 3층 통합(서사+아트+메카닉)의 우승 공식 중 '유니콘 메카닉'과 '서사' 층이 비어 있다 — 심사평 "bolted on" 리스크가 남은 유일한 지점. [Innovation] 어시스트 드로잉+잉크 경제는 신선하나 아치의 '모양'이 결과에 영향을 주지 않아(내리막 가속/미끄럼틀 미구현) 그리기가 아직 이진적(연결됨/안 됨) 퍼즐이다. [Gameplay] 3레벨 2~3분 분량은 심사 세션(10분+) 대비 짧고, 망아지 대기 시간의 데드타임이 있으며, 비의 위협이 스턴 0.9초로 이빨이 없다. [Graphics] 프로시저럴 망아지·파티클·글로우는 이미 상위권 어휘("juice")를 충족하나 3레벨이 전부 같은 팔레트라 레벨별 컬러 변주(CLAWSTRIKE 패턴)가 없다. [Audio] 펜타토닉 어댑티브 3레이어+글리산도 하프는 설계가 우수하나 타악 부재·단일 음색으로 10분 청취 시 단조롭고, L3 폭풍에서 무드 전환이 없다. [Controls] 드래그 단일 입력은 터치 네이티브로 우수하나 지우기(탭)를 가르치는 온보딩이 없고(Ashes of Ulthar Controls 48위 선례), Undo 부재, 게임패드 미지원(2025 최다 반복 불만). 결론: '지금(프로토 단계)' 고칠 것은 코어 규칙에 영향을 주는 4가지(내리막 슬라이드, 유니콘 메카닉 결정, 지우기 온보딩+Undo, 페이싱)이고, 나머지(게임패드·이지모드 팝업·레벨 확장·음악 편곡·엔딩·메타)는 본선(8/27~)으로 미루되 바이트 여유가 충분하므로 전부 계획에 포함할 가치가 있다.

## [high/small] [지금] 내리막 슬라이드/가속 — 아치 '모양'이 플레이에 의미를 갖게
IDEAS.md에 명시된 아치 3용도 중 '미끄럼틀'이 미구현 상태다. 현재 foals.js의 걷기 속도는 표면 기울기와 무관하게 FOAL_VX 고정이라 아치를 어떻게 그리든 결과가 같다 — Innovation/Gameplay 갭의 핵심. 구현: src/game/foals.js 걷기 분기에서 현재 밟은 표면의 기울기 s를 구하고(아치면 arcY(a,x+2)-arcY(a,x-2))/4, 지면이면 0), dir*s>0(내리막)이면 이동 배율 1+min(1,|s|*1.2), 오르막이면 max(0.55, 1-|s|*0.8)을 적용한다. arcs.js의 arcSurfaces가 y값만 반환하므로 [y, arc|null] 쌍을 반환하도록 확장하거나 slopeAt(x,y) 헬퍼를 추가. 내리막 가속 중 발밑에 fx.js glint 파티클 + f.phase 가속, 최속 구간에서 music.js pluck 1노트. 이걸 넣어야 '높고 가파른 아치 vs 낮고 긴 아치'가 잉크 비용·도착 시간의 트레이드오프가 되는지 — 즉 킬 기준으로 잡은 '손맛'의 마지막 조각 — 을 프로토에서 검증할 수 있다.

## [high/medium] [지금] 유니콘 축 메카닉 결정 — 테마 3층 통합의 빈 층 메우기
현재 망아지는 뿔만 달린 레밍이라 '아무 동물'로 치환해도 게임이 성립한다. winners.md의 우승 공식(Theme 1위=종합 1위, 2024·2025 연속)은 테마가 메카닉 하중을 받는 것이고, ARCLIGHT 선정 근거 자체가 '유니콘·무지개 양 축이 모두 메카닉 하중을 받는 유일한 후보'였다. 본선에서 뒤늦게 넣으면 레벨 디자인 재작업이 되므로 프로토 단계에서 규칙을 확정해야 한다. 후보 3안 중 1개를 실험: (a) 망아지가 아치를 처음 건널 때 밴드가 반짝이며 잉크 15% 환급(아치당 1회) — '유니콘이 무지개를 충전한다', 잉크 경제와 맞물림(추천); (b) 비 침식 기믹과 결합해 망아지가 밟는 동안 아치 침식이 회복됨; (c) 최소안 — 구조 시 게이트에서 하늘로 무지개 궤적을 그리며 승천하고 궤적이 배경에 누적(judge-voter.md가 권고한 'C안 누적 비주얼 이식'과 일치). 코드 위치: src/game/foals.js updateFoals의 표면 판정부 + src/game/game.js 잉크 처리.

## [high/small] [지금] 지우기 온보딩 + Undo(Z) — Controls 최저비용 방어
탭=지우기(잉크 환급)는 이 게임의 난이도 탈출구인데 가르치는 순간이 전혀 없다 — 도움말 부재로 Controls 48위로 추락한 Ashes of Ulthar 선례가 있는 갭. 구현 3개: ① src/game/levels.js L2 hint를 'Arches make fine ramps. Tap a rainbow to take its light back.'으로 교체. ② src/game/game.js에서 inkFlash 발동 시(잉크 부족 시도) 화면 하단에 'Tap an old rainbow to reclaim its light' 토스트를 2초 표시(drawHud에 인자 추가). ③ keysJust 'KeyZ'로 마지막 아치 undo(arcs 마지막 요소 제거→ink 환급→eraseNote 재생) 추가, 인트로 카드 하단에 'Z undo · R retry · M mute' 1줄 표기. Undo는 Non-Mewtonian Cat(Controls 2위)·Gravity Cat(Controls 5위)에서 심사평에 직접 인용된 검증 요소다.

## [medium/small] [지금] 데드타임 페이싱 — 심사 10분 세션 최적화
망아지 55px/s + 스폰 간격 1.35초 x 5마리라, 아치를 다 그린 뒤 심사자가 수십 초를 구경만 하는 구간이 생긴다(플레이테스트 스크린샷에서도 확인됨). 상위권 심사 세션은 5~10분이므로 데드타임은 직접 감점 요인. 구현: src/game/game.js play 상태에서 ptr.down 상태로 0.4초 이상 이동 없이 홀드 중이고 preview.arc가 null이면 시간 배속 — 고정 타임스텝 구조상 update를 프레임당 2~3회 추가 호출하는 방식이 안전(loop.js 수정 없이 game.js update 안에서 updateFoals/updateRain/updateFx만 반복 호출해도 됨). 배속 중 화면 가장자리에 '>>' 인디케이터. 최소안: foals.js wait 간격 1.35→0.9초, FOAL_VX 55→65 재튜닝. 슬라이드 가속(제안 1)과 함께 튜닝할 것.

## [high/medium] [본선] 이지모드/힌트 팝업 — 심사평에 인용되는 기능
CLAWSTRIKE의 '연속 사망 시 Easy Mode 전환 팝업'은 전문가 심사평(Björn Ritzl)에 직접 인용된, 문서화된 득표 포인트다. ARCLIGHT 번역: src/game/game.js에 레벨별 retryCount·경과시간 추적을 추가하고, retry 3회 또는 120초 경과 시 카드 팝업 'Need a hint?'를 표시 → 수락하면 levels.js의 Level 타입에 추가한 solution: [x0,y0,x1,y1,h][] (레벨당 정답 아치 배열)를 알파 0.25 유령 아치로 렌더(drawArc alpha 인자 재사용). 거절 시 해당 레벨에서 다시 묻지 않음. 잉크 부족 실패가 잦으면(inkFlash 3회+) '잉크 +25%' 제안도 함께. 레벨 데이터에 정답을 넣는 구조라 레벨 수가 늘어도 비용이 선형이다.

## [medium/medium] [본선] 게임패드 지원 — 2025 최다 반복 불만 해소
catalog2025.md 실측: 게임패드 미지원이 상위권 심사평 최다 반복 불만(CLAWSTRIKE에 최소 4명 요청), 지원작(Whiskers, Non-Mewtonian Cat)은 명시적 호평. 드로잉 게임이라 공짜는 아니지만 ptr 추상화 덕에 게임 코드 무수정으로 가능: src/engine/input.js에 navigator.getGamepads() 폴링을 추가(매 틱, endFrame 직전). axes[0,1]→가상 커서 이동(900px/s, deadzone 0.15, 화면 클램프), buttons[0](A) 눌림/뗌→ptr.down/justDown/sx/sy 매핑, buttons[1](B)→탭(지우기), buttons[9](Start)→keysJust 'KeyR' 주입. 게임패드 입력이 감지된 뒤에만 ui.js에서 십자 커서를 렌더해 마우스 유저에게는 보이지 않게. try/catch 가드(콘솔 에러 0 규칙). 예상 비용 300~500B — 잔여 5,722B에서 충분.

## [high/large] [본선] 레벨 10개 확장 + 레벨별 팔레트 변주 — Graphics 변별력
현재 3레벨이 전부 동일 팔레트라 스크린샷 3장이 같은 게임의 같은 장면처럼 보인다. CLAWSTRIKE Graphics 1위(4.56)의 비결로 인용된 것이 'black-on-color인데 레벨마다 새 컬러 테마'. 구현: src/game/levels.js Level 타입에 pal 옵셔널(하늘 3색+언덕 2색+플랫폼 2색)을 추가하고 src/game/const.js 값을 기본값으로 강등, bg.js가 lv.pal ?? 기본값을 참조. 진행: 새벽(L1-3, 현재 팔레트)→한낮(L4-6)→노을(L7-8)→밤+오로라(L9-10). 팔레트는 데이터라 레벨당 ~40B. 기믹 우선순위(IDEAS의 '3종은 여유 시에만' 준수): ① 비 존 확장(rain.js 재사용, 0B급) ② 바람 존(quantize에서 h와 끝점에 바람 벡터 가감 — 프리뷰가 휘어 보이는 것 자체가 튜토리얼) ③ 움직이는 플랫폼(plats 항목에 진폭·주기 추가, platSurfaces만 수정). 최종 레벨은 IDEAS가 지목한 '무지개 끝은 도달할 수 없다' 추격 구조를 검토하되 스코프 여유 시에만.

## [medium/medium] [본선] 비가 무지개를 침식 — 위협에 이빨 달기 + 테마 역설
현재 L3의 비는 스턴 0.9초뿐이라 우산 없이도 사실상 통과 가능한 수준 — 퍼즐 압박이 약하다. 개선: src/game/rain.js에서 arcBlocks 히트 시 해당 아치에 wear 누적(빗방울당 +1), wear가 len*0.15를 넘으면 아치가 바깥 밴드부터 옅어지다 소멸(잉크 환급 없음 — 소멸 전에 탭으로 회수하면 잔여분 환급). 우산 배치가 '아치를 소모해 보호한다'는 경제 결정이 되고, '비가 무지개를 지운다'는 역설이 서사 층으로 연결된다(비 온 뒤 무지개 — 테마 정합). 유니콘 메카닉 (b)안(망아지가 밟으면 침식 회복)과 결합하면 유니콘·무지개·비 3요소가 한 규칙으로 묶인다. drawArc에 wear 기반 alpha 감쇠 인자 추가. 이지모드에서는 침식 속도 절반.

## [medium/medium] [본선] 음악 편곡 두께 — 타악 레이어 + 레벨별 무드 전환
현재 전 레이어가 triangle pluck 단일 음색이라 10분 청취 시 단조롭다. Audio 상위권 공식은 '변화가 있는 적응형 음악'(Black Cat Squadron 보스전 템포 가속=Audio 2위, Witchcat 계절별 음악 변화). 구현: src/game/music.js에 ① 레이어 4 — 화이트노이즈 AudioBuffer(0.05초) 하이햇을 s%2===1에 vol 0.03으로, intensity 0.67+에서 sine 120→40Hz 스윕 킥을 s===0/4에 추가. ② 비 레벨은 PROG를 [-2,-2,3,0](Am 중심)으로 교체하고 master 앞에 BiquadFilter lowpass(2kHz)를 걸어 폭풍 무드 — 레벨 데이터에 mood 플래그 1개로 제어. ③ 마지막 망아지 구조 직전(intensity 0.8+)에 STEP을 0.24→0.22로 미세 가속. 기존 pluck 인프라 재사용이라 각 항목 100~200B. 글리산도 하프(드로잉=연주)는 이미 이 게임의 Audio 시그니처이므로 데브로그/게임 설명문에 반드시 명시할 것.

## [medium/medium] [본선] 스토리 한 줄 + 진짜 엔딩 연출 — '완결된 게임' 인상
현재 서사 층이 0이고 엔드 화면이 'Prototype complete!' 플레이스홀더다. catalog2025.md: 엔딩 연출(Cat Survivors 로맨스 엔딩, CLAWSTRIKE 9 Lives 언락)이 '완결된 게임' 인상을 만들어 심사평에 반복 언급됨. 구현: ① src/game/game.js drawTitle 서브타이틀을 'The storm scattered the foals. Draw the light that leads them home.' 류의 1줄 스토리로 교체(비=적, 무지개=해답의 서사 프레임 — 비 침식 기믹과 호응). ② drawEnd를 교체: 하늘 목초지 씬에서 구조한 망아지 전원이 뛰놀고(기존 drawFoal 재사용, saving 연출 역재생), 화면 전폭 초대형 무지개 + 전 레벨 별 합계 표시. ③ 게이트에 '어미 유니콘' 실루엣을 1개 그려 '집으로'의 대상을 시각화(drawFoal 1.6배 스케일 재사용, ~100B). 서사는 텍스트가 아니라 이 3개의 그림으로 전달한다.

## [medium/medium] [본선] 레벨 선택 + 별 저장 + 클리어 후 보상 모드
별 3개 시스템이 이미 있는데(잉크 잔량 기반) 저장도 재도전 동선도 없어 버려지고 있다. 구현: ① src/engine/save.js에 stars 배열 저장(save('stars', [...])), 레벨 클리어 시 최고 기록만 갱신. ② 타이틀 'Tap to start' 아래에 레벨 카드 행(가로 배치, 잠금은 실루엣, 별 표시) — 기존 card()/star() 렌더러 재사용. ③ 전 레벨 3별 시 'Golden Horn 모드' 언락(잉크 25% 감소 + 타이틀 뿔 금색 강조) — CLAWSTRIKE '9 Lives' 언락 패턴의 번역. ④ 여유 시 스피드런 타이머 토글(CLAWSTRIKE가 스피드런 타이머로 리플레이 가치를 만든 선례). 심사자가 3별 최적화 재도전이라는 두 번째 플레이 동기를 갖게 되어 체감 분량이 늘어난다. 제출 전 game.js 하단의 arcdbg 테스트 훅 제거를 체크리스트에 추가할 것.

