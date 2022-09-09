import { defineStore } from "pinia";
import { axiosClient } from "@/plugins/axios";
import { envConfig } from "@/plugins/envConfig";
import type { SimpleObject } from "./photobank";
import { errRequestHandler } from "@/plugins/errorResponser";

type User = {
  id: number;
  fullname: string;
  rights: SimpleObject;
} | null;

type loginData = {
  username: string;
  password: string;
};

interface ResultWithMessage {
  message: string;
  result: any;
}

interface State {
  is_auth: boolean;
  user: User;
  globalLoader: boolean;
}

export const useUserStore = defineStore({
  id: "user",
  state: (): State => ({
    user: null,
    is_auth: false,
    globalLoader: true,
  }),
  getters: {
    getRights: (state): SimpleObject => state?.user?.rights || {},
    getUser: (state): User => state.user,
    getLoader: (state): boolean => state.globalLoader,
  },
  actions: {
    login(payload: loginData): Promise<boolean> {
      return axiosClient
        .post(`${envConfig.API_URL}auth/login`, payload)
        .then((resp) => {
          const respdata: ResultWithMessage = resp.data;
          if (
            Object.prototype.hasOwnProperty.call(respdata, "message") &&
            respdata.message === "ok"
          ) {
            this.is_auth = true;
            this.user = respdata.result;
            return true;
          } else {
            return respdata.message || -1;
          }
        })
        .catch((e) => errRequestHandler(e));
    },
    showLoader() {
      this.globalLoader = true;
    },
    hideLoader() {
      setTimeout(() => (this.globalLoader = false), 100);
    },
    logout(): Promise<boolean> {
      return axiosClient
        .get(`${envConfig.API_URL}auth/logout`)
        .then(() => true);
    },
    checkAuth(): Promise<boolean> {
      return axiosClient
        .get(`${envConfig.API_URL}auth/checkLogin`)
        .then((resp) => {
          this.is_auth = true;
          this.user = resp.data.auth;
          return true;
        })
        .catch(() => {
          this.is_auth = true;
          this.user = null;
          return false;
        });
    },
  },
});
