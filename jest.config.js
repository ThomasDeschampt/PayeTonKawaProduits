module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
  collectCoverageFrom: [
  'controllers/produits/**/*.js',
  '!**/rabbitmq.js',
  '!**/services/**',
  '!**/routes/**',
  '!**/middleware/**',
  '!**/validators/**',
  '!**/prisma/**',
  '!**/utils/**',
  '!**/scripts/**',
  '!**/logs/**',
  '!**/config/**',
  '!**/grafana/**',
  '!**/prometheus/**',
  '!**/tests/**',
  '!**/postman/**',
  '!**/coverage/**',
  '!**/node_modules/**'
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
