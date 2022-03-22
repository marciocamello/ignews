module.exports = {
    testPathIgnorePatterns: [
        "/node_modules/",
        "/.next/",
    ],
    transform: {
        "^.+\\.(js|jsx|ts|tsx)$": "<rootDir>/node_modules/babel-jest",
    },
    setupFilesAfterEnv: [
        "<rootDir>/src/tests/setupTests.ts"
    ],
    testEnvironment: "jsdom",
    moduleNameMapper: {
        "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    },
    collectCoverage: true,
    collectCoverageFrom: [
        "src/**/*.tsx",
        "!src/**/*.spec.ts",
        "!src/**/_app.tsx",
        "!src/**/_document.tsx",
    ],
    coverageReporters: [
        "lcov",
        "json",
    ]
}