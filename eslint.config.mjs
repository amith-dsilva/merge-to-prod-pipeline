import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    ignores: [
      "dist/**",
      "coverage/**",
      "node_modules/**"
    ]
  },

  {
    files: ["src/**/*.ts"],

    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic
    ],

    languageOptions: {
      globals: {
        ...globals.node
      }
    },

    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_"
        }
      ],

      "@typescript-eslint/no-explicit-any": "warn",

      "eqeqeq": ["error", "always"],

       "no-var": "error",

       "prefer-const": "error",

       "no-console": [
          "warn",
             {
               allow: ["warn", "error", "log"]
             }
        ]
    }
  }
);