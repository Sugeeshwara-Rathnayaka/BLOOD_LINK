import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    // Tell ESLint we are using Node.js and modern ES Modules
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    // Custom Rules for our Backend
    rules: {
      "no-console": "off", // Allows console.log() which is essential for backend debugging
      "no-undef": "error", // Catches misspelled variables
      // 🧠 The Smart Unused Variables Rule
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^(req|res|next|_)$", // Ignores standard Express variables
          varsIgnorePattern: "^_", // Ignores variables that start with an underscore
        },
      ],
    },
  },
  // Include the standard recommended JavaScript rules
  pluginJs.configs.recommended,
];
