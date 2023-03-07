<script setup lang="ts">
import { usePhotobankStore } from "@/stores/photobank";
import { computed, watch } from "vue";
const PhotobankStore = usePhotobankStore();
const cardSettings = computed(() => PhotobankStore.getCardSettrings);
watch(cardSettings, () => PhotobankStore.setCardSettings(), { deep: true });
</script>
<template>
  <el-row style="min-height: 341px">
    <el-col :span="24" :lg="12" :md="12" :sm="12" class="button-list">
      <el-row :gutter="5">
        <el-col :span="24">
          {{$t("d.author")}}
          <el-switch v-model="cardSettings.author" />
        </el-col>
        <el-col :span="24">
          {{$t("d.source")}}
          <el-switch v-model="cardSettings.source" />
        </el-col>
        <el-col :span="24">
          {{$t("d.tags")}}
          <el-switch v-model="cardSettings.tags" />
        </el-col>
        <el-col :span="24">
          {{$t("d.creator")}}
          <el-switch v-model="cardSettings.creator" />
        </el-col>
        <el-col :span="24">
          {{$t("calendar.created_date")}}
          <el-switch v-model="cardSettings.date" />
        </el-col>
        <el-col :span="24">
          {{$t("calendar.full_date")}}
          <el-switch v-model="cardSettings.date_full" />
        </el-col>
      </el-row>
    </el-col>
    <el-col :span="24" :lg="12" :md="12" :sm="12" style="align-self: center">
      <div class="card-list">
        <PhotoCard />
      </div>
    </el-col>
  </el-row>
</template>
<style lang="scss">
.button-list {
  align-self: center;
}
</style>
