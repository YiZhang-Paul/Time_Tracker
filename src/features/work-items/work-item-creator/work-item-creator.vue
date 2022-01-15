<template>
    <creation-button class="work-item-creator-container"
        @click="onTypeSelectStart()"
        :isDisabled="!canCreate">
    </creation-button>
</template>

<script lang="ts">
import { markRaw } from '@vue/reactivity';
import { Options, Vue } from 'vue-class-component';

import { createStore } from '../../../store';
import { types } from '../../../core/ioc/types';
import { container } from '../../../core/ioc/container';
import { DialogConfig } from '../../../core/models/generic/dialog-config';
import CreationButton from '../../../shared/buttons/creation-button/creation-button.vue';
import WorkItemTypeSelectionDialog from '../../../shared/dialogs/work-item-type-selection-dialog/work-item-type-selection-dialog.vue';

const store = container.get<ReturnType<typeof createStore>>(types.Store);

@Options({
    components: {
        CreationButton
    }
})
export default class WorkItemCreator extends Vue {
    get canCreate(): boolean {
        const interruption = store.interruption.getters(store.interruption.getter.EditingItem);
        const task = store.task.getters(store.task.getter.EditingItem);

        return interruption?.id !== -1 && task?.id !== -1;
    }

    public onTypeSelectStart(): void {
        const component = markRaw(WorkItemTypeSelectionDialog);
        const postConfirm = this.onTypeSelect.bind(this);
        const config = new DialogConfig(component, null, { width: '35vw', height: '20vh', postConfirm });
        store.dialog.dispatch(store.dialog.action.OpenDialog, config);
    }

    private onTypeSelect(isInterruption: boolean): void {
        if (isInterruption) {
            store.task.dispatch(store.task.action.EndTaskItemEdit);
            store.interruption.dispatch(store.interruption.action.StartInterruptionItemCreation);
        }
        else {
            store.interruption.dispatch(store.interruption.action.EndInterruptionItemEdit);
            store.task.dispatch(store.task.action.StartTaskItemCreation);
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
