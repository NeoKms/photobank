<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useUserStore } from "@/stores/user";
import { errVueHandler } from "@/plugins/errorResponser";
import router from "@/router";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { useI18n } from "vue-i18n";
import { useAppTheme } from "@/composables/useAppTheme";
const i18n = useI18n();
const { isClassicTheme, themeToggleLabel, toggleTheme } = useAppTheme();
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
    if (errVueHandler(res, null, i18n)) {
      router.push("/");
    } else {
      ElMessage({
        message: i18n.t("errors.login"),
        type: "error",
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
  <main class="login-page">
    <div class="login-actions">
      <locale-switcher />
      <el-tooltip :content="themeToggleLabel" placement="bottom">
        <el-button
          class="theme-toggle"
          circle
          :type="isClassicTheme ? 'primary' : 'default'"
          @click="toggleTheme"
        >
          <el-icon>
            <Brush />
          </el-icon>
        </el-button>
      </el-tooltip>
    </div>
    <el-card class="box-card" v-loading="initLoader">
      <template #header>
        <div class="login-card__header">
          <div class="brand-mark">
            <el-image src="/favicon.png" class="logo-image" />
          </div>
          <div>
            <p class="login-card__eyebrow">Photobank</p>
            <h1>{{ $t("auth.title") }}</h1>
          </div>
        </div>
      </template>
      <el-form :model="form" ref="ruleFormRef" :rules="rules" status-icon>
        <el-form-item required prop="username">
          <el-input
            v-model="form.username"
            :placeholder="$t('auth.write_login')"
          />
        </el-form-item>
        <el-form-item required prop="password">
          <el-input
            v-model="form.password"
            :placeholder="$t('auth.write_pass')"
            type="password"
          />
        </el-form-item>
        <el-form-item class="justify-center">
          <el-button type="primary" @click="submitForm(ruleFormRef)">
            {{ $t("auth.enter") }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </main>
</template>
<style scoped>
.login-page {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(
      circle at 12% -10%,
      rgb(20 184 166 / 16%),
      transparent 30rem
    ),
    radial-gradient(circle at 88% 0%, rgb(245 158 11 / 14%), transparent 26rem),
    linear-gradient(180deg, #f8fcfb 0%, #f5f7fb 50%, #fff7ed 100%);
}

.box-card {
  width: min(480px, 100%);
  border-color: rgb(203 213 225 / 78%);
  background: rgb(255 255 255 / 90%);
  box-shadow:
    0 1px 2px rgb(15 23 42 / 5%),
    0 18px 46px rgb(15 23 42 / 8%);
  backdrop-filter: blur(12px);
}

.login-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.login-card__eyebrow {
  margin: 0 0 4px;
  color: #0f766e;
  font-size: 12px;
  font-weight: 750;
  text-transform: uppercase;
}

.login-card__header h1 {
  margin: 0;
  color: #0f172a;
  font-size: 22px;
  line-height: 1.2;
}

@media screen and (max-width: 425px) {
  .box-card {
    width: 100%;
  }
}
.login-actions {
  display: flex;
  position: fixed;
  top: 20px;
  right: 24px;
  align-items: center;
  gap: 8px;
}

:global(html[data-theme="classic"] .login-page) {
  display: block;
  min-height: 100vh;
  padding: 0;
  background: #ffffff;
}

:global(html[data-theme="classic"] .box-card) {
  width: 480px;
  margin: auto;
  margin-top: 30vh;
  background: #ffffff;
  box-shadow: var(--el-box-shadow-light);
  backdrop-filter: none;
}

:global(html[data-theme="classic"] .login-card__header) {
  display: block;
}

:global(html[data-theme="classic"] .login-card__header .brand-mark),
:global(html[data-theme="classic"] .login-card__eyebrow) {
  display: none;
}

:global(html[data-theme="classic"] .login-card__header h1) {
  font-size: inherit;
  font-weight: inherit;
}

@media screen and (max-width: 425px) {
  :global(html[data-theme="classic"] .box-card) {
    width: 250px;
  }
}
</style>
