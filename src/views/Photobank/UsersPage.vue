<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { usePhotobankStore } from "@/stores/photobank";
import { errVueHandler } from "@/plugins/errorResponser";
import type { User } from "@/stores/photobank";
import {useI18n} from "vue-i18n";
const i18n = useI18n();
const PhotobankStore = usePhotobankStore();
const initLoader = ref(true);
const showLoader = () => (initLoader.value = true);
const hideLoader = () => (initLoader.value = false);
const users = computed(() => {
  return PhotobankStore.getUsers;
});
const fetchUsers = () => {
  showLoader();
  return PhotobankStore.fetchUsers({
    select: ["id", "name", "cnt_active", "cnt_deleted", "cnt_images"],
    filter: {},
    options: {
      onlyLimit: false,
      itemsPerPage: 0,
      sortBy: ["cnt_images"],
      sortDesc: [true],
    },
  }).then((res) => {
    hideLoader();
    return errVueHandler(res, null, i18n);
  });
};
onMounted(() => {
  fetchUsers();
});
const confirm2Modal = ref(false);
const confirm3Modal = ref(false);
const confirm3ModalValue = ref("");
const userToDeleteImages = ref<User>({
  id: 0,
  name: "",
  cnt_images: 0,
  cnt_active: 0,
  cnt_deleted: 0,
});
const startDelete = (user: User) => {
  confirm2Modal.value = true;
  userToDeleteImages.value = user;
};
const confirmDelete = () => {
  confirm3Modal.value = false;
  confirm2Modal.value = false;
  showLoader();
  PhotobankStore.sendDeleteImagesByUserId(userToDeleteImages.value.id).then(
    (res) => {
      hideLoader();
      if (errVueHandler(res, null, i18n)) {
        fetchUsers();
      }
    }
  );
};
const canDelete = computed(
  () =>
    userToDeleteImages.value.cnt_active === parseInt(confirm3ModalValue.value)
);
</script>
<template>
  <el-card>
    <template #header>
      <h3>{{$t("users.title")}}</h3>
    </template>
    <div v-loading="initLoader">
      <el-row class="mb-2">
        <el-col :span="24" :lg="12" class="font-bold">{{ $t("users.table.name") }}</el-col>
        <el-col :span="24" :lg="4" class="font-bold">{{ $t("users.table.count") }}</el-col>
        <el-col :span="24" :lg="6" class="font-bold">{{ $t("users.table.actions") }}</el-col>
      </el-row>
      <el-row v-for="user in users" :key="user.id" class="mt-2">
        <el-col :span="24" :lg="12">{{ user.name }}</el-col>
        <el-col :span="24" :lg="4"
          >{{ user.cnt_images }} ({{$t("users.deleted")}} {{ user.cnt_deleted }})</el-col
        >
        <el-col :span="24" :lg="6">
          <el-popconfirm
            :title="$t('users.confirm_delete')"
            @confirm="startDelete(user)"
            :cancel-button-text="$t('cancel')"
            :confirm-button-text="$t('ok')"
          >
            <template #reference>
              <el-button
                :disabled="initLoader || user.cnt_active === 0"
                color="red"
                v-tooltip.auto="$t('users.delete_tip')"
              >
                <el-icon>
                  <Delete />
                </el-icon>
              </el-button>
            </template>
          </el-popconfirm>
        </el-col>
      </el-row>
    </div>
  </el-card>
  <el-dialog
    v-model="confirm2Modal"
    center
    destroy-on-close
    :modal="true"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    :show-close="false"
  >
    <div class="text-center">
      <h2>{{$t("users.dialog.title[0]")}}</h2>
      <h2>{{$t("users.dialog.title[0]")}}</h2>
      <el-button color="blue" @click="confirm2Modal = false">
        {{$t("users.dialog.cancel")}}
      </el-button>
      <el-button
        color="red"
        @click="
          confirm2Modal = false;
          confirm3Modal = true;
        ">
        {{$t("users.dialog.ok")}}
      </el-button>
    </div>
  </el-dialog>
  <el-dialog
    :close-on-press-escape="false"
    v-model="confirm3Modal"
    center
    :modal="true"
    destroy-on-close
    :close-on-click-modal="false"
    :show-close="false"
  >
    <div class="text-center">
      <h2>
        {{$t("users.dialog.check.write",{count:userToDeleteImages.cnt_active})}}
      </h2>
      <el-input size="small" autofocus v-model="confirm3ModalValue" />
      <div class="mt-2">
        <el-button
          color="blue"
          @click="
            confirm3Modal = false;
            confirm2Modal = false;
          ">
          {{$t("users.dialog.cancel")}}
        </el-button>
        <el-button :disabled="!canDelete" color="red" @click="confirmDelete">
          {{$t("users.dialog.check.to_trash")}}
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>
<style scoped lang="scss">
.font-bold {
  font-weight: bold;
}

.text-center {
  text-align: center;
}
</style>
