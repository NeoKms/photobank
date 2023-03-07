<script setup lang="ts">
import { ref, computed } from "vue";
import { RouterView } from "vue-router";
import { useUserStore } from "@/stores/user";
import Menu from "@/components/MenuAside.vue";
import LocaleSwitcher from "@/components/locale/LocaleSwitcher.vue";
const isCollapse = ref(true);
const UserStore = useUserStore();
const userInfo = computed(() => UserStore.getUser);
const logout = () => UserStore.logout();
const loader = computed(() => UserStore.getLoader);
</script>

<template>
  <div class="common-layout" v-loading="loader">
    <el-container>
      <el-header class="navbar">
        <el-container class="toolbar first">
          <div
            class="hidden-xs-only"
            style="display: flex; align-items: center"
          >
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
            <el-image src="/favicon.png" class="ml-2 logo-image" />
            <span class="logo-text">{{$t("title")}}</span>
          </div>
          <div class="hidden-md-and-up menu-block-mobile">
            <Menu
              class="menu-element-mobile"
              :is-collapse="isCollapse"
              :is-horizontal="true"
            />
          </div>
          <div style="display: flex;align-items: center;">
            <div class="pl-2 pr-2"><locale-switcher /></div>
            <span class="hidden-xs-only">{{ userInfo?.fullname }}</span>
            <span class="hidden-md-and-up">{{
              userInfo?.fullname?.split(" ")[0]
            }}</span>
            <el-icon
              class="user-block"
              @click="logout"
              style="margin-left: 8px"
            >
              <SwitchButton />
            </el-icon>
          </div>
        </el-container>
      </el-header>
      <el-container>
        <el-aside class="hidden-sm-and-down">
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
