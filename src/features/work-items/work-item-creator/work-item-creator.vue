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
import { useTaskStore } from '../../../stores/task/task.store';
import { types } from '../../../core/ioc/types';
import { container } from '../../../core/ioc/container';
import { DialogConfig } from '../../../core/models/generic/dialog-config';
import { InterruptionStateService } from '../../../core/services/states/interruption-state/interruption-state.service';
import CreationButton from '../../../shared/buttons/creation-button/creation-button.vue';
import WorkItemTypeSelectionDialog from '../../../shared/dialogs/work-item-type-selection-dialog/work-item-type-selection-dialog.vue';

@Options({
    components: {
        CreationButton
    },
    computed: {
        ...mapStores(useDialogStore, useTaskStore)
    }
})
export default class WorkItemCreator extends Vue {
    private dialogStore!: ReturnType<typeof useDialogStore>;
    private taskStore!: ReturnType<typeof useTaskStore>;
    private interruptionState = container.get<InterruptionStateService>(types.InterruptionStateService);

    get canCreate(): boolean {
        return this.interruptionState.editingItem?.id !== -1 && this.taskStore.editingItem?.id !== -1;
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
            this.interruptionState.startItemCreate();
        }
        else {
            this.interruptionState.stopItemEdit();
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
