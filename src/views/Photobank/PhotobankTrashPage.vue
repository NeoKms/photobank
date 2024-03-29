<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { usePhotobankStore, type FilterSettings } from "@/stores/photobank";
import { errVueHandler } from "@/plugins/errorResponser";
import PhotoFilter from "@/components/PhotoFilter.vue";
import { ElMessage, ElNotification, ElMessageBox } from "element-plus";
import {useI18n} from "vue-i18n";
const PhotobankStore = usePhotobankStore();
const i18n = useI18n();
const initLoader = ref(true);
const showLoader = () => (initLoader.value = true);
const hideLoader = () => (initLoader.value = false);
////////////
const showFilter = ref(false);
const apiCall = () => {
  showFilter.value = false;
  const timeStart = Date.now();
  showLoader();
  return PhotobankStore.fetchListTrash().then((res) => {
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
const selected = ref(new Set<number>());
const clickOnCard = (image: { id: number }) => {
  if (selected.value.has(image.id)) {
    selected.value.delete(image.id);
  } else {
    selected.value.add(image.id);
  }
};
const undeleteRequest = (ids: number[]) => {
  const msg = ElMessage({
    message: i18n.t('d.rollback_photo'),
    type: "warning",
    center: true,
    duration: 0,
  });
  showLoader();
  PhotobankStore.undeleteImage(ids).then((res) => {
    msg.close();
    if (errVueHandler(res, null, i18n)) {
      apiCall();
      ElMessage({
        message: i18n.t("notif.delete_img_cnt"),
        type: "success",
        center: true,
        duration: 1500,
        showClose: true,
      });
    }
  });
};
const handleSizeChange = (val: number) => {
  filterSettings.value.options.itemsPerPage = val;
  return apiCall();
};
const handleCurrentChange = (val: number) => {
  filterSettings.value.options.page = val;
  return apiCall();
};
const undeleteImage = (ids: number[], multiple = false) => {
  if (!multiple) {
    undeleteRequest(ids);
  } else {
    ElMessageBox({
      title: i18n.t("notif.warning"),
      message: i18n.t("notif.rollback_img_cnt"),
      showCancelButton: true,
      confirmButtonText: i18n.t("ok"),
      cancelButtonText: i18n.t("cancel"),
    }).then(() => undeleteRequest(ids));
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
</script>

<template>
  <div>
    <el-row class="pt-2 pb-1 sticky-row sticky-top" justify="center">
      <el-col :span="24">
        <el-row justify="center">
          <el-col style="text-align: center">
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
            <el-button-group class="ml-3" v-if="selected.size">
              <el-button-group class="ml-3" v-if="selected.size">
                <el-button
                  type="warning"
                  icon="FolderAdd"
                  @click="undeleteImage(Array.from(selected), true)"
                >
                  {{$t("d.rollback_selected")}}</el-button
                >
                <el-button @click="selected.clear()" icon="RefreshRight"
                  >{{ $t('d.refresh_selected') }}</el-button
                >
              </el-button-group>
            </el-button-group>
          </el-col>
        </el-row>
        <transition name="el-zoom-in-top">
          <el-row v-show="showFilter" justify="center">
            <el-col style="text-align: center">
              <PhotoFilter @apply="apiCall" :hidden-dates="true" />
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
        <div class="p-2 card-list">
          <template v-if="imageList.length > 0">
            <PhotoCard
              v-for="(image, ind) in imageList"
              :key="ind + '_card'"
              :is-skeleton="false"
              :card-data="image"
              @add="clickOnCard"
              @remove="clickOnCard"
              @undelete="undeleteImage"
              @addTagInFilter="addTagInFilter"
              :is-selected="selected.has(image.id)"
              :preview-fullscreen="[image.paths.full]"
              :one-click-to-select="!!selected.size"
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
      class="pt-4 pb-4 sticky-row sticky-bottom"
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
</template>
<style scoped lang="scss">
.sticky-row {
  position: sticky;
  z-index: 3;
  background-color: white;

  &.sticky-bottom {
    bottom: 0;
  }

  &.sticky-top {
    top: 0;
  }
}

.sceleton-card {
  &__text {
    display: flex;
    align-items: center;
    justify-items: space-between;
  }

  &__image {
    width: 200px;
    height: 134px;
  }
}

.photocard {
  cursor: pointer;
  height: 300px;
  overflow: auto;

  &.active {
    background-color: #c9f3f3;
  }

  &:hover {
    background-color: #a57da3;
  }
}
</style>
