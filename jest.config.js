module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/types.ts",
    "!**/node_modules/**",
    "!**/main/**",
    "!**/renderer/pages/**",
    "!**/hooks/**"
  ],
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "/renderer/out/"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "<rootDir>/node_modules/babel-jest"
  },
  transformIgnorePatterns: ["/node_modules/", "^.+\\.module\\.(css|sass|scss)$", "^.+\\.(svg|png|jpg|gif)$"],
  moduleNameMapper: {
    "^.+\\.module\\.(css|sass|scss)$": "imitation/styles",
    "^.+\\.(svg|png|jpg|gif)$": "imitation/images"
  }
};
