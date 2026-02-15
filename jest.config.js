module.exports = {
    testEnvironment: 'node',
    coveragePathIgnorePatterns: ['/node_modules/'],
    testTimeout: 10000,
    verbose: true,
    setupFiles: ['<rootDir>/jest.setup.js'],
    collectCoverageFrom: [
        'controllers/**/*.js',
        'models/**/*.js',
        'middlewares/**/*.js',
        'routes/**/*.js',
        'utils/**/*.js'
    ],
    testMatch: ['**/tests/**/*.test.js']
};
