import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

type AppTheme = "modern" | "classic";

const STORAGE_KEY = "photobank-theme";
const DEFAULT_THEME: AppTheme = "modern";

const getSavedTheme = (): AppTheme => {
  if (typeof window === "undefined") return DEFAULT_THEME;
  return localStorage.getItem(STORAGE_KEY) === "classic"
    ? "classic"
    : DEFAULT_THEME;
};

const theme = ref<AppTheme>(getSavedTheme());

const applyTheme = (value: AppTheme) => {
  if (typeof document === "undefined") return;

  if (value === DEFAULT_THEME) {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.dataset.theme = value;
  }
};

applyTheme(theme.value);

export const useAppTheme = () => {
  const isClassicTheme = computed(() => theme.value === "classic");
  const i18n = useI18n();
  const themeToggleLabel = computed(() =>
    isClassicTheme.value ? i18n.t("old_design") : i18n.t("new_design"),
  );

  const setTheme = (value: AppTheme) => {
    theme.value = value;
    if (typeof window !== "undefined") {
      if (value === DEFAULT_THEME) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, value);
      }
    }
    applyTheme(value);
  };

  const toggleTheme = () => {
    setTheme(isClassicTheme.value ? "modern" : "classic");
  };

  return {
    isClassicTheme,
    theme,
    themeToggleLabel,
    setTheme,
    toggleTheme,
  };
};
