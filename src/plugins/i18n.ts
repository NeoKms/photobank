import {createI18n} from 'vue-i18n'

const messages = {
    en: await import("@/locales/en.json"),
    ru: await import("@/locales/ru.json"),
};
export default createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'en',
    messages,
});