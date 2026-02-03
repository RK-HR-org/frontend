import { createRouter, createWebHistory } from "vue-router";
import Home from "./pages/Home.vue";
import Login from "./pages/Login.vue";
import AccountPage from "./pages/AccountPage.vue";
import Users from "./pages/Users.vue";
import Teams from "./pages/Teams.vue";
import { useAuthStore } from "./stores/auth";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/users",
    name: "Users",
    component: Users,
    meta: { requiresAuth: true },
  },
  {
    path: "/account",
    name: "Account",
    component: AccountPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/teams",
    name: "Teams",
    component: Teams,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth) {
    if (!auth.isAuthenticated) {
      await auth.checkAuth();
    }
    if (!auth.isAuthenticated) {
      return next({ path: "/login", query: { redirect: to.fullPath } });
    }
  }
  next();
});

export default router;
