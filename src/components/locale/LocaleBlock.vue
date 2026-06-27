<template>
  <span class="locale-container">
    <span class="locale-container__code">{{ locale.code.toUpperCase() }}</span>
    <el-image :src="`/${locale.code}.png`" class="locale-container__flag" />
  </span>
</template>

<script lang="ts" setup>
defineProps({
  locale: {
    type: Object,
    default: () => {
      return {
        code: "ru",
      };
    },
  },
});
</script>

<style scoped>
.locale-container {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  line-height: 1;
}

.locale-container__code {
  min-width: 20px;
  font-weight: 500;
}

.locale-container__flag {
  width: 18px;
  height: 18px;
}
</style>
