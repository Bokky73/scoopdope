module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', {
      tsconfig: {
        strict: false,
        strictPropertyInitialization: false,
        skipLibCheck: true,
      },
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@scure|@otplib|@noble|otplib|p-retry|is-network-error|retry)/)',
  ],
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/../test/setup-env.ts'],
};
