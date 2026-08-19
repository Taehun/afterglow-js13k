// ESLint flat config — src(브라우저)와 tools(노드)를 분리해서 검사한다.
// vendor(골프된 서드파티)와 빌드 산출물은 제외.
import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['src/vendor/**', 'dist/**', 'dist-test/**', '.dev/**', 'node_modules/**'] },
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      // TEST_HOOKS는 esbuild define으로 주입되는 빌드타임 전역 (tools/build.mjs·dev.mjs)
      globals: { ...globals.browser, TEST_HOOKS: 'readonly' },
    },
  },
  {
    files: ['tools/**/*.mjs', 'eslint.config.mjs'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: globals.node,
    },
  },
  {
    rules: {
      // 오디오/스토리지 등 환경 의존 API는 빈 catch로 감싸는 것이 이 프로젝트의 규약
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
];
