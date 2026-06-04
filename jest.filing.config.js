/**
 * Jest Configuration for Filing System Tests
 * ==========================================
 * Specialized test configuration for filing adapters and integration tests
 *
 * Usage:
 *   jest --config jest.filing.config.js
 *   npm run test:filing
 */

module.exports = {
  displayName: 'Filing System',
  testMatch: [
    '**/__tests__/*filing*.test.ts',
    '**/filing-adapters/**/*.test.ts',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/coverage/',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  collectCoverageFrom: [
    'lib/filing-adapters/**/*.ts',
    'app/api/filing/**/*.ts',
    'app/api/filings/**/*.ts',
    '!**/*.test.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/coverage/',
    '\\.mock\\.',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testTimeout: 30000,
  verbose: true,
  bail: false,
  maxWorkers: '50%',
  globals: {
    'ts-jest': {
      tsconfig: {
        // Override tsconfig.json for tests
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    },
  },
};
