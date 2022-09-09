<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { usePhotobankStore, type FilterSettings } from "@/stores/photobank";
import { errVueHandler } from "@/plugins/errorResponser";
const PhotobankStore = usePhotobankStore();
const emit = defineEmits(["apply"]);
const initLoader = ref(true);
const showLoader = () => (initLoader.value = true);
const hideLoader = () => (initLoader.value = false);
defineProps({
  hiddenDates: {
    type: Boolean,
    default: false,
  },
});
//filter
const filterSettings = computed({
  get(): FilterSettings {
    return PhotobankStore.getFilterSettings;
  },
  set(newVal: FilterSettings) {
    PhotobankStore.setFilterSettings(newVal);
  },
});
const acceptFilter = (): void => {
  showLoader();
  PhotobankStore.setFilterSettings(filterSettings.value, true);
  emit("apply");
  setTimeout(() => hideLoader(), 200);
};
//types
const types = [
  { value: 1, name: "Фотография" },
  { value: 2, name: "Иллюстрация" },
];
//dates
const shortcuts = [
  {
    text: "Сегодня",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24);
      return [start, end];
    },
  },
  {
    text: "За неделю",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: "За месяц",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
];
//autocompletes
const astr = ref("");
const sstr = ref("");
const tstr = ref("");
const ustr = ref("");
const selectLoading = ref(false);
const sources = computed(() => {
  return PhotobankStore.getSources;
});
const authors = computed(() => {
  return PhotobankStore.getAuthors;
});
const tags = computed(() => {
  return PhotobankStore.getAllTags;
});
const users = computed(() => {
  return PhotobankStore.getAllUsers;
});
const fetchTags = () => {
  selectLoading.value = true;
  return PhotobankStore.fetchTags({
    select: ["id", "name"],
    filter: {
      is_active: 1,
      "%name": tstr.value,
    },
    options: {
      onlyLimit: true,
      itemsPerPage: 10,
      sortBy: ["name"],
      sortDesc: [false],
    },
  }).then((res) => {
    if (errVueHandler(res)) {
      selectLoading.value = false;
    }
  });
};
const fetchUsers = () => {
  selectLoading.value = true;
  return PhotobankStore.fetchUsers({
    select: ["id", "name"],
    filter: {
      "%name": ustr.value,
    },
    options: {
      onlyLimit: true,
      itemsPerPage: 10,
      sortBy: ["name"],
      sortDesc: [false],
    },
  }).then((res) => {
    if (errVueHandler(res)) {
      selectLoading.value = false;
    }
  });
};
const fetchSources = () => {
  selectLoading.value = true;
  return PhotobankStore.fetchSources({
    select: ["id", "name"],
    filter: {
      "%name": sstr.value,
    },
    options: {
      onlyLimit: true,
      itemsPerPage: 10,
      sortBy: ["name"],
      sortDesc: [false],
    },
  }).then((res) => {
    if (errVueHandler(res)) {
      selectLoading.value = false;
    }
  });
};
const fetchAtuhors = () => {
  selectLoading.value = true;
  return PhotobankStore.fetchAuthors({
    select: ["id", "name"],
    filter: {
      "%name": astr.value,
    },
    options: {
      onlyLimit: true,
      itemsPerPage: 10,
      sortBy: ["name"],
      sortDesc: [false],
    },
  }).then((res) => {
    if (errVueHandler(res)) {
      selectLoading.value = false;
    }
  });
};
watch(tstr, fetchTags);
watch(sstr, fetchSources);
watch(astr, fetchAtuhors);
watch(ustr, fetchUsers);
const applyEnter = (evt: KeyboardEvent) => {
  if (evt.key !== "Enter" || !!document.querySelector(".uploader-card")) return;
  acceptFilter();
};
onMounted(() => {
  window.addEventListener("keypress", applyEnter);
  Promise.allSettled([
    fetchTags(),
    fetchSources(),
    fetchAtuhors(),
    fetchUsers(),
  ]).then(() => hideLoader());
});
onBeforeUnmount(() => {
  window.removeEventListener("keypress", applyEnter);
});
const blureTimeout = (val: string) =>
  setTimeout(() => {
    val = "";
  }, 200);
</script>
<template>
  <div class="pl-4 pr-4" v-loading="initLoader">
    <el-row>
      <el-col>
        <el-divider class="mt-2 mb-2" />
      </el-col>
    </el-row>
    <el-row>
      <el-col :lg="2">
        <el-input
          v-model="filterSettings.data.id"
          placeholder="Номер"
          type="number"
          :max="4294967295"
        />
      </el-col>
      <el-col :lg="4">
        <el-select
          class="selecter"
          :loading="selectLoading"
          @blur="blureTimeout(tstr)"
          @keyup.delete="tstr = $event.target.value"
          @input="tstr = $event.target.value"
          placeholder="Теги"
          remote
          v-model="filterSettings.data.tags"
          collapse-tags
          collapse-tags-tooltip
          multiple
          filterable
        >
          <el-option
            v-for="tag in tags"
            :key="tag.id"
            :label="tag.name"
            :value="tag.id"
          />
        </el-select>
      </el-col>
      <el-col :lg="7" v-if="!hiddenDates" style="overflow: auto">
        <el-date-picker
          :teleported="true"
          class="selecter"
          v-model="filterSettings.data.dates"
          type="daterange"
          unlink-panels
          range-separator="До"
          start-placeholder="Дата создания"
          end-placeholder="Дата создания"
          :shortcuts="shortcuts"
          format="DD-MM-YYYY"
        />
      </el-col>
      <el-col :lg="4">
        <el-select
          class="selecter"
          :loading="selectLoading"
          @blur="blureTimeout(sstr)"
          @keyup.delete="sstr = $event.target.value"
          @input="sstr = $event.target.value"
          placeholder="Источники"
          remote
          v-model="filterSettings.data.sources"
          collapse-tags
          collapse-tags-tooltip
          multiple
          filterable
        >
          <el-option
            v-for="source in sources"
            :key="source.id"
            :label="source.name"
            :value="source.id"
          />
        </el-select>
      </el-col>
      <el-col :lg="4">
        <el-select
          class="selecter"
          :loading="selectLoading"
          @blur="blureTimeout(sstr)"
          @keyup.delete="sstr = $event.target.value"
          @input="sstr = $event.target.value"
          placeholder="Исключить источники"
          remote
          v-model="filterSettings.data.wthoutSources"
          collapse-tags
          collapse-tags-tooltip
          multiple
          filterable
        >
          <el-option
            v-for="source in sources"
            :key="source.id"
            :label="source.name"
            :value="source.id"
          />
        </el-select>
      </el-col>
      <el-col :lg="4">
        <el-select
          class="selecter"
          :loading="selectLoading"
          @blur="blureTimeout(astr)"
          @keyup.delete="astr = $event.target.value"
          @input="astr = $event.target.value"
          placeholder="Авторы"
          remote
          v-model="filterSettings.data.authors"
          collapse-tags
          collapse-tags-tooltip
          multiple
          filterable
        >
          <el-option
            v-for="author in authors"
            :key="author.id"
            :label="author.name"
            :value="author.id"
          />
        </el-select>
      </el-col>
      <el-col :lg="4">
        <el-select
          class="selecter"
          :loading="selectLoading"
          @blur="blureTimeout(ustr)"
          @keyup.delete="ustr = $event.target.value"
          @input="ustr = $event.target.value"
          placeholder="Создатель"
          remote
          v-model="filterSettings.data.users"
          collapse-tags
          collapse-tags-tooltip
          multiple
          filterable
        >
          <el-option
            v-for="user in users"
            :key="user.id"
            :label="user.name"
            :value="user.id"
          />
        </el-select>
      </el-col>
      <el-col :lg="3">
        <el-select
          class="selecter"
          collapse-tags
          collapse-tags-tooltip
          v-model="filterSettings.data.types"
          multiple
          placeholder="Тип"
        >
          <el-option
            v-for="item in types"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-col>
    </el-row>
    <el-row class="mt-3" justify="center">
      <el-col :span="24">
        <el-button-group>
          <el-button class="m-1" type="success" @click="acceptFilter"
            >Применить (enter)</el-button
          >
        </el-button-group>
      </el-col>
    </el-row>
    <el-row>
      <el-col>
        <el-divider class="mb-0 mt-2" />
      </el-col>
    </el-row>
  </div>
</template>
<style>
.selecter {
  width: -webkit-fill-available;
}
</style>
