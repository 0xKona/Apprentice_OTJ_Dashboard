/** @type {import('jest').Config} */
module.exports = {
  testMatch: ['<rootDir>/**/*.test.ts'],
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }] },
};
