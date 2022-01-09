import { createApp } from 'vue';

import App from './app.vue';
import { getStore } from './store';

createApp(App).use(getStore().store).mount('#app');
