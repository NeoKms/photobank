<script setup lang="ts">
import { RouterView } from "vue-router";
import {useI18n} from "vue-i18n";
import {computed, watch} from "vue";

const i18n = useI18n();
const title = computed(()=>i18n.t("title"));
watch(title,()=>document.title = title.value);
</script>

<template>
  <RouterView />
</template>

<style scoped></style>
