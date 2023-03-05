
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useUserStore } from "@/stores/user";
import { errVueHandler } from "@/plugins/errorResponser";
import router from "@/router";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import {useI18n} from "vue-i18n";
const i18n = useI18n();
const UserStore = useUserStore();
const initLoader = ref(false);
const showLoader = () => (initLoader.value = true);
const hideLoader = () => (initLoader.value = false);
///
const form = ref({
  username: "root",
  password: "root",
});
const sendLogin = () => {
  showLoader();
  UserStore.login(form.value).then((res) => {
    if (errVueHandler(res)) {
      router.push("/");
    } else {
      ElMessage({
        message: i18n.t("errors.login"),
        type: "error",
        center: true,
        duration: 2000,
        showClose: true,
      });
    }
    hideLoader();
  });
};
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid) => {
    if (valid) {
      return sendLogin();
    }
  });
};
const ruleFormRef = ref<FormInstance>();
const rules = ref<FormRules>({
  username: [
    {
      required: true,
      min: 1,
      message: i18n.t("errors.not_empty"),
      trigger: "blur",
    },
  ],
  password: [
    {
      required: true,
      min: 1,
      message: i18n.t("errors.not_empty"),
      trigger: "blur",
    },
  ],
});
const applyEnter = (evt: KeyboardEvent) => {
  if (evt.key !== "Enter" || !!document.querySelector(".uploader-card")) return;
  submitForm(ruleFormRef.value);
};
onMounted(() => {
  window.addEventListener("keypress", applyEnter);
});
onBeforeUnmount(() => {
  window.removeEventListener("keypress", applyEnter);
});
</script>
<template>
  <locale-switcher class="switcher" />
  <el-card class="box-card" v-loading="initLoader">
    <template #header>{{$t('auth.title')}}</template>
    <el-form :model="form" ref="ruleFormRef" :rules="rules" status-icon>
      <el-form-item required prop="username">
        <el-input v-model="form.username" :placeholder="$t('auth.write_login')" />
      </el-form-item>
      <el-form-item required prop="password">
        <el-input
          v-model="form.password"
          :placeholder="$t('auth.write_pass')"
          type="password"
        />
      </el-form-item>
      <el-form-item class="justify-center">
        <el-button @click="submitForm(ruleFormRef)"> {{$t('auth.enter')}} </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
<style scoped>
.box-card {
  width: 480px;
  margin: auto;
  margin-top: 30vh;
}

@media screen and (max-width: 425px) {
  .box-card {
    width: 250px;
  }
}
.switcher {
  position: absolute;
  top: 20px;
  right: 50px;
}
</style>
