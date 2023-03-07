<template>
  <el-row dense class="locale-container" style="cursor: pointer">
    <el-col :span="11">
      {{ locale.code.toUpperCase() }}
    </el-col>
    <el-col :span="11" class="pl-2">
      <el-image :src="`/${locale.code}.png`" style="width: 18px;" />
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
defineProps({
  locale: {
    type: Object,
    default: () => {
      return {
        code: 'ru'
      }
    }
  }
});
</script>

<style scoped>
.locale-container {
  align-items: center;
}
</style>