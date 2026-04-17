const js = require("@eslint/js");
const prettier = require("eslint-plugin-prettier");
const prettierConfig = require("eslint-config-prettier");

module.exports = [
  js.configs.recommended,
  prettierConfig,
  {
    plugins: {
      prettier: prettier,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        process: "readonly",
        __dirname: "readonly",
        module: "readonly",
        console: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        jest: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "prettier/prettier": [
        "error",
        {
          singleQuote: true,
          semi: true,
          arrowParens: "avoid",
          trailingComma: "es5",
        },
      ],
    },
  },
  {
    ignores: ["node_modules/", "public/", "views/", "tests/"],
  },
];
