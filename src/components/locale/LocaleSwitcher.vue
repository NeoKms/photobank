<template>
  <div class="text-center">
    <el-popover
      placement="right"
      width="auto"
      trigger="hover"
      popper-class="locale-switcher-popper"
      :popper-style="{ width: 'auto', minWidth: '0', padding: '6px' }"
    >
      <template #reference>
        <el-button class="locale-switcher__button">
          <locale-block :locale="{ code: $i18n.locale }" />
        </el-button>
      </template>
      <div class="locale-switcher__list">
        <button
          v-for="(lang, index) in locales"
          :key="index"
          type="button"
          class="locale-item"
          @click="switchLocale(lang.code)"
        >
          <locale-block :locale="lang" />
        </button>
      </div>
    </el-popover>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import LocaleBlock from "@/components/locale/LocaleBlock.vue";

const i18n = useI18n();
const locales = computed(() =>
  Object.keys(i18n.messages.value)
    .map((el) => ({ code: el }))
    .filter((i) => i.code !== i18n.locale.value),
);
const switchLocale = (locale: string) => {
  localStorage.setItem("i18n-locale", locale);
  i18n.locale.value = locale;
};
onMounted(() => {
  const locale = localStorage.getItem("i18n-locale");
  if (locale) {
    i18n.locale.value = locale;
  }
});
</script>

<style scoped>
.lang-btn {
  text-decoration: none;
}

.locale-switcher__button {
  padding: 8px 10px;
  min-width: 0;
}

.locale-switcher__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.locale-item:hover {
  background-color: var(--el-fill-color-light);
}

.locale-item {
  display: inline-flex;
  width: auto;
  min-width: 0;
  padding: 6px 8px;
  color: var(--el-text-color-primary);
  background: transparent;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
}

:global(.locale-switcher-popper) {
  width: auto !important;
  min-width: 0 !important;
  padding: 6px !important;
}
</style>
