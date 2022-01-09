<template>
    <creation-button class="work-item-creator-container"
        @click="onTypeSelectStart()"
        :isDisabled="!canCreate">
    </creation-button>
</template>

<script lang="ts">
import { markRaw } from '@vue/reactivity';
import { Options, Vue } from 'vue-class-component';

import { getStore } from '../../../store';
import { DialogConfig } from '../../../core/models/generic/dialog-config';
import CreationButton from '../../../shared/buttons/creation-button/creation-button.vue';
import WorkItemTypeSelectionDialog from '../../../shared/dialogs/work-item-type-selection-dialog/work-item-type-selection-dialog.vue';

@Options({
    components: {
        CreationButton
    }
})
export default class WorkItemCreator extends Vue {
    public store = getStore();

    get canCreate(): boolean {
        const interruption = this.store.interruption.getters(this.store.interruption.getter.EditingItem);
        const task = this.store.task.getters(this.store.task.getter.EditingItem);

        return interruption?.id !== -1 && task?.id !== -1;
    }

    public onTypeSelectStart(): void {
        const component = markRaw(WorkItemTypeSelectionDialog);
        const postConfirm = this.onTypeSelect.bind(this);
        const config = new DialogConfig(component, null, { width: '35vw', height: '20vh', postConfirm });
        this.store.dialog.dispatch(this.store.dialog.action.OpenDialog, config);
    }

    private onTypeSelect(isInterruption: boolean): void {
        if (isInterruption) {
            this.store.task.dispatch(this.store.task.action.EndTaskItemEdit);
            this.store.interruption.dispatch(this.store.interruption.action.StartInterruptionItemCreation);
        }
        else {
            this.store.interruption.dispatch(this.store.interruption.action.EndInterruptionItemEdit);
            this.store.task.dispatch(this.store.task.action.StartTaskItemCreation);
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
