import { defineStore } from 'pinia';

import { DialogConfig } from '../../core/models/generic/dialog-config';

export const useDialogStore = defineStore('dialog', {
    state: () => ({
        configs: [] as DialogConfig<unknown, unknown>[]
    }),
    actions: {
        open(config: DialogConfig<unknown, unknown>) {
            this.configs = [...this.configs, config];
        },
        close(config: DialogConfig<unknown, unknown>) {
            this.configs = this.configs.filter(_ => _ !== config);
        }
    }
});
