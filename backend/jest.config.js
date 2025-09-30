module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/server'],
  testMatch: [
    '<rootDir>/server/**/__tests__/**/*.{ts,js}',
    '<rootDir>/server/**/*.{test,spec}.{ts,js}'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  collectCoverageFrom: [
    'server/**/*.{ts,js}',
    '!server/**/*.d.ts',
    '!server/index.ts',
    '!server/utils/test-db.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/server/tests/setup.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/server/$1'
  }
};