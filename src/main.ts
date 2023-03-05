import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./assets/base.css";
import App from "./App.vue";
import router from "./router";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { version } from "/package.json";
import "vue-advanced-cropper/dist/theme.compact.css";
import { VTooltip } from "floating-vue";
import "floating-vue/dist/style.css";
import "element-plus/theme-chalk/display.css";
import "./assets/b-spacing.css";
import RuLocale from "element-plus/es/locale/lang/ru";
import i18n from "@/plugins/i18n";

const app = createApp(App);

app.use(i18n);
app.directive("tooltip", VTooltip);
app.use(ElementPlus, {
  locale: RuLocale,
});
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
app.use(createPinia());
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
app.use(router);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.mount("#app");
