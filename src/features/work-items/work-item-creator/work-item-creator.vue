<template>
    <div class="work-item-creator-container" ref="container">
        <creation-button class="create-button"
            @click="showTypes = canCreate ? !showTypes : showTypes"
            :isDisabled="!canCreate">
        </creation-button>

        <div v-if="showTypes" class="types">
            <div class="type interruption-type" @click.stop="onTypeSelect(true)">
                <component :is="interruptionIcon.component" :style="{ color: interruptionIcon.color }"></component>
                <span>interruption</span>
            </div>

            <div class="type task-type" @click.stop="onTypeSelect(false)">
                <component :is="taskIcon.component" :style="{ color: taskIcon.color }"></component>
                <span>task</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { mapStores } from 'pinia';

import { useInterruptionStore } from '../../../stores/interruption/interruption.store';
import { useTaskStore } from '../../../stores/task/task.store';
import { DomUtility } from '../../../core/utilities/dom-utility/dom-utility';
import { IconUtility } from '../../../core/utilities/icon-utility/icon-utility';
import CreationButton from '../../../shared/buttons/creation-button/creation-button.vue';

@Options({
    components: {
        CreationButton
    },
    computed: {
        ...mapStores(useInterruptionStore, useTaskStore)
    }
})
export default class WorkItemCreator extends Vue {
    public readonly interruptionIcon = IconUtility.getInterruptionTypeIcon();
    public readonly taskIcon = IconUtility.getTaskTypeIcon();
    public showTypes = false;
    private interruptionStore!: ReturnType<typeof useInterruptionStore>;
    private taskStore!: ReturnType<typeof useTaskStore>;

    get canCreate(): boolean {
        return this.interruptionStore.editingItem?.id !== -1 && this.taskStore.editingItem?.id !== -1;
    }

    public mounted(): void {
        document.addEventListener('click', this.checkClickOutside);
    }

    public beforeUnmount(): void {
        document.removeEventListener('click', this.checkClickOutside);
    }

    public onTypeSelect(isInterruption: boolean): void {
        if (isInterruption) {
            this.taskStore.stopItemEdit();
            this.interruptionStore.startItemCreate();
        }
        else {
            this.interruptionStore.stopItemEdit();
            this.taskStore.startItemCreate();
        }

        this.showTypes = false;
    }

    private checkClickOutside(event: Event): void {
        if (DomUtility.isClickOutside(event, this.$refs.container as HTMLElement)) {
            this.showTypes = false;
        }
    }
}
</script>

<style lang="scss" scoped>
.work-item-creator-container {
    @import '../../../styles/presets.scss';
    @import '../../../styles/animations.scss';

    @include flex-row(center, center);
    position: relative;
    width: 100%;
    height: 100%;

    .create-button {
        width: 100%;
        height: 100%;
    }

    .types {
        @include flex-row(center, center);
        position: absolute;
        bottom: calc(100% + 1.25vh);
        @include animate-property(opacity, 0, 1, 0.2s);

        .type {
            @include flex-column(center, center);
            padding: 1vh;
            min-width: 3.5vw;
            border-radius: 5px;
            border: 2px solid var(--primary-colors-4-00);
            background-color: var(--primary-colors-9-00);
            color: var(--font-colors-0-00);
            font-size: var(--font-sizes-600);
            transition: all 0.2s;

            &:not(:last-of-type) {
                margin-right: 0.75vh;
            }

            &:hover {
                cursor: pointer;
                background-color: var(--primary-colors-7-00);
            }

            &.interruption-type:hover {
                color: var(--item-type-colors-interruption-0-00);
            }

            &.task-type:hover {
                color: var(--item-type-colors-task-0-00);
            }

            span {
                margin-top: 3px;
                font-size: var(--font-sizes-300);
            }
        }
    }
}
</style>
