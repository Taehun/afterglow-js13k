// 빌드 타임 상수 (esbuild define) — 테스트 빌드에서만 true.
// 프로덕션 빌드에선 false로 치환되어 훅 코드가 통째로 제거된다.
declare const TEST_HOOKS: boolean;
