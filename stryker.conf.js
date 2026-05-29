// @ts-check
/** @type {import('@stryker-mutator/api').StrykerOptions} */
const config = {
  _comment: 'This config was generated using "stryker init". Please take a look at: https://stryker-mutator.io/docs/stryker-js/configuration/ for more information.',
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress'],
  htmlReporter: {
    fileName: 'coverage/mutation/index.html',
  },
  testRunner: 'jest',
  jest: {
    projectType: 'custom',
    configFile: 'apps/backend/jest.config.js',
  },
  disableTypeChecks: false,
  mutate: [
    'apps/backend/src/**/*.ts',
    '!**/*.spec.ts',
    '!**/*.test.ts',
    '!**/index.ts',
    '!**/main.ts',
    '!**/module.ts',
  ],
  timeoutMS: 5000,
  timeoutFactor: 1.25,
  concurrency: 2,
  thresholds: {
    high: 80,
    medium: 70,
    low: 40,
  },
};

export default config;
