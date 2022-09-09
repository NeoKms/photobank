<script setup lang="ts">
import CardSettrings from "@/components/CardSettrings.vue";
import { usePhotobankStore } from "@/stores/photobank";
import { computed, watch, ref } from "vue";
const PhotobankStore = usePhotobankStore();
const stencilAcceptRatios = computed(
  () => PhotobankStore.getStencilAcceptRatios
);
const defaultStencilRatio = ref(PhotobankStore.getDefaultStencilRatio);
watch(defaultStencilRatio, (val) => PhotobankStore.setDefaultStencilRatio(val));
</script>
<template>
  <el-row>
    <el-col :span="24" class="card-settings mt-2">
      <el-card class="card-settings__block">
        <template #header> Настройки фотокарточки </template>
        <CardSettrings />
      </el-card>
    </el-col>
  </el-row>
  <el-row>
    <el-col :span="24" class="card-settings mt-2">
      <el-card class="card-settings__block">
        <template #header> Соотношение трафарета по умолчанию </template>
        <el-select v-model="defaultStencilRatio">
          <el-option :label="'Автоматически'" :value="-1" />
          <el-option
            v-for="ratioObj in stencilAcceptRatios"
            :key="ratioObj.ratio"
            :label="ratioObj.title"
            :value="ratioObj.ratio"
          />
        </el-select>
      </el-card>
    </el-col>
  </el-row>
</template>
<style lang="scss">
.card-settings {
  text-align: -webkit-center;

  &__block {
    width: fit-content;
  }
}
</style>
