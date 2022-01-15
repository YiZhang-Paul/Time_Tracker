import { createApp } from 'vue';

import { createStore } from './store';
import { types } from './core/ioc/types';
import { container } from './core/ioc/container';
import App from './app.vue';

const store = container.get<ReturnType<typeof createStore>>(types.Store);
createApp(App).use(store.base).mount('#app');
