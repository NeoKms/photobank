<script setup lang="ts">
import { ref } from "vue";

defineProps({
  cardData: {
    type: Object,
    default: () => ({}),
    require: true,
  },
  isSceleton: {
    type: Boolean,
    default: false,
  },
  previewFullscreen: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["delete"]);

// Local reactive data
const isError = ref(false);
// Computed
</script>

<template>
  <el-card v-show="isSceleton" class="card sceleton-card" shadow="hover">
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
  <el-card v-show="!isSceleton" class="card" shadow="hover" key="photoncard">
    <template #header>
      <div class="card__name">
        <span>№ {{ cardData.id }}</span>
      </div>
    </template>
    <el-icon class="zoom-in-image">
      <ZoomIn />
    </el-icon>
    <div class="card__image-preview">
      <el-image
        :src="isError ? '/default_null.jpeg' : cardData.preview"
        :initial-index="0"
        :preview-src-list="previewFullscreen"
        :alt="cardData.source_name"
        @error="isError = true"
      />
    </div>
    <div class="card__title">
      {{ cardData.name }}
    </div>
    <footer class="card__actions-bar">
      <el-popconfirm
        v-if="!cardData.deleted_at"
        :title="$t('watermark.delete_confirm')"
        @confirm="emit('delete', [cardData.id])"
        :cancel-button-text="$t('cancel')"
        :confirm-button-text="$t('ok')"
      >
        <template #reference>
          <el-button type="danger" icon="Delete" @click.stop />
        </template>
      </el-popconfirm>
    </footer>
  </el-card>
</template>
<style scoped lang="scss">
.card {
  display: inline-block;
  position: relative;
  width: 250px;
  min-width: 0;
  overflow: hidden;
  margin: 0 5px 10px;
  background: rgb(255 255 255 / 92%);
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  font-size: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;

  &:hover {
    border-color: rgb(94 234 212 / 90%);
    box-shadow:
      0 1px 2px rgb(15 23 42 / 5%),
      0 14px 34px rgb(20 184 166 / 12%);
    transform: translateY(-1px);
  }

  &__name {
    user-select: auto;
    min-height: 34px;
    padding: 8px 10px;
    justify-content: space-between;
    overflow: hidden;
    background: linear-gradient(135deg, #0f766e, #0284c7);
    color: #ffffff;
    font-weight: 750;
    place-content: center;
  }

  &__image-preview {
    height: 148px;
    background:
      linear-gradient(135deg, rgb(240 253 250 / 74%), rgb(239 246 255 / 84%)),
      #f8fafc;
    overflow: hidden;
    place-content: center;

    :deep(.el-image) {
      width: 100%;
      height: 100%;
      display: block;
    }

    :deep(.el-image__inner) {
      width: 100%;
      height: 100%;
      object-fit: contain;
      transition: transform 180ms ease;
    }
  }

  &:hover &__image-preview :deep(.el-image__inner) {
    transform: scale(1.025);
  }

  &__title {
    display: block;
    min-height: 42px;
    padding: 12px 12px 0;
    overflow: hidden;
    color: #0f172a;
    font-weight: 750;
    line-height: 1.35;
    text-overflow: ellipsis;
  }

  &__source {
    height: 20px;
    line-height: 15px;
    margin-top: 10px;
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
    margin-top: 10px;
    padding: 0 10px;
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

  &__creator {
    height: 10px;
    padding: 0 10px;
    flex-direction: column;
    align-items: flex-start !important;
    font-weight: bold;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  &__actions-bar {
    justify-content: flex-end;
    margin-top: 12px;
    padding: 0 12px 12px;

    .button-group {
      width: 100%;
      display: flex !important;
    }
  }

  &__author {
    height: 28px;
    place-content: center;
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
}

.tag-list__item:hover {
  opacity: 0.8;
  box-shadow: 0 0 1px rgba(0, 0, 0, 0.5);
}

.zoom-in-image {
  position: absolute;
  top: 44px;
  right: 8px;
  z-index: 2;
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 70%);
  border-radius: 999px;
  background: rgb(15 23 42 / 54%);
  color: #ffffff;
  font-size: 16px;
  backdrop-filter: blur(8px);
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
  background-color: rgb(244, 244, 245);
  color: #000;
  border: 1px solid rgb(233, 233, 235);
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
    width: 100%;
    height: 148px;
  }
}

:global(html[data-theme="classic"] .card) {
  display: inline-block;
  width: 250px;
  height: 210px;
  margin: 0 5px 10px;
  overflow: visible;
  background-color: #f9fafc;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  box-shadow: none;
  transform: none;
}

:global(html[data-theme="classic"] .card:hover) {
  border-color: var(--el-card-border-color);
  box-shadow: var(--el-box-shadow-light);
  transform: none;
}

:global(html[data-theme="classic"] .card__name) {
  min-height: auto;
  padding: 5px;
  background: #79bbff;
  color: #000000;
  font-weight: bold;
}

:global(html[data-theme="classic"] .card__image-preview) {
  height: 117px;
  background: transparent;
}

:global(html[data-theme="classic"] .card__image-preview)
  :deep(.el-image__inner) {
  object-fit: contain;
  transform: none;
}

:global(html[data-theme="classic"] .card__title) {
  display: block;
  min-height: auto;
  padding: 0;
  color: inherit;
  font-weight: 400;
}

:global(html[data-theme="classic"] .card__actions-bar) {
  margin-top: 10px;
  padding: 0 10px;
  place-content: space-evenly;
}

:global(html[data-theme="classic"] .zoom-in-image) {
  top: 120px;
  right: 3px;
  width: auto;
  height: auto;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: inherit;
  font-size: 20px;
  backdrop-filter: none;
}

:global(html[data-theme="classic"] .sceleton-card__image) {
  width: 200px;
  height: 134px;
}
</style>
