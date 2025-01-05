export default {
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest', {
        isolatedModules: true,
        useESM: true
      }
    ]
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(t|j)s$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node']
};
