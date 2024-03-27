module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "@kontent-ai",
    "@kontent-ai/eslint-config/react",
    "@kontent-ai/eslint-config/jest",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh"],
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
  },
};
