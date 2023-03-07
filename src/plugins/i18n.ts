import { createI18n } from 'vue-i18n';
import ruMes from "@/locales/ru.json";
import enMes from "@/locales/en.json";
export default createI18n({
  legacy: false,
  locale: "en",
  fallbackLocale: "en",
  messages: {
    en: enMes,
    ru: ruMes,
  },
})