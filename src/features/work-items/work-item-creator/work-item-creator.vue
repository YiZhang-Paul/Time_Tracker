<template>
    <div class="work-item-creator-container">
        <creation-button class="creation-button"
            @click="onItemCreationStart()"
            :isDisabled="!canCreateItem">
        </creation-button>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

import store from '../../../store';
import CreationButton from '../../../shared/buttons/creation-button/creation-button.vue';

@Options({
    components: {
        CreationButton
    }
})
export default class WorkItemCreator extends Vue {
    get canCreateItem(): boolean {
        const editingTaskItem = store.task.getters(store.task.getter.EditingItem);

        return editingTaskItem?.id !== -1;
    }

    public onItemCreationStart(): void {
        if (this.canCreateItem) {
            store.task.dispatch(store.task.action.StartTaskItemCreation);
        }
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
