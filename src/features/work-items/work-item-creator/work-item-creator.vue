<template>
    <div class="work-item-creator-container">
        <dialog-panel v-if="showTypeSelectionDialog"
            :dialog="typeSelectionDialog"
            :width="'35vw'"
            :height="'20vh'"
            @cancel="showTypeSelectionDialog = false"
            @confirm="onTypeSelect($event)">
        </dialog-panel>

        <creation-button class="creation-button"
            @click="showTypeSelectionDialog = canCreate"
            :isDisabled="!canCreate">
        </creation-button>
    </div>
</template>

<script lang="ts">
import { markRaw } from '@vue/reactivity';
import { Options, Vue } from 'vue-class-component';

import store from '../../../store';
import CreationButton from '../../../shared/buttons/creation-button/creation-button.vue';
import DialogPanel from '../../../shared/panels/dialog-panel/dialog-panel.vue';
import WorkItemTypeSelectionDialog from '../../../shared/dialogs/work-item-type-selection-dialog/work-item-type-selection-dialog.vue';

@Options({
    components: {
        CreationButton,
        DialogPanel
    }
})
export default class WorkItemCreator extends Vue {
    public readonly typeSelectionDialog = markRaw(WorkItemTypeSelectionDialog);
    public showTypeSelectionDialog = false;

    get canCreate(): boolean {
        const interruption = store.interruption.getters(store.interruption.getter.EditingItem);
        const task = store.task.getters(store.task.getter.EditingItem);

        return interruption?.id !== -1 && task?.id !== -1;
    }

    public onTypeSelect(isInterruption: boolean): void {
        if (isInterruption) {
            store.task.dispatch(store.task.action.EndTaskItemEdit);
            store.interruption.dispatch(store.interruption.action.StartInterruptionItemCreation);
        }
        else {
            store.interruption.dispatch(store.interruption.action.EndInterruptionItemEdit);
            store.task.dispatch(store.task.action.StartTaskItemCreation);
        }

        this.showTypeSelectionDialog = false;
    }
}
</script>

<style lang="scss" scoped>
.work-item-creator-container {

    .creation-button {
        width: 100%;
        height: 100%;
    }
}
</style>
