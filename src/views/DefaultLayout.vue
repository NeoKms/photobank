<script setup lang="ts">
import { ref, computed } from "vue";
import { RouterView } from "vue-router";
import { useUserStore } from "@/stores/user";
import Menu from "@/components/MenuAside.vue";
import LocaleSwitcher from "@/components/locale/LocaleSwitcher.vue";
import { useAppTheme } from "@/composables/useAppTheme";
const isCollapse = ref(true);
const UserStore = useUserStore();
const userInfo = computed(() => UserStore.getUser);
const logout = () => UserStore.logout();
const loader = computed(() => UserStore.getLoader);
const { isClassicTheme, themeToggleLabel, toggleTheme } = useAppTheme();
</script>

<template>
  <div class="common-layout" v-loading="loader">
    <el-container>
      <el-header class="navbar">
        <el-container class="toolbar first">
          <div class="brand-block hidden-xs-only">
            <el-button
              class="hidden-sm-and-down"
              type="primary"
              circle
              @click="isCollapse = !isCollapse"
            >
              <el-icon>
                <Expand />
              </el-icon>
            </el-button>
            <div class="brand-mark">
              <el-image src="/favicon.png" class="logo-image" />
            </div>
            <div class="brand-title">
              <span class="logo-text">{{ $t("title") }}</span>
              <span class="brand-caption">Media archive</span>
            </div>
          </div>
          <div class="hidden-md-and-up menu-block-mobile">
            <Menu
              class="menu-element-mobile"
              :is-collapse="isCollapse"
              :is-horizontal="true"
            />
          </div>
          <div class="user-toolbar">
            <div class="pl-2 pr-2"><locale-switcher /></div>
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
            <span class="hidden-xs-only user-name">{{
              userInfo?.fullname
            }}</span>
            <span class="hidden-md-and-up user-name">{{
              userInfo?.fullname?.split(" ")[0]
            }}</span>
            <el-icon class="user-block" @click="logout" :size="22">
              <SwitchButton />
            </el-icon>
          </div>
        </el-container>
      </el-header>
      <el-container>
        <el-aside
          class="hidden-sm-and-down app-aside"
          :class="{ 'app-aside--expanded': !isCollapse }"
        >
          <Menu :is-collapse="isCollapse" />
        </el-aside>
        <el-container>
          <el-main class="content">
            <RouterView />
          </el-main>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>
