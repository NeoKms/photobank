import { ElMessage } from "element-plus";
import router from "@/router";
import {useI18n} from "vue-i18n";
import {envConfig} from "@/plugins/envConfig";

export const errVueHandler = (res: number | boolean | string, errText = "") => {
  const i18n = useI18n();
  if (res === true) {
    return true;
  }
  if (res === -1) {
    router.push("/");
  } else if (res === 403) {
    ElMessage({
      message: i18n.t("errors.no_rights"),
      type: "error",
      center: true,
      duration: 0,
      showClose: true,
    });
  } else {
    ElMessage({
      message: errText
        ? errText
        : (res === "" || res === false ? i18n.t('errors.unknown_error') : res).toString(),
      type: "error",
      center: true,
      duration: 0,
      showClose: true,
    });
  }
  return false;
};

export const errRequestHandler = (err: any) => {
  const i18n = useI18n();
  if (!envConfig.PRODUCTION) {
    console.error(err);
  }
  if (Object.prototype.hasOwnProperty.call(err, "response") && err.response) {
    if ([400, 404].includes(err.response?.status)) {
      let text =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.response?.data?.errors ||
        (err.response?.status === 404
          ? ""
          : i18n.t("errors.unknown_error"));
      if (Array.isArray(text)) {
        text = text?.map((el) => el.message).join("\n");
      }
      if (err?.response?.data?.statusCode) {
        if (Array.isArray(err.response?.data?.message)) {
          text = err.response?.data?.message.join("\n");
        } else {
          text = err.response?.data?.message;
        }
      }
      return text;
    } else if (err.response?.status === 401) {
      return -1;
    } else if (err.response?.status === 403) {
      return 403;
    }
  } else {
    return err.message;
  }
  return false;
};
