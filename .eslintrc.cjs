module.exports = {
  extends: require.resolve("@atlasbot/configs/eslint/node"),
  parserOptions: {
    project: "./tsconfig.json",
  },
  rules: {
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/consistent-type-imports": "off",
    "unicorn/prefer-module": "off",
  },
};
