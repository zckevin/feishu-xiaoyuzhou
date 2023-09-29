module.exports = {
  preset: "ts-jest",
  roots: [
    // "<rootDir>/__tests__"
    "./src/tasks"
  ],
  transform: {
    "^.+\\.(t|j)sx?$": "ts-jest",
  },
  transformIgnorePatterns: [
    "node_modules"
  ]
};