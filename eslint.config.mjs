import pluginVue from "eslint-plugin-vue";
import prettierConfig from "@vue/eslint-config-prettier";
import { withVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";

export default withVueTs(
  {
    ignores: ["dist/**", "sendNewVersion.js", ".eslintrc.cjs"],
  },
  pluginVue.configs["flat/essential"],
  vueTsConfigs.recommended,
  prettierConfig,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "vue/no-mutating-props": "off",
    },
  },
);
