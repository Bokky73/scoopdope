// @ts-check
/** @type {import('@stryker-mutator/api').StrykerOptions} */
const config = {
  _comment: 'This config was generated using "stryker init". Please take a look at: https://stryker-mutator.io/docs/stryker-js/configuration/ for more information.',
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress', 'json'],
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
    '!**/types.ts',
    '!**/module.ts',
  ],
  mutationScore: {
    break: 70,
  },
  timeoutMS: 5000,
  timeoutFactor: 1.25,
  maxConcurrentTestRunners: 2,
};

export default config;
