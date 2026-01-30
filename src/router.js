import { createRouter, createWebHistory } from "vue-router";
import Home from "./pages/Home.vue";
import Login from "./pages/Login.vue";
import AccountPage from "./pages/AccountPage.vue";
import Users from "./pages/Users.vue";

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
  },
  {
    path: "/account",
    name: "Account",
    component: AccountPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
