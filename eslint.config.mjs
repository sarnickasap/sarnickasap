import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    /* Test, bakım ve görsel karşılaştırma betikleri Node'da CommonJS
       olarak çalışıyor; `require()` orada doğru kullanım. */
    files: ["tests/**/*.js", "scripts/**/*.js"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Görsel karşılaştırma çıktıları (üretilen PNG'ler)
    "tests/visual/ciktilar/**",
  ]),
]);

export default eslintConfig;
