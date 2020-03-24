module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  globals: {
    "ts-jest": {
      packageJson: "package.json",
      tsConfigFile: "tsconfig.json"
    }
  }
};
