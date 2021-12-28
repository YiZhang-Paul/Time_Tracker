import { createApp } from 'vue';

import App from './app.vue';
import store from './store';

createApp(App).use(store.store).mount('#app');
