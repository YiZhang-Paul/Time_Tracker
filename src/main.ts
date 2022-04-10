import { createApp } from 'vue';
import { createPinia } from 'pinia';
import 'vue-advanced-cropper/dist/style.css';
import 'overlayscrollbars/css/OverlayScrollbars.css';

import App from './app.vue';
import { router } from './router';

createApp(App).use(router).use(createPinia()).mount('#app');
