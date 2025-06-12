module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        '**/*.{js,ts}',
        '!**/node_modules/**',
        '!**/coverage/**',
        '!**/dist/**',
        '!**/logs/**',
        '!**/config/**',
        '!**/prisma/**'
    ],
    testMatch: [
        '**/__tests__/**/*.test.{js,ts}',
        '**/?(*.)+(spec|test).{js,ts}'
    ],
    setupFilesAfterEnv: ['./tests/setup.js'],
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
        
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    }
  }
};
