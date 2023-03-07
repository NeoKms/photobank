<script setup lang="ts">
import { RouterView } from "vue-router";
import {useI18n} from "vue-i18n";
import {computed, watch} from "vue";
import RuLocale from "element-plus/es/locale/lang/ru";
import EnLocale from "element-plus/es/locale/lang/en";

const i18n = useI18n();
const title = computed(() => i18n.t("title"));
watch(title,()=>document.title = title.value);
const locale = computed(() => {
  return {
    ru: RuLocale,
    en: EnLocale,
  }[i18n.locale.value];
});
</script>

<template>
  <el-config-provider :locale="locale">
    <RouterView />
  </el-config-provider>
</template>

<style scoped></style>
