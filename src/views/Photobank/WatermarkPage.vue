<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import Uploader from "@/components/watermark/UploaderWatermarkCard.vue";
import { useWatermarkStore, type OptionsSettings } from "@/stores/watermark";
import WatermarkCard from "../../components/watermark/WatermarkCard.vue";
import { errVueHandler } from "@/plugins/errorResponser";
import { ElMessage, ElMessageBox } from "element-plus/es";
import { FolderAdd } from "@element-plus/icons-vue";
import {useI18n} from "vue-i18n";

const i18n = useI18n();
const WatermarkStore = useWatermarkStore();
const initLoader = ref(true);
const showLoader = () => (initLoader.value = true);
const hideLoader = () => (initLoader.value = false);

const apiCall = () => {
  const timeStart = Date.now();
  showLoader();
  return WatermarkStore.fetchListMain().then((res) => {
    if (errVueHandler(res, null, i18n)) {
      setTimeout(
        () => hideLoader(),
        Date.now() - timeStart < 300 ? 300 - (Date.now() - timeStart) : 0
      );
    }
  });
};
onMounted(() => {
  apiCall();
});

const watermarkList = computed(() => {
  return WatermarkStore.getList;
});

const optionsSettings = computed({
  get(): OptionsSettings {
    return WatermarkStore.getOptionsSettings;
  },
  set(newVal: OptionsSettings) {
    WatermarkStore.setOptionsSettings(newVal);
  },
});

const uploaderModal = ref(false);

const handleSizeChange = (val: number) => {
  optionsSettings.value.options.itemsPerPage = val;
  return apiCall();
};
const handleCurrentChange = (val: number) => {
  optionsSettings.value.options.page = val;
  return apiCall();
};

const delWatermark = (id: number, multiple = false) => {
  if (!multiple) {
    sendDelWatermarkRequest(id);
  } else {
    ElMessageBox({
      title: i18n.t("notif.warning"),
      message: i18n.t("watermark.delete_confirm"),
      showCancelButton: true,
      confirmButtonText: i18n.t("ok"),
      cancelButtonText: i18n.t("cancel"),
    }).then(() => sendDelWatermarkRequest(id));
  }
};

const sendDelWatermarkRequest = (id: number) => {
  showLoader();
  const msg = ElMessage({
    message: i18n.t("notif.delete_in_progress"),
    type: "warning",
    center: true,
    duration: 0,
  });
  return WatermarkStore.sendDeleteWatermark(id).then((res) => {
    if (errVueHandler(res, null, i18n)) {
      apiCall();
      ElMessage({
        message: i18n.t("notif.success_delete"),
        type: "success",
        center: true,
        duration: 1500,
        showClose: true,
      });
    }
    msg.close();
    hideLoader();
  });
};
</script>
<template>
  <el-row class="pt-4 pb-4 sticky-row sticky-top" justify="center">
    <el-button type="success" @click="uploaderModal = true" :icon="FolderAdd">
      {{$t("watermark.add_wm")}}
    </el-button>
  </el-row>
  <el-skeleton animated :loading="initLoader">
    <template #template>
      <el-row :gutter="10" justify="center">
        <el-col
          :lg="4"
          :md="8"
          :sm="8"
          :xs="24"
          class="p-2 card-list"
          v-for="ind in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]"
          :key="ind"
        >
          <WatermarkCard :key="ind" :is-sceleton="true" />
        </el-col>
      </el-row>
    </template>
    <template #default>
      <el-row :gutter="10" justify="center">
        <template v-if="watermarkList.length > 0">
          <el-col
            :lg="4"
            :md="8"
            :sm="8"
            :xs="24"
            v-for="(image, ind) in watermarkList"
            :key="ind"
            class="p-2 card-list"
          >
            <WatermarkCard
              :is-sceleton="false"
              :key="ind"
              :card-data="image"
              @delete="delWatermark"
              :preview-fullscreen="[image.preview]"
            />
          </el-col>
        </template>
        <template v-else>
          <el-col :span="24" class="p-2">
            <el-result icon="warning">
              <template #title>
                <p>{{$t('d.empty_result.0')}}</p>
                <p>{{$t('d.empty_result.1')}}</p>
                <p>{{$t('d.empty_result.2')}}</p>
              </template>
            </el-result>
          </el-col>
        </template>
      </el-row>
    </template>
  </el-skeleton>
  <el-row
    v-if="watermarkList.length"
    class="pt-4 pb-4 sticky-row sticky-bottom"
    justify="center"
  >
    <el-pagination
      v-model:currentPage="optionsSettings.options.page"
      v-model:page-size="optionsSettings.options.itemsPerPage"
      :page-sizes="[6, 12, 24, 54, 102, 504]"
      :disabled="initLoader"
      :background="true"
      layout="total, sizes, prev, pager, next, jumper"
      :total="optionsSettings.options.allCount"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </el-row>
  <el-dialog
    close-on-press-escape
    custom-class="dialog-without-nothing sticky-head sticky-footer"
    v-model="uploaderModal"
    width="80%"
    center
    destroy-on-close
    :close-on-click-modal="false"
    :show-close="false"
  >
    <Uploader
      @close="
        uploaderModal = false;
        apiCall();
      "
    />
  </el-dialog>
</template>
<style scoped></style>
