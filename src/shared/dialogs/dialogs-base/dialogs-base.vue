<template>
    <div class="dialogs-base-container">
        <dialog-panel v-for="(config, index) in configs"
            :key="index"
            :dialog="config.component"
            :data="config.data"
            :width="config.options.width"
            :height="config.options.height">
        </dialog-panel>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

import store from '../../../store';
import { DialogConfig } from '../../../core/models/generic/dialog-config';
import DialogPanel from '../../panels/dialog-panel/dialog-panel.vue';

@Options({
    components: {
        DialogPanel
    }
})
export default class DialogsBase extends Vue {
    get configs(): DialogConfig<unknown, unknown>[] {
        return store.dialog.getters(store.dialog.getter.Configs);
    }
}
</script>

<style lang="scss" scoped>
.dialogs-base-container {
    position: absolute;
    z-index: 99999;
}
</style>
