<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({
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
      <div
        class="card__name"
        :style="{
          backgroundColor: '#79bbff',
        }"
      >
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
    <div>
      {{ cardData.name }}
    </div>
    <footer class="card__actions-bar">
      <el-popconfirm
        v-if="!cardData.deleted_at"
        :title="$t('watermark.delete_confirm')"
        @confirm="emit('delete', [cardData.id])"
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
  margin: 0 5px;
  position: relative;
  height: 210px;
  width: 250px;
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
    margin-top: 10px;
    padding: 0 10px;
    place-content: space-evenly;

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
    width: 200px;
    height: 134px;
  }
}
</style>
