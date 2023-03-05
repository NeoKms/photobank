<script setup lang="ts">
import { Plus, Avatar, Share } from "@element-plus/icons-vue";
import { ref, computed, watch, type PropType } from "vue";
import {
  usePhotobankStore,
  type Author,
  type Source,
  type Tag,
  type ImageToUpload,
} from "@/stores/photobank";
import { errVueHandler } from "@/plugins/errorResponser";
import {useI18n} from "vue-i18n";
const emit = defineEmits(["update:modelValue"]);
const i18n = useI18n();
const PhotobankStore = usePhotobankStore();
const props = defineProps({
  modelValue: {
    type: Object as PropType<Partial<ImageToUpload>>,
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
    }),
  },
  allArrayOfImages: {
    type: Array as PropType<ImageToUpload[]>,
    default: () => [],
  },
  multiEditor: {
    type: Boolean,
    default: false,
  },
});
watch(props.modelValue, (newv) => {
  emit("update:modelValue", newv);
});

//multieditor
const changeDescription = (val: string) => {
  if (!props.multiEditor) return;
  props.allArrayOfImages.forEach((img) => (img.description = val));
};
const changeDelCheck = (val: boolean) => {
  if (!props.multiEditor) return;
  props.allArrayOfImages.forEach((img) => (img.del_checked = val));
};
const changeDelTime = (val: number) => {
  if (!props.multiEditor) return;
  props.allArrayOfImages.forEach((img) => (img.del_after = val));
};
const changeType = (val: number) => {
  if (!props.multiEditor) return;
  props.allArrayOfImages.forEach((img) => (img.type = val));
};
const changeAuthor = () => {
  if (!props.multiEditor) return;
  props.allArrayOfImages.forEach((img) => {
    img.author_id = props.modelValue.author_id || null;
    img.newAuthor = props.modelValue.newAuthor;
  });
};
const changeSource = () => {
  if (!props.multiEditor) return;
  props.allArrayOfImages.forEach((img) => {
    img.source_id = props.modelValue.source_id || null;
    img.newSource = props.modelValue.newSource;
  });
};
const changeTag = (val: string | number) => {
  if (!props.multiEditor) return;
  props.allArrayOfImages.forEach((img) => img.tags && img.tags.add(val));
};
const delTag = (val: string | number) => {
  if (!props.multiEditor) return;
  props.allArrayOfImages.forEach((img) => img.tags && img.tags.delete(val));
};
/////////
const tags = computed(() => {
  return PhotobankStore.getTags;
});
const allTagsById = computed(() => {
  return PhotobankStore.getAllTagsById;
});
const authors = computed(() => {
  return PhotobankStore.getAuthors;
});
const allAuthorsById = computed(() => {
  return PhotobankStore.getAllAuthorsById;
});
const sources = computed(() => {
  return PhotobankStore.getSources;
});
const allSourcesById = computed(() => {
  return PhotobankStore.getAllSourcesById;
});
const tagsSearchAsync = (name: string, cb: (arg: any) => void) => {
  if (name.length < 1) {
    return cb(tags.value);
  }
  PhotobankStore.fetchTags({
    select: ["id", "name"],
    filter: {
      is_active: 1,
      "%name": name,
    },
    options: {
      onlyLimit: true,
      itemsPerPage: 15,
      sortBy: ["name"],
      sortDesc: [false],
    },
  }).then((res) => {
    if (errVueHandler(res, null, i18n)) {
      cb(tags.value);
    }
  });
};
const authorsSearchAsync = (name: string, cb: (arg: any) => void) => {
  if (name.length < 1) {
    return cb(authors.value);
  }
  PhotobankStore.fetchAuthors({
    select: ["id", "name"],
    filter: {
      is_active: 1,
      "%name": name,
    },
    options: {
      onlyLimit: true,
      itemsPerPage: 15,
      sortBy: ["name"],
      sortDesc: [false],
    },
  }).then((res) => {
    if (errVueHandler(res, null, i18n)) {
      cb(authors.value);
    }
  });
};
const sourcesSearchAsync = (name: string, cb: (arg: any) => void) => {
  if (name.length < 1) {
    return cb(sources.value);
  }
  PhotobankStore.fetchSources({
    select: ["id", "name"],
    filter: {
      is_active: 1,
      "%name": name,
    },
    options: {
      onlyLimit: true,
      itemsPerPage: 15,
      sortBy: ["name"],
      sortDesc: [false],
    },
  }).then((res) => {
    if (errVueHandler(res, null, i18n)) {
      cb(sources.value);
    }
  });
};
const newTagString = ref("");
const newSourceString = ref("");
const newAuthorString = ref("");
const setNewTag = (item: Tag, dataObject: Partial<ImageToUpload>) => {
  if (item?.id) {
    dataObject.tags?.add(item.id);
    changeTag(item.id);
  } else if (newTagString.value.length) {
    dataObject.tags?.add(newTagString.value);
    changeTag(newTagString.value);
  }
  newTagString.value = "";
};
const setNewAuthor = (item: Author, dataObject: Partial<ImageToUpload>) => {
  if (item?.id) {
    dataObject.author_id = item.id;
  } else {
    dataObject.newAuthor = newAuthorString.value.length
      ? newAuthorString.value
      : undefined;
  }
  changeAuthor();
  newAuthorString.value = "";
};
const setNewSource = (item: Source, dataObject: Partial<ImageToUpload>) => {
  if (item?.id) {
    dataObject.source_id = item.id;
  } else {
    dataObject.newSource = newSourceString.value.length
      ? newSourceString.value
      : undefined;
  }
  changeSource();
  newSourceString.value = "";
};
const deleteTag = (tag: string | number) => {
  props.modelValue?.tags?.delete(tag);
  delTag(tag);
};
</script>
<template>
  <el-row>
    <el-col :span="24">
      <el-card>
        <el-space wrap>
          {{$t("d.tags")}}
          <el-tag
            v-for="tag in modelValue.tags"
            :key="tag"
            effect="dark"
            round
            closable
            @close="deleteTag(tag)"
          >
            {{ allTagsById.hasOwnProperty(tag) ? allTagsById[tag] : tag }}
          </el-tag>
          <el-autocomplete
            style="margin-left: 10px; margin-top: 5px"
            value-key="name"
            :prefix-icon="Plus"
            v-model="newTagString"
            :fetch-suggestions="tagsSearchAsync"
            clearable
            class="inline-input w-50"
            :placeholder="$t('photo_editor.tag_add')"
            @select="setNewTag($event, modelValue)"
            @keyup.enter="setNewTag($event, modelValue)"
          />
        </el-space>
      </el-card>
    </el-col>
  </el-row>
  <el-row>
    <el-col :span="24">
      <el-card>
        <el-row :gutter="20">
          <el-col :lg="7" :md="12" :sm="24" :xs="24">
            <el-row>
              <el-col :span="24">
                <el-space wrap>
                  {{$t("d.source")}}
                  <el-tag
                    effect="dark"
                    round
                    closable
                    @close="
                      modelValue.source_id = null;
                      modelValue.newSource = '';
                    "
                  >
                    <template v-if="modelValue.newSource">
                      {{ modelValue.newSource }}
                    </template>
                    <template v-else-if="modelValue.source_id">
                      {{
                        allSourcesById.hasOwnProperty(modelValue.source_id)
                          ? allSourcesById[modelValue.source_id]
                          : $t('error')
                      }}
                    </template>
                    <template v-else> {{$t("photo_editor.not_selected")}} </template>
                  </el-tag>
                </el-space>
              </el-col>
            </el-row>
            <el-row>
              <el-autocomplete
                style="margin-left: 10px; margin-top: 5px"
                value-key="name"
                :prefix-icon="Share"
                v-model="newSourceString"
                :fetch-suggestions="sourcesSearchAsync"
                clearable
                class="inline-input w-50"
                :placeholder="$t('photo_editor.write_source')"
                @select="setNewSource($event, modelValue)"
                @keyup.enter="setNewSource($event, modelValue)"
              />
            </el-row>
          </el-col>
          <el-col :lg="1" :md="1" class="hidden-sm-and-down">
            <el-divider style="height: 100%" direction="vertical" />
          </el-col>
          <el-col :lg="7" :md="11" :sm="24" :xs="24">
            <el-row>
              <el-col :span="24">
                <el-space wrap>
                  {{ $t("d.author") }}
                  <el-tag
                    effect="dark"
                    round
                    closable
                    @close="
                      modelValue.author_id = null;
                      modelValue.newAuthor = '';
                    "
                  >
                    <template v-if="modelValue.newAuthor">
                      {{ modelValue.newAuthor }}
                    </template>
                    <template v-else-if="modelValue.author_id">
                      {{
                        allAuthorsById.hasOwnProperty(modelValue.author_id)
                          ? allAuthorsById[modelValue.author_id]
                          : $t('error')
                      }}
                    </template>
                    <template v-else> {{$t("photo_editor.not_selected")}} </template>
                  </el-tag>
                </el-space>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-autocomplete
                  style="margin-left: 10px; margin-top: 5px; width: 100%"
                  value-key="name"
                  :prefix-icon="Avatar"
                  v-model="newAuthorString"
                  :fetch-suggestions="authorsSearchAsync"
                  clearable
                  class="inline-input w-50"
                  :placeholder="$t('photo_editor.write_author')"
                  @select="setNewAuthor($event, modelValue)"
                  @keyup.enter="setNewAuthor($event, modelValue)"
                />
              </el-col>
            </el-row>
          </el-col>
          <el-col :lg="1" class="hidden-md-and-down">
            <el-divider style="height: 100%" direction="vertical" />
          </el-col>
          <el-col :lg="4" :md="12" :sm="24" :xs="24">
            <el-row>
              <el-checkbox
                v-model="modelValue.del_checked"
                :label="$t('del_from.del')"
                @change="changeDelCheck"
              />
            </el-row>
            <el-row>
              <el-select
                style="margin-left: 10px"
                v-model="modelValue.del_after"
                @change="changeDelTime"
                size="small"
              >
                <el-option :label="$t('del_from.day')" :value="86400" />
                <el-option :label="$t('del_from.month')" :value="2592000" />
              </el-select>
            </el-row>
          </el-col>
          <el-col :lg="1" :md="1" class="hidden-sm-and-down">
            <el-divider style="height: 100%" direction="vertical" />
          </el-col>
          <el-col :lg="3" :md="11" :sm="24" :xs="24" style="align-self: center">
            <el-space wrap>
              {{$t("d.type")}}
              <el-select
                style="margin-left: 10px"
                v-model="modelValue.type"
                label="Тип"
                size="small"
                @change="changeType"
              >
                <el-option :label="$t('d.type_photo')" :value="1" />
                <el-option :label="$t('d.type_illus')" :value="2" />
              </el-select>
            </el-space>
          </el-col>
        </el-row>
      </el-card>
    </el-col>
  </el-row>
  <el-row>
    <el-col :span="24">
      <el-card>
        <el-input
          v-model="modelValue.description"
          :rows="5"
          type="textarea"
          :placeholder="$t('d.description')"
          @input="changeDescription"
        />
      </el-card>
    </el-col>
  </el-row>
</template>
<style scoped>
.el-row {
  padding: 5px;
}
</style>
