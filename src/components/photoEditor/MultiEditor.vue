<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import type { PropType } from "vue";
import { usePhotobankStore, type ImageToUpload } from "@/stores/photobank";
import { errVueHandler } from "@/plugins/errorResponser";
import type { Image } from "@/stores/photobank";
import PhotoPreviewCollapse from "./PhotoPreviewCollapse.vue";
import { Check, Close } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import {useI18n} from "vue-i18n";
const i18n = useI18n();
const PhotobankStore = usePhotobankStore();
const props = defineProps({
  ids: {
    type: Array as PropType<Array<number>>,
    required: true,
  },
});
const initLoader = ref(true);
const showLoader = () => (initLoader.value = true);
const hideLoader = () => (initLoader.value = false);
const emit = defineEmits(["close"]);
//////
const fetchProps = (images: ImageToUpload[]) => {
  const promises = [];
  const authors = images
    .map((img) => img.author_id || null)
    .filter((el) => !!el);
  if (authors.length) {
    promises.push(
      PhotobankStore.fetchAuthors({
        select: ["id", "name"],
        filter: {
          is_active: 1,
          "&id": authors,
        },
        options: {
          onlyLimit: true,
          itemsPerPage: 1000,
        },
      })
    );
  }
  const tags = images.reduce((acc, img) => {
    acc = acc.concat(Array.from(img?.tags || []) as number[]);
    return acc;
  }, [] as number[]);
  if (tags.length) {
    promises.push(
      PhotobankStore.fetchTags({
        select: ["id", "name"],
        filter: {
          is_active: 1,
          "&id": tags,
        },
        options: {
          onlyLimit: true,
          itemsPerPage: 1000,
        },
      })
    );
  }
  const sources = images
    .map((img: Partial<Image>) => img.source_id)
    .filter((el) => !!el);
  if (sources.length) {
    promises.push(
      PhotobankStore.fetchSources({
        select: ["id", "name"],
        filter: {
          is_active: 1,
          "&id": sources,
        },
        options: {
          onlyLimit: true,
          itemsPerPage: 1000,
        },
      })
    );
  }
  if (!promises.length) hideLoader();
  return Promise.allSettled(promises).then((res) => {
    res.map((el) => {
      if (el.status === "fulfilled") {
        errVueHandler(el.value, null, i18n);
      } else {
        errVueHandler(el.reason, el.reason, i18n);
      }
      hideLoader();
    });
  });
};
const dataset = computed(() => PhotobankStore.listToEdit);
onMounted(() => {
  PhotobankStore.fetchImagesForEditor(props.ids).then((res) => {
    if (errVueHandler(res, null, i18n)) {
      fetchProps(dataset.value);
    }
  });
});
const multiEditStage = ref(true);
const sendImages = () => {
  showLoader();
  const message = ElMessage({
    message: i18n.t("notif.save_photo"),
    type: "info",
    center: true,
    duration: 0,
  });
  PhotobankStore.sendImagesUpd(dataset.value).then((res) => {
    if (errVueHandler(res, null, i18n)) {
      emit("close");
      ElMessage({
        message: i18n.t("notif.success_save"),
        type: "success",
        center: true,
        duration: 2000,
      });
    }
    message.close();
    hideLoader();
  });
};
</script>
<template>
  <el-card v-loading="initLoader" class="uploader-card">
    <el-row class="card__header">
      <el-col :span="24">
        <el-space wrap>
          {{$t("photo_editor.edit")}}
          <el-divider direction="vertical" />
          <div v-if="dataset.length > 1">
            {{$t("photo_editor.multi")}}
            <el-switch
              v-model="multiEditStage"
              inline-prompt
              :active-icon="Check"
              :inactive-icon="Close"
            />
          </div>
        </el-space>
      </el-col>
    </el-row>
    <el-row>
      <el-col>
        <PhotoPreviewCollapse
          v-if="!initLoader"
          v-model="dataset"
          :multi-editor="multiEditStage"
        />
      </el-col>
    </el-row>
    <el-row justify="space-evenly" class="card__footer">
      <el-col :span="2">
        <el-button type="danger" @click="$emit('close')">{{$t("cancel")}}</el-button>
      </el-col>
      <el-col :span="2">
        <el-button type="success" @click="sendImages">{{$t("save")}}</el-button>
      </el-col>
    </el-row>
  </el-card>
</template>
<style scoped>
.uploader-card {
  max-height: 86vh;
  overflow: auto;
}

.el-row {
  padding: 5px;
}
</style>
