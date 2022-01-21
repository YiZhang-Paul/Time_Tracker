module.exports = {
    preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
    setupFilesAfterEnv: ['<rootDir>/src/specs.ts'],
    testMatch: ['**/src/**/*.spec.ts'],
    collectCoverage: true,
    coverageReporters: ['cobertura', 'text', 'text-summary'],
    collectCoverageFrom: [
        '**/src/**/*.{js,ts,vue}',
        '!**/{node_modules,mocks}/**',
        '!**/src/core/services/http/**',
        '!**/src/main.ts'
    ],
    transform: {
        '^.+\\.vue$': 'vue-jest'
    }
};
