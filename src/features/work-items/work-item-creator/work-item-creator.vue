<template>
    <creation-button class="work-item-creator-container"
        @click="onTypeSelectStart()"
        :isDisabled="!canCreate">
    </creation-button>
</template>

<script lang="ts">
import { markRaw } from '@vue/reactivity';
import { Options, Vue } from 'vue-class-component';
import { mapStores } from 'pinia';

import { useDialogStore } from '../../../stores/dialog/dialog.store';
import { useInterruptionStore } from '../../../stores/interruption/interruption.store';
import { useTaskStore } from '../../../stores/task/task.store';
import { DialogConfig } from '../../../core/models/generic/dialog-config';
import CreationButton from '../../../shared/buttons/creation-button/creation-button.vue';
import WorkItemTypeSelectionDialog from '../../../shared/dialogs/work-item-type-selection-dialog/work-item-type-selection-dialog.vue';

@Options({
    components: {
        CreationButton
    },
    computed: {
        ...mapStores(useDialogStore, useInterruptionStore, useTaskStore)
    }
})
export default class WorkItemCreator extends Vue {
    private dialogStore!: ReturnType<typeof useDialogStore>;
    private interruptionStore!: ReturnType<typeof useInterruptionStore>;
    private taskStore!: ReturnType<typeof useTaskStore>;

    get canCreate(): boolean {
        return this.interruptionStore.editingItem?.id !== -1 && this.taskStore.editingItem?.id !== -1;
    }

    public onTypeSelectStart(): void {
        const component = markRaw(WorkItemTypeSelectionDialog);
        const postConfirm = this.onTypeSelect.bind(this);
        const config = new DialogConfig(component, null, { width: '35vw', height: '20vh', postConfirm });
        this.dialogStore.open(config);
    }

    private onTypeSelect(isInterruption: boolean): void {
        if (isInterruption) {
            this.taskStore.stopItemEdit();
            this.interruptionStore.startItemCreate();
        }
        else {
            this.interruptionStore.stopItemEdit();
            this.taskStore.startItemCreate();
        }
    }
}
</script>

<style lang="scss" scoped>
.work-item-creator-container {
    width: 100%;
    height: 100%;
}
</style>
