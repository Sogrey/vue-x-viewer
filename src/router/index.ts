import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/viewer",
    },
    {
      path: "/viewer",
      name: "viewer",
      component: () => import("../views/ViewerView.vue"),
    },
  ],
});

export default router;
