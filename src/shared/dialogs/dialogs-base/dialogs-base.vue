<template>
    <div class="dialogs-base-container">
        <dialog-panel v-for="(config, index) in dialogStore.configs"
            :key="index"
            :dialog="config.component"
            :data="config.data"
            :width="config.options.width"
            :height="config.options.height"
            @cancel="onCancel($event, config)"
            @confirm="onConfirm($event, config)">
        </dialog-panel>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { mapStores } from 'pinia';

import { useDialogStore } from '../../../stores/dialog/dialog.store';
import { DialogConfig } from '../../../core/models/generic/dialog-config';
import DialogPanel from '../../panels/dialog-panel/dialog-panel.vue';

@Options({
    components: {
        DialogPanel
    },
    computed: {
        ...mapStores(useDialogStore)
    }
})
export default class DialogsBase extends Vue {
    public dialogStore!: ReturnType<typeof useDialogStore>;

    public async onCancel<T>(payload: T, config: DialogConfig<unknown, unknown>): Promise<void> {
        if (config.options.preCancel) {
            await config.options.preCancel(payload);
        }

        this.dialogStore.close(config);

        if (config.options.postCancel) {
            await config.options.postCancel(payload);
        }
    }

    public async onConfirm<T>(payload: T, config: DialogConfig<unknown, unknown>): Promise<void> {
        if (config.options.preConfirm) {
            await config.options.preConfirm(payload);
        }

        this.dialogStore.close(config);

        if (config.options.postConfirm) {
            await config.options.postConfirm(payload);
        }
    }
}
</script>

<style lang="scss" scoped>
.dialogs-base-container {
    position: absolute;
    z-index: 99999;
}
</style>
