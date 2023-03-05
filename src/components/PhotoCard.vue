<script setup lang="ts">
import { ref, computed } from "vue";
import { formatDateJS } from "@/plugins/dates";
import { usePhotobankStore } from "@/stores/photobank";
import {useI18n} from "vue-i18n";
const PhotobankStore = usePhotobankStore();
const i18n = useI18n();
const props = defineProps({
  cardData: {
    type: Object,
    default: () => ({
      id: -1000000,
      deleted_at: null,
      type: 1,
      author_name: "Алексеев Алексей Алексеевич",
      source_name: "Источник источников",
      created_at: 1657185050,
      creator: "Сергеев Сергей Сергеевич",
      used: [
        "Сергеев Сергей Сергеевич",
        "Антонов Антон Антонович",
      ],
      preview: "",
      type_name: "фото",
      tags_names: [
        "Какой то очень большой тег с кучей слов",
        "Просто тег",
        "Тег",
        "Тег для переноса на строку",
      ],
    }),
    require: true,
  },
  oneClickToSelect: {
    type: Boolean,
    default: false,
  },
  isSkeleton: {
    type: Boolean,
    default: false,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
  previewFullscreen: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([
  "add",
  "remove",
  "delete",
  "edit",
  "undelete",
  "addTagInFilter",
]);

// Local reactive data
const isError = ref(false);
// Computed
const usedCount = computed(() => {
  return props.cardData.used.length;
});
const usedMerged = computed(() => {
  return Array.from(new Set(props?.cardData?.used || []));
});
const cardSettings = computed(() => PhotobankStore.getCardSettrings);
// Methods
const selectCard = () => {
  if (props.isSelected) {
    emit("add", props.cardData);
  } else {
    emit("remove", props.cardData);
  }
};
const oneClick = () => {
  if (props.oneClickToSelect) {
    selectCard();
  }
};
const dateFormat = (t: number, m: string) => formatDateJS(t, m);
const clickTimer = ref<any>(null);
const touchStart = () => {
  if (clickTimer.value == null) {
    clickTimer.value = setTimeout(() => (clickTimer.value = null), 500);
  } else {
    clearTimeout(clickTimer);
    clickTimer.value = null;
    selectCard();
  }
};
const addTagInFilter = (tagStr: string) => {
  const index = props.cardData.tags_names.findIndex(
    (tag: string) => tag === tagStr
  );
  if (index >= 0) {
    emit("addTagInFilter", props.cardData.tags[index]);
  }
};
</script>

<template>
  <el-card
    v-show="isSkeleton"
    class="card sceleton-card"
    shadow="hover"
    key="sceletoncard"
  >
    <template #header>
      <div
        class="sceleton-card__text"
        style="height: 45px; place-content: space-evenly"
      >
        <el-skeleton-item variant="text" style="width: 30%" />
        <el-skeleton-item variant="text" style="width: 30%" />
      </div>
    </template>
    <el-skeleton-item variant="image" class="sceleton-card__image" />
    <div class="p-2">
      <el-skeleton-item variant="p" style="width: 50%" />
      <div class="sceleton-card__text">
        <el-skeleton-item variant="text" style="margin-right: 16px" />
        <el-skeleton-item variant="text" style="width: 30%" />
      </div>
    </div>
  </el-card>
  <el-card
    v-show="!isSkeleton"
    class="card"
    shadow="hover"
    key="photoncard"
    @dblclick="selectCard"
    @click="oneClick"
    @touchstart="touchStart"
  >
    <template #header>
      <div
        class="card__name"
        :style="{
          backgroundColor: isSelected ? '#95d475' : '#79bbff',
        }"
      >
        <span>№ {{ cardData.id }}</span>
      </div>
    </template>
    <el-icon class="zoom-in-image">
      <ZoomIn />
    </el-icon>
    <el-popover placement="right" :width="150" trigger="hover">
      <template #reference>
        <div class="last-used" v-if="cardData.used.length">
          <el-icon :size="20" type="primary">
            <el-image src="/upload-to-cloud.svg" />
          </el-icon>
          <span>{{ usedCount }}</span>
        </div>
      </template>
      <div class="last-used-list">
        <span v-for="(item, index) of usedMerged" :key="index">{{ item }}</span>
      </div>
    </el-popover>
    <div class="card__image-preview">
      <el-image
        :src="isError ? '/default_null.jpeg' : cardData.preview"
        :initial-index="0"
        :preview-src-list="previewFullscreen"
        :alt="cardData.source_name"
        @error="isError = true"
      />
    </div>
    <div
      class="card__author"
      v-tooltip.auto="$t('d.author')"
      v-if="cardSettings.author"
    >
      {{ cardData.author_name }}
    </div>
    <div
      class="card__source"
      v-tooltip.auto="$t('d.source')"
      v-if="cardSettings.source"
    >
      {{ cardData.source_name }}
    </div>
    <div class="card__tag-list" v-if="cardSettings.tags">
      <el-tag
        small
        type="info"
        class="tag-list__item"
        v-for="(tag, index) in cardData.tags_names"
        v-bind:key="index"
        size="small"
        @click="addTagInFilter(tag)"
      >
        {{ tag }}
      </el-tag>
    </div>
    <div
      class="card__creator_block"
      v-if="cardSettings.creator || cardSettings.date"
    >
      <span class="creator" v-if="cardSettings.creator">
        {{ cardData.creator.split(" ")[0] }}
      </span>
      <span class="date" v-if="cardSettings.date">{{
        dateFormat(
          cardData.created_at,
          cardSettings.date_full ? "DD.MM.YYYY hh:mm" : "DD.MM.YYYY"
        )
      }}</span>
    </div>
    <footer class="card__actions-bar">
      <el-button-group class="button-group">
        <el-button
          style="width: inherit"
          v-if="cardData.deleted_at"
          type="danger"
          >Удален {{ dateFormat(cardData.deleted_at, "DD.MM.YYYY") }}</el-button
        >
        <el-popconfirm
          v-if="cardData.deleted_at"
          :title="$t('photo_editor.rollback_image')"
          @confirm="emit('undelete', [cardData.id])"
          :confirm-button-text="$t('ok')"
          :cancel-button-text="$t('cancel')"
        >
          <template #reference>
            <el-button
              style="width: inherit"
              type="warning"
              icon="RefreshLeft"
              @click.stop
              v-tooltip.auto="$t('rollback')"
            />
          </template>
        </el-popconfirm>
        <el-button
          :disabled="cardData.id < 0"
          v-if="!cardData.deleted_at"
          type="primary"
          icon="Edit"
          style="width: inherit"
          @click.stop="emit('edit', [cardData.id])"
        />
        <el-popconfirm
          v-if="!cardData.deleted_at"
          :title="$t('photo_editor.delete')"
          @confirm="emit('delete', [cardData.id])"
          :confirm-button-text="$t('ok')"
          :cancel-button-text="$t('cancel')"
        >
          <template #reference>
            <el-button
              :disabled="cardData.id < 0"
              style="width: inherit"
              type="danger"
              icon="Delete"
              @click.stop
            />
          </template>
        </el-popconfirm>
      </el-button-group>
    </footer>
  </el-card>
</template>
<style scoped lang="scss">
.card {
  display: inline-block;
  margin: 0 5px;
  position: relative;
  height: fit-content;
  width: 210px;
  background-color: #f9fafc;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 12px;
  border-radius: 8px;
  cursor: pointer;

  &__name {
    user-select: auto;
    padding: 5px;
    justify-content: space-between;
    overflow: hidden;
    background-color: #79bbff;
    font-weight: bold;
    place-content: center;
  }

  &__image-preview {
    height: 117px;
    overflow: hidden;
    place-content: center;
  }

  &__source {
    height: 17px;
    line-height: 15px;
    padding: 0 10px;
    text-overflow: ellipsis;
    overflow: hidden;
    display: -moz-box !important;
    -moz-box-orient: vertical;
    display: -webkit-box !important;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    line-clamp: 1;
    box-orient: vertical;
    font-weight: bold;
  }

  &__author {
    height: 17px;
    line-height: 15px;
    padding: 0 10px;
    text-overflow: ellipsis;
    overflow: hidden;
    display: -moz-box !important;
    -moz-box-orient: vertical;
    display: -webkit-box !important;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    line-clamp: 1;
    box-orient: vertical;
    font-weight: bold;

    span:first-of-type {
      margin-right: 0.5rem;
    }
  }

  &__tag-list {
    align-items: flex-start !important;
    flex-wrap: wrap;
    padding: 0 10px;
    height: 50px;
    margin: 10px 0;
    overflow-y: auto;
  }

  &__creator_block {
    height: 10px;
    padding: 0 10px;
    flex-direction: column;
    align-items: flex-start !important;
    font-weight: bold;
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    .date {
      margin-left: 4px;
    }

    .creator {
    }
  }

  &__actions-bar {
    margin-top: 10px;
    padding: 0 10px 5px;
    place-content: space-evenly;

    .button-group {
      width: 100%;
      display: flex !important;
    }
  }
}

.card *[class*="card__"] {
  width: 100%;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.tag-list__item {
  margin: 0 10px 5px 0;
  height: fit-content;
}

.tag-list__item:hover {
  opacity: 0.8;
  box-shadow: 0 0 1px rgba(0, 0, 0, 0.5);
}

.zoom-in-image {
  position: absolute;
  top: 120px;
  right: 3px;
  z-index: 2;
  font-size: 20px;
}

.last-used {
  border-radius: 15px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: absolute;
  min-width: 70px;
  height: 30px;
  left: 10px;
  top: 58px;
  padding: 0 10px;
  box-sizing: border-box;
  background-color: rgb(121, 187, 255);
  color: #000;
  z-index: 2;
}

.last-used-list {
  height: 200px;
  overflow-y: auto;
  color: #000;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.last-used-list span {
  padding: 5px 0;
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
</style>
