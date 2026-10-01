// Jest con módulos ESM nativos: sin transformaciones (ver jestjs.io/docs/ecmascript-modules).
export default {
  transform: {},
  testMatch: ['**/tests/**/*.test.js', '**/lecciones/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', '/_site/'],
};
