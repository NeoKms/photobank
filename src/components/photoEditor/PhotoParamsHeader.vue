<script setup lang="ts">
import { computed } from "vue";
import { usePhotobankStore } from "@/stores/photobank";
const PhotobankStore = usePhotobankStore();
const emit = defineEmits(["del"]);
const props = defineProps({
  image: {
    type: Object,
    required: true,
    default: () => ({
      type: 1,
      tags: new Set(),
      del_checked: false,
      del_after: 86400,
      source_id: null,
      author_id: null,
      newAuthor: "",
      newSource: "",
      description: "",
      preview: "",
    }),
  },
});
const allTagsById = computed(() => {
  return PhotobankStore.getAllTagsById;
});
const allAuthorsById = computed(() => {
  return PhotobankStore.getAllAuthorsById;
});
const allSourcesById = computed(() => {
  return PhotobankStore.getAllSourcesById;
});
const clickDel = () => {
  emit("del", props.image);
};
</script>
<template>
  <el-row :gutter="10" style="flex-grow: 1">
    <el-col :xl="4" :lg="5" :md="24">
      <el-row justify="center">
        <el-button
          v-tooltip.auto="$t('delete')"
          size="small"
          class="delete-btn"
          icon="Delete"
          circle
          @click="clickDel"
        />
        <el-image
          style="max-width: 400px; max-height: 225px"
          :src="image.preview"
          fit="contain"
        />
      </el-row>
      <el-row justify="center">
        <el-space wrap>
          <el-tag effect="dark" round type="warning">
            {{ image.type === 1 ? $t('d.type_photo') : $t('d.type_illus') }}</el-tag
          >
          <el-tag type="danger" v-if="image.del_checked" effect="dark" round
            >{{$t('del_from.del')}}
            {{ image.del_after === 86400 ? $t('del_from.day'):$t('del_from.month') }}</el-tag
          >
        </el-space>
      </el-row>
    </el-col>
    <el-col :xl="9" :lg="8" :md="24">
      <el-space wrap>
        <el-tag
          v-for="tag in image.tags"
          class="ml-2"
          :key="tag"
          effect="dark"
          round
        >
          {{ allTagsById.hasOwnProperty(tag) ? allTagsById[tag] : tag }}
        </el-tag>
      </el-space>
    </el-col>
    <el-col :lg="4" :md="24">
      <el-row>
        <el-col :span="24" style="line-height: 2">
          <el-space wrap>
            <el-icon>
              <Avatar />
            </el-icon>
            <template v-if="image.newAuthor">
              {{ image.newAuthor }}
            </template>
            <template v-else-if="image.author_id">
              {{
                allAuthorsById.hasOwnProperty(image.author_id)
                  ? allAuthorsById[image.author_id]
                  : $t("error")
              }}
            </template>
            <template v-else> {{$t('photo_editor.not_selected')}} </template>
          </el-space>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24" style="line-height: 2">
          <el-space wrap>
            <el-icon>
              <Share />
            </el-icon>
            <template v-if="image.newSource">
              {{ image.newSource }}
            </template>
            <template v-else-if="image.source_id">
              {{
                allSourcesById.hasOwnProperty(image.source_id)
                  ? allSourcesById[image.source_id]
                  : $t('error')
              }}
            </template>
            <template v-else> {{$t('photo_editor.not_selected')}} </template>
          </el-space>
        </el-col>
      </el-row>
    </el-col>
    <el-col :lg="7" :md="24" style="line-height: 2">
      {{ image.description }}
    </el-col>
  </el-row>
</template>
<style scoped>
.el-row {
  padding: 5px;
}
.delete-btn {
  color: red;
  right: 16px;
  top: 16px;
  position: absolute;
  z-index: 2;
}
</style>
