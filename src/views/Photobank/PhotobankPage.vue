<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import Uploader from "@/components/photoEditor/UploaderCard.vue";
import { usePhotobankStore, type FilterSettings } from "@/stores/photobank";
import { errVueHandler } from "@/plugins/errorResponser";
import MultiEditor from "@/components/photoEditor/MultiEditor.vue";
import PhotoFilter from "@/components/PhotoFilter.vue";
import { ElMessage, ElMessageBox, ElNotification } from "element-plus";
import PhotoCard from "../../components/PhotoCard.vue";
import {useI18n} from "vue-i18n";
const i18n = useI18n();
const PhotobankStore = usePhotobankStore();
const initLoader = ref(true);
const showLoader = () => (initLoader.value = true);
const hideLoader = () => (initLoader.value = false);
////////////
const showFilter = ref(false);
const apiCall = () => {
  showFilter.value = false;
  const timeStart = Date.now();
  showLoader();
  return PhotobankStore.fetchListMain().then((res) => {
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
  ElNotification({
    title: i18n.t("tip.title") + "!",
    message: i18n.t("tip.message"),
    type: "info",
    duration: 5000,
    position: "bottom-right",
  });
});
const imageList = computed(() => {
  return PhotobankStore.getList;
});
////
const filterSettings = computed({
  get(): FilterSettings {
    return PhotobankStore.getFilterSettings;
  },
  set(newVal: FilterSettings) {
    PhotobankStore.setFilterSettings(newVal);
  },
});
const uploaderModal = ref(false);
const editorModal = ref(false);
const selected = ref(new Set<number>());
const singlePhotoId = ref(-1);
const clickOnCard = (image: any) => {
  if (selected.value.has(image.id)) {
    selected.value.delete(image.id);
  } else {
    selected.value.add(image.id);
  }
};
const editPhoto = (id: number) => {
  singlePhotoId.value = id;
  editorModal.value = true;
};
const handleSizeChange = (val: number) => {
  filterSettings.value.options.itemsPerPage = val;
  return apiCall();
};
const handleCurrentChange = (val: number) => {
  filterSettings.value.options.page = val;
  return apiCall();
};
const sendDelPhotoRequest = (ids: number[]) => {
  showLoader();
  const msg = ElMessage({
    message: i18n.t("notif.delete_in_progress"),
    type: "warning",
    center: true,
    duration: 0,
  });
  return PhotobankStore.sendDeleteImages(ids).then((res) => {
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
  });
};
const delPhoto = (ids: number[], multiple = false) => {
  if (!multiple) {
    sendDelPhotoRequest(ids);
  } else {
    ElMessageBox({
      title: i18n.t("notif.warning"),
      message: i18n.t("notif.delete_img_cnt",{count:ids.length}),
      showCancelButton: true,
      confirmButtonText: i18n.t("ok"),
      cancelButtonText: i18n.t("cancel"),
    }).then(() => sendDelPhotoRequest(ids));
  }
};
const clearFiltres = () => {
  PhotobankStore.clearFilterSettings();
  apiCall();
};
const addTagInFilter = (tagId: number) => {
  const copy = JSON.parse(
    JSON.stringify(filterSettings.value)
  ) as FilterSettings;
  if (!copy.data.tags.includes(tagId)) {
    copy.data.tags.push(tagId);
    PhotobankStore.setFilterSettings(copy, true);
    apiCall();
    if (!PhotobankStore.getAllTags.find((tag) => tag.id === tagId)) {
      PhotobankStore.fetchTags({
        select: ["id", "name"],
        filter: {
          is_active: 1,
          id: tagId,
        },
        options: {
          onlyLimit: true,
          itemsPerPage: 1000,
        },
      });
    }
  }
};
//dnd
const counter = ref(0);
const extDropImages = ref<FileList>();
const dropFieldPage = ref<any | HTMLElement>(null);
const stopAll = (e: Event) => {
  e.preventDefault();
  e.stopPropagation();
};
const drop = (e: DragEvent) => {
  stopAll(e);
  dropFieldPage.value.$el.style.backgroundColor = "";
  extDropImages.value = e.dataTransfer?.files;
  uploaderModal.value = true;
};
const dragEnter = () => {
  dropFieldPage.value.$el.style.backgroundColor = "rgb(214, 214, 214)";
  counter.value++;
};
const dragLeave = () => {
  counter.value--;
  if (counter.value === 0) {
    dropFieldPage.value.$el.style.backgroundColor = "";
  }
};
</script>

<template>
  <div>
    <el-row class="pt-2 pb-1 sticky-row sticky-top" justify="center">
      <el-col :span="24">
        <el-row justify="center">
          <el-col style="text-align: center">
            <el-button-group class="mr-3">
              <el-input
                v-model="filterSettings.data.search"
                style="width: auto"
                :placeholder="$t('d.search_in_photos')"
                prefix-icon="Search"
              />
            </el-button-group>
            <el-button-group class="mr-3">
              <el-button
                @click="showFilter = !showFilter"
                type="primary"
                icon="Filter"
                >{{ $t('d.filters') }}
                {{
                  filterSettings.applyCnt > 0
                    ? `[${filterSettings.applyCnt}]`
                    : ""
                }}</el-button
              >
              <el-button type="warning" icon="Refresh" @click="clearFiltres" />
            </el-button-group>
            <el-button @click="apiCall" icon="Refresh"
              >{{$t('refresh')}}</el-button
            >
            <el-button
              type="success"
              @click="uploaderModal = true"
              icon="FolderAdd"
              >{{$t('d.add_photo')}}</el-button
            >
            <el-button-group class="ml-3" v-if="selected.size">
              <el-button @click="editorModal = true" type="primary" icon="Edit"
                >{{$t('d.edit_selected_photo')}}</el-button
              >
              <el-button
                type="danger"
                @click="delPhoto(Array.from(selected), true)"
                icon="Delete"
                >{{$t('d.delete_selected_photo')}}
              </el-button>
              <el-button
                @click="selected.clear()"
                type="warning"
                icon="RefreshRight"
                >{{ $t('d.refresh_selected') }}</el-button
              >
            </el-button-group>
          </el-col>
        </el-row>
        <transition name="el-zoom-in-top">
          <el-row v-show="showFilter" justify="center">
            <el-col style="text-align: center">
              <PhotoFilter @apply="apiCall" />
            </el-col>
          </el-row>
        </transition>
      </el-col>
    </el-row>
    <el-skeleton animated :loading="initLoader">
      <template #template>
        <div class="p-2 card-list">
          <PhotoCard
            v-for="ind in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]"
            :key="ind"
            :is-skeleton="true"
          />
        </div>
      </template>
      <template #default>
        <div
          ref="dropFieldPage"
          class="p-2 card-list"
          @drop="drop($event)"
          @drag.stop.prevent="stopAll"
          @dragstart.stop.prevent="stopAll"
          @dragend.stop.prevent="stopAll"
          @dragover.stop.prevent="stopAll"
          @dragenter="dragEnter"
          @dragleave.stop.prevent="dragLeave"
        >
          <template v-if="imageList.length > 0">
            <PhotoCard
              v-for="(image, ind) in imageList"
              :key="ind + '_card'"
              :is-skeleton="false"
              :card-data="image"
              @add="clickOnCard"
              @remove="clickOnCard"
              @delete="delPhoto"
              @edit="editPhoto"
              @addTagInFilter="addTagInFilter"
              :is-selected="selected.has(image.id)"
              :one-click-to-select="!!selected.size"
              :preview-fullscreen="[image.paths.full]"
            />
          </template>
          <template v-else>
            <el-row>
              <el-col :span="24" class="p-2">
                <el-result icon="warning">
                  <template #title>
                    <p>{{$t('d.empty_result.0')}}</p>
                    <p>{{$t('d.empty_result.1')}}</p>
                    <p>{{$t('d.empty_result.2')}}</p>
                  </template>
                  <template #extra>
                    <el-button type="primary" @click="showFilter = true">
                      {{$t('d.edit_filters')}}
                    </el-button>
                  </template>
                </el-result>
              </el-col>
            </el-row>
          </template>
        </div>
      </template>
    </el-skeleton>
    <el-row
      v-if="imageList.length"
      class="pt-2 pb-1 sticky-row sticky-bottom"
      justify="center"
    >
      <el-pagination
        v-model:currentPage="filterSettings.options.page"
        v-model:page-size="filterSettings.options.itemsPerPage"
        :page-sizes="[24, 48, 54, 96, 102, 126, 150]"
        :disabled="initLoader"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="filterSettings.options.allCount"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-row>
  </div>
  <el-dialog
    close-on-press-escape
    custom-class="dialog-without-nothing sticky-head sticky-footer"
    v-model="uploaderModal"
    width="80%"
    center
    destroy-on-close
    :close-on-click-modal="false"
    :show-close="false"
    fullscreen
  >
    <Uploader
      :external-drop-images="extDropImages"
      @success="
        uploaderModal = false;
        apiCall();
      "
      @close="uploaderModal = false"
    />
  </el-dialog>
  <el-dialog
    close-on-press-escape
    custom-class="dialog-without-nothing sticky-head sticky-footer"
    v-model="editorModal"
    width="80%"
    center
    destroy-on-close
    :close-on-click-modal="false"
    :show-close="false"
  >
    <MultiEditor
      :ids="singlePhotoId > 0 ? [singlePhotoId] : Array.from(selected)"
      @close="
        editorModal = false;
        singlePhotoId = -1;
        apiCall();
      "
    />
  </el-dialog>
</template>
<style scoped lang="scss">
.sticky-row {
  position: sticky;
  z-index: 3;
  background-color: white;

  &.sticky-bottom {
    bottom: -2px;
  }

  &.sticky-top {
    top: -2px;
  }
}
</style>
