module.exports = {
  moduleFileExtensions: ['js', 'ts', 'tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json'
    }
  },
  testMatch: ['**/src/**/*.test.(ts|tsx|js)'],
  testPathIgnorePatterns: ['/node_modules/', '/.noxt/', 'anti-corrupt'],
  preset: 'ts-jest'
}
