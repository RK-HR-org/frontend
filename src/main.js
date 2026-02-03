import { createApp } from "vue";
import { createPinia } from "pinia";
import "./style.css";
import "./assets/css/main.css";
import App from "./App.vue";
import router from "./router.js";
import { useAuthStore } from "./stores/auth";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);

// Проверим auth при старте приложения
const auth = useAuthStore();
await auth.checkAuth();

app.mount("#app");
