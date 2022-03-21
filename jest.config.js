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
    }
}