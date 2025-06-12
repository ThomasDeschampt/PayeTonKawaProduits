module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
  'controllers/produits/**/*.js',
  'services/**/*.js',
  'routes/**/*.js',
  '!**/node_modules/**',
  '!**/middleware/**',
  '!**/validators/**',
  '!**/prisma/**',
  '!**/utils/**',
  '!**/scripts/**',
  '!**/logs/**',
  '!**/config/**',
  '!**/grafana/**',
  '!**/prometheus/**',
  '!**/rabbitmq**',
  '!**/tests/**',
  '!**/postman/**',
  '!**/coverage/**'
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
