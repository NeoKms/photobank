<script setup lang="ts">
import PhotoParamsEditor from "./PhotoParamsEditor.vue";
import PhotoParamsHeader from "./PhotoParamsHeader.vue";
import { ref, watch, onMounted, type PropType } from "vue";
import type { ImageToUpload } from "@/stores/photobank";
const props = defineProps({
  modelValue: {
    type: Array as PropType<ImageToUpload[]>,
    required: true,
  },
  multiEditor: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["update:modelValue"]);
watch(props.modelValue, (newv) => {
  emit("update:modelValue", newv);
});
const activeName = ref("");
onMounted(() => {
  if (props.modelValue.length === 1) {
    if (props.modelValue[0].key) {
      activeName.value = props.modelValue[0].key.toString();
    } else if (props.modelValue[0].id) {
      activeName.value = props.modelValue[0].id.toString();
    }
  }
});
const delEvent = (image: ImageToUpload) => {
  const indToDel = props.modelValue.findIndex(
    (i) => i.initial_url === image.initial_url
  );
  if (indToDel >= 0) {
    props.modelValue.splice(indToDel, 1);
  }
};
</script>
<template>
  <el-collapse v-model="activeName" accordion class="imagecollapser">
    <el-collapse-item
      v-for="(image, index) in modelValue"
      :name="(image.key || image.id)?.toString()"
      :key="image.key || image.id"
    >
      <template #title>
        <photo-params-header
          v-if="modelValue.length > 1"
          :image="modelValue[index]"
          @del="delEvent"
        />
        <el-row v-else style="flex-grow: 1; text-align: center">
          <el-col :span="24">
            <el-image
              class="single-image-preview"
              :src="modelValue[0].preview"
              fit="contain"
            />
          </el-col>
        </el-row>
      </template>
      <el-row>
        <el-col :span="24">
          <el-divider />
        </el-col>
      </el-row>
      <photo-params-editor
        v-model="modelValue[index]"
        :multi-editor="multiEditor"
        :all-array-of-images="modelValue"
      />
    </el-collapse-item>
  </el-collapse>
</template>
<style>
.single-image-preview img {
  max-width: 300px;
  max-height: 200px;
}
</style>
