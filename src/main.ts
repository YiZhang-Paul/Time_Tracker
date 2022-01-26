import { createApp } from 'vue';
import { createPinia } from 'pinia';
import 'overlayscrollbars/css/OverlayScrollbars.css';

import App from './app.vue';

createApp(App).use(createPinia()).mount('#app');
