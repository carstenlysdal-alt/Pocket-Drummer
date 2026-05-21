import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/out/**",
      "**/build/**",
      "**/next-env.d.ts",
      "**/temp_extracted/**",
      "**/temp-npm-cache/**",
      "**/.npm-cache/**",
      "**/start-wrapper.js",
      "**/.firebase/**",
    ],
  },
  ...nextVitals,
  ...nextTs,
];

export default eslintConfig;
