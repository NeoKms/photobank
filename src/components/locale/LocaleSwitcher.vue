<template>
  <div class="text-center">
    <el-popover placement="right" :width="150" trigger="hover">
      <template #reference>
        <el-button>
          <locale-block :locale="{code: $i18n.locale}"/>
        </el-button>
      </template>
      <div class="last-used-list">
        <el-row v-for="(lang, index) in locales" :key="index" class="locale-item">
          <div @click="switchLocale(lang.code)">
            <locale-block :locale="lang" />
          </div>
        </el-row>
      </div>
    </el-popover>
    <!--    <v-menu offset-y open-on-hover>-->
    <!--      <template #activator="{ on, attrs }">-->
    <!--        <v-btn v-bind="attrs" v-on="on" class="black&#45;&#45;text">-->
    <!--          <locale-block :locale="{ code: $i18n.locale }"/>-->
    <!--        </v-btn>-->
    <!--      </template>-->
    <!--      <v-list>-->
    <!--        <v-list-item-->
    <!--            v-for="(lang, index) in locales"-->
    <!--            :key="index"-->
    <!--            class="locale-item"-->
    <!--        >-->
    <!--          <div-->
    <!--              @click="switchLocale(lang.code)"-->
    <!--              class="lang-btn"-->
    <!--          >-->
    <!--            <locale-block :locale="lang"/>-->
    <!--          </div>-->
    <!--        </v-list-item>-->
    <!--      </v-list>-->
    <!--    </v-menu>-->
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted} from "vue";
import {useI18n} from "vue-i18n";
import LocaleBlock from "@/components/locale/LocaleBlock.vue";
import {List} from "@element-plus/icons-vue";

const i18n = useI18n();
const locales = computed(() => Object.keys(i18n.messages.value).map(el => ({code: el})).filter(i => i.code !== i18n.locale.value));
const switchLocale = (locale: string) => {
  localStorage.setItem('i18n-locale', locale);
  i18n.locale.value = locale;
};
onMounted(() => {
  const locale = localStorage.getItem('i18n-locale');
  if (locale) {
    i18n.locale.value = locale;
  }
});
</script>

<style scoped>
.lang-btn {
  text-decoration: none;
}

.locale-item:hover {
  opacity: 0.7;
}
</style>