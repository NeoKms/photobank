<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { usePhotobankStore, type FilterSettings } from "@/stores/photobank";
import { errVueHandler } from "@/plugins/errorResponser";
import { useI18n } from "vue-i18n";
const PhotobankStore = usePhotobankStore();
const i18n = useI18n();
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
const types = computed(() => [
  { value: 1, name: i18n.t("d.type_photo") },
  { value: 2, name: i18n.t("d.type_illus") },
]);
//dates
const shortcuts = computed(() => [
  {
    text: i18n.t("calendar.today"),
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24);
      return [start, end];
    },
  },
  {
    text: i18n.t("calendar.weeks"),
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: i18n.t("calendar.months"),
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
]);
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
    if (errVueHandler(res, null, i18n)) {
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
    if (errVueHandler(res, null, i18n)) {
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
    if (errVueHandler(res, null, i18n)) {
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
    if (errVueHandler(res, null, i18n)) {
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
    void val;
  }, 200);
</script>
<template>
  <div class="photo-filter" v-loading="initLoader">
    <div class="photo-filter__grid">
      <div class="photo-filter__field photo-filter__field--short">
        <el-input
          v-model="filterSettings.data.id"
          :placeholder="$t('d.number')"
          type="number"
          :max="4294967295"
        />
      </div>
      <div class="photo-filter__field">
        <el-select
          class="selecter"
          :loading="selectLoading"
          @blur="blureTimeout(tstr)"
          @keyup.delete="tstr = $event.target.value"
          @input="tstr = $event.target.value"
          :placeholder="$t('d.tags')"
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
      </div>
      <div
        class="photo-filter__field photo-filter__field--dates"
        v-if="!hiddenDates"
      >
        <el-date-picker
          :teleported="true"
          class="selecter"
          v-model="filterSettings.data.dates"
          type="daterange"
          unlink-panels
          :range-separator="$t('calendar.to')"
          :start-placeholder="$t('calendar.created_date')"
          :end-placeholder="$t('calendar.created_date')"
          :shortcuts="shortcuts"
          format="DD-MM-YYYY"
        />
      </div>
      <div class="photo-filter__field">
        <el-select
          class="selecter"
          :loading="selectLoading"
          @blur="blureTimeout(sstr)"
          @keyup.delete="sstr = $event.target.value"
          @input="sstr = $event.target.value"
          :placeholder="$t('d.sources')"
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
      </div>
      <div class="photo-filter__field">
        <el-select
          class="selecter"
          :loading="selectLoading"
          @blur="blureTimeout(sstr)"
          @keyup.delete="sstr = $event.target.value"
          @input="sstr = $event.target.value"
          :placeholder="$t('d.without_sources')"
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
      </div>
      <div class="photo-filter__field">
        <el-select
          class="selecter"
          :loading="selectLoading"
          @blur="blureTimeout(astr)"
          @keyup.delete="astr = $event.target.value"
          @input="astr = $event.target.value"
          :placeholder="$t('d.authors')"
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
      </div>
      <div class="photo-filter__field">
        <el-select
          class="selecter"
          :loading="selectLoading"
          @blur="blureTimeout(ustr)"
          @keyup.delete="ustr = $event.target.value"
          @input="ustr = $event.target.value"
          :placeholder="$t('d.creators')"
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
      </div>
      <div class="photo-filter__field photo-filter__field--short">
        <el-select
          class="selecter"
          collapse-tags
          collapse-tags-tooltip
          v-model="filterSettings.data.types"
          multiple
          :placeholder="$t('d.type')"
        >
          <el-option
            v-for="item in types"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </div>
    </div>
    <div class="photo-filter__actions">
      <el-button type="success" @click="acceptFilter">{{
        $t("accept")
      }}</el-button>
    </div>
  </div>
</template>
<style>
.photo-filter {
  width: 100%;
}

.photo-filter__grid {
  display: grid;
  grid-template-columns: minmax(96px, 0.45fr) repeat(6, minmax(170px, 1fr));
  gap: 10px;
  align-items: start;
}

.photo-filter__field {
  min-width: 0;
}

.photo-filter__field--dates {
  grid-column: span 2;
}

.photo-filter__actions {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

.selecter {
  width: 100%;
}

@media screen and (max-width: 1180px) {
  .photo-filter__grid {
    grid-template-columns: repeat(3, minmax(180px, 1fr));
  }

  .photo-filter__field--dates {
    grid-column: span 2;
  }
}

@media screen and (max-width: 680px) {
  .photo-filter__grid {
    grid-template-columns: 1fr;
  }

  .photo-filter__field--dates {
    grid-column: auto;
    overflow-x: auto;
  }
}
</style>
