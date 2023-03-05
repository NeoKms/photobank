import {
  createRouter,
  createWebHistory,
  type NavigationGuardNext,
} from "vue-router";
import { useUserStore } from "@/stores/user";

interface rightsObj {
  [key: string]: any;
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/LoginPage.vue"),
    },
    {
      path: "/",
      name: "Главная",
      component: () => import("@/views/DefaultLayout.vue"),
      meta: { requiresAuth: true, rights: { mh_photobank_front: 2 } },
      children: [
        {
          path: "",
          name: "Фотобанк",
          component: () => import("@/views/Photobank/PhotobankPage.vue"),
          meta: { requiresAuth: true, rights: { mh_photobank: 1 } },
        },
        {
          path: "/watermark",
          name: "Водяной знак",
          component: () => import("@/views/Photobank/WatermarkPage.vue"),
          meta: { requiresAuth: true, rights: { mh_photobank: 1 } },
        },
        {
          path: "/trash",
          name: "Корзина",
          component: () => import("@/views/Photobank/PhotobankTrashPage.vue"),
          meta: { requiresAuth: true, rights: { mh_photobank_trash: 1 } },
        },
        {
          path: "/users",
          name: "Создатели",
          component: () => import("@/views/Photobank/UsersPage.vue"),
          meta: { requiresAuth: true, rights: { mh_photobank: 1 } },
        },
        {
          path: "/settings",
          name: "Настройки",
          component: () => import("@/views/Photobank/PhotobankSettings.vue"),
          meta: { requiresAuth: true, rights: { mh_photobank: 1 } },
        },
      ],
    },
    {
      path: "/:catchAll(.*)",
      name: "404",
      component: () => import("@/views/404Page.vue"),
    },
  ],
});
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  userStore.showLoader();
  if (to.name === "login") {
    userStore.checkAuth().then((res) => {
      if (res) {
        return next("/");
      } else {
        next();
      }
    });
  } else if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (userStore.is_auth) {
      return chechRights(userStore, to.meta.rights as rightsObj, next);
    }
    return userStore.checkAuth().then((res) => {
      if (res) {
        return chechRights(userStore, to.meta.rights as rightsObj, next);
      } else {
        next("/login");
      }
    });
  } else {
    userStore.hideLoader();
    next();
  }
});
function chechRights(
  userStore: any,
  rightsObj: rightsObj,
  next: NavigationGuardNext
) {
  const rights = userStore.getRights;
  let access = true;
  for (const prop in rightsObj) {
    if (!rights[prop] || rights[prop] < rightsObj[prop]) {
      access = false;
      break;
    }
  }
  userStore.hideLoader();
  return access ? next() : next({ path: "401" });
}
export default router;
