module.exports = {
    preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
    collectCoverage: true,
    coverageReporters: ['cobertura', 'text', 'text-summary'],
    collectCoverageFrom: [
        '**/src/**/*.{js,ts,vue}',
        '!**/{node_modules,mocks}/**',
        '!**/src/main.ts',
        '!**/src/store/index.ts'
    ],
    transform: {
        '^.+\\.vue$': 'vue-jest'
    }
};
