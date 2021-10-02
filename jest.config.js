const jestJunitConfig = require('@mixmaxhq/jest-junit-config');
const jestCoverageConfig = require('@mixmaxhq/jest-coverage-config');
module.exports = {
  // Automatically clear mock calls and instances before every test. Equivalent to calling
  // jest.clearAllMocks() before each test. This does not remove any mock implementation that may
  // have been provided.
  clearMocks: true,
  // Merge in our standard test configs.
  ...jestJunitConfig,
  ...jestCoverageConfig,
  // Override our standard collectCoverageFrom parameter since modules just have a /src folder.
  collectCoverageFrom: ['src/**/*.js'],
};
