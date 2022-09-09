<script setup lang="ts">
import { Folder, FolderDelete, Menu } from "@element-plus/icons-vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/user";
import { computed } from "vue";
const UserStore = useUserStore();
const route = useRoute();
defineProps({
  isCollapse: {
    type: Boolean,
    default: false,
  },
  isHorizontal: {
    type: Boolean,
    default: false,
  },
});
////
const rights = computed(() => UserStore.getRights);
</script>
<template>
  <el-menu
    class="left-menu"
    :collapse="isCollapse"
    :default-active="route.path"
    :router="true"
    :mode="isHorizontal ? 'horizontal' : 'vertical'"
  >
    <el-menu-item index="/">
      <el-icon>
        <Folder />
      </el-icon>
      <template #title>Фотографии</template>
    </el-menu-item>
    <el-menu-item index="/trash" v-if="rights.mh_photobank_trash > 0">
      <el-icon>
        <FolderDelete />
      </el-icon>
      <template #title>Корзина</template>
    </el-menu-item>
    <el-menu-item index="/watermark" v-if="rights.mh_photobank > 0">
      <el-icon>
        <MagicStick />
      </el-icon>
      <template #title>Водяные знаки</template>
    </el-menu-item>
    <el-menu-item index="/users" v-if="rights.mh_photobank > 0">
      <el-icon>
        <User />
      </el-icon>
      <template #title>Создатели</template>
    </el-menu-item>
    <el-menu-item index="/settings" v-if="rights.mh_photobank > 0">
      <el-icon>
        <Tools />
      </el-icon>
      <template #title>Настройки</template>
    </el-menu-item>
  </el-menu>
</template>
