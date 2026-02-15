module.exports = {
    testEnvironment: 'node',
    coveragePathIgnorePatterns: ['/node_modules/'],
    testTimeout: 10000,
    verbose: true,
    collectCoverageFrom: [
        'controllers/**/*.js',
        'models/**/*.js',
        'middlewares/**/*.js',
        'routes/**/*.js',
        'utils/**/*.js'
    ],
    testMatch: ['**/tests/**/*.test.js']
};
