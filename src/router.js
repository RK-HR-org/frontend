import { createRouter, createWebHistory } from "vue-router";
import Home from "./pages/Home.vue";
import Login from "./pages/Login.vue";
import AccountPage from "./pages/AccountPage.vue";
import Users from "./pages/Users.vue";
import Teams from "./pages/Teams.vue";
import Roles from "./pages/Roles.vue";
import TeamDetail from "./pages/TeamDetail.vue";
import UserDetail from "./pages/UserDetail.vue";
import Forbidden from "./pages/Forbidden.vue";
import HHSearch from "./pages/HHSearch.vue";
import SessionItems from "./pages/SessionItems.vue";
import SessionList from "./pages/SessionList.vue";
import HHCallback from "./pages/HHCallback.vue";
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
    path: "/forbidden",
    name: "Forbidden",
    component: Forbidden,
    meta: { requiresAuth: true },
  },
  {
    path: "/users",
    name: "Users",
    component: Users,
    meta: { requiresAuth: true },
  },
  {
    path: "/users/:userId",
    name: "UserDetail",
    component: UserDetail,
    meta: { requiresAuth: true },
  },
  {
    path: "/teams",
    name: "Teams",
    component: Teams,
    meta: { requiresAuth: true },
  },
  {
    path: "/teams/:teamId",
    name: "TeamDetail",
    component: TeamDetail,
    meta: { requiresAuth: true },
  },
  {
    path: "/roles",
    name: "Roles",
    component: Roles,
    meta: { requiresAuth: true },
  },
  {
    path: "/account",
    name: "Account",
    component: AccountPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/hh-search",
    name: "HHSearch",
    component: HHSearch,
    meta: { requiresAuth: true },
  },
  {
    path: "/search/sessions",
    name: "SessionList",
    component: SessionList,
    meta: { requiresAuth: true },
  },
  {
    path: "/search/sessions/:sessionId/items",
    name: "SessionItems",
    component: SessionItems,
    meta: { requiresAuth: true },
  },
  {
    path: "/hh/callback",
    name: "HHCallback",
    component: HHCallback,
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
