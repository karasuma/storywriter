module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest'],
    '^.+\\.vue$': 'vue-jest',
  },
}
