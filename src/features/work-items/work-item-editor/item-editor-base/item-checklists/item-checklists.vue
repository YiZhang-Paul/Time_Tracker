<template>
    <div class="item-checklists-container">
        <div class="header">
            <span class="title"
                :class="{ completed: isCompleted, empty: !modelValue.length }">

                Checklist {{ progressText }}
            </span>

            <icon-button class="add-button" :isDisabled="!canAddEntry" @click="onEntryAdd()">
                <plus />
            </icon-button>
        </div>

        <overlay-scrollbar-panel class="entries">
            <draggable class="drag-wrapper"
                :modelValue="modelValue"
                @update:modelValue="$emit('update:modelValue', $event)"
                handle=".list-handle"
                @change="$emit('update:modelValue', modelValue)"
                item-key="description">

                <template #item="{ element, index }">
                    <div class="sortable-card">
                        <drag-vertical class="list-handle" />

                        <checklist-entry-card class="entry"
                            :entry="element"
                            @change="onEntryChange($event, index)"
                            @delete="onEntryDelete(index)">
                        </checklist-entry-card>
                    </div>
                </template>
            </draggable>
        </overlay-scrollbar-panel>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { DragVertical, Plus } from 'mdue';
import Draggable from 'vuedraggable';

import { ChecklistEntry } from '../../../../../core/models/generic/checklist-entry';
import IconButton from '../../../../../shared/buttons/icon-button/icon-button.vue';
import OverlayScrollbarPanel from '../../../../../shared/panels/overlay-scrollbar-panel/overlay-scrollbar-panel.vue';

import ChecklistEntryCard from './checklist-entry-card/checklist-entry-card.vue';

class ItemChecklistsProp {
    public modelValue = prop<ChecklistEntry[]>({ default: [] });
}

@Options({
    components: {
        DragVertical,
        Plus,
        IconButton,
        Draggable,
        OverlayScrollbarPanel,
        ChecklistEntryCard
    },
    emits: [
        'update:modelValue'
    ]
})
export default class ItemChecklists extends Vue.with(ItemChecklistsProp) {
    get canAddEntry(): boolean {
        return this.modelValue.every(_ => Boolean(_.description));
    }

    get isCompleted(): boolean {
        return this.modelValue.length > 0 && this.modelValue.every(_ => _.isCompleted);
    }

    get progressText(): string {
        const completed = this.modelValue.filter(_ => _.isCompleted);

        return `${completed.length} / ${this.modelValue.length}`;
    }

    public onEntryAdd(): void {
        this.$emit('update:modelValue', [...this.modelValue, new ChecklistEntry()]);
    }

    public onEntryChange(entry: ChecklistEntry, index: number): void {
        const entries = [...this.modelValue.slice(0, index), entry, ...this.modelValue.slice(index + 1)];
        this.$emit('update:modelValue', entries);
    }

    public onEntryDelete(index: number): void {
        const entries = [...this.modelValue.slice(0, index), ...this.modelValue.slice(index + 1)];
        this.$emit('update:modelValue', entries);
    }
}
</script>

<style lang="scss" scoped>
.item-checklists-container {
    @import '../../../../../styles/presets.scss';
    @import '../../../../../styles/animations.scss';

    $gap: 1.75vh;

    @include flex-column(center);

    .header {
        @include flex-row(center, space-between);
        margin: 1vh 0 0.75vh 0;
        width: calc(100% - #{$gap} * 2);
        color: var(--font-colors-1-00);

        .title {
            margin-left: 0.25vh;
            font-size: var(--font-sizes-300);
            transition: color 0.5s;

            &.completed {
                color: var(--context-colors-success-1-00);
            }

            &.empty {
                color: var(--font-colors-4-00);
            }
        }

        .add-button {
            background-color: var(--primary-colors-7-00);
            font-size: var(--font-sizes-400);
            transition: background-color 0.3s, color 0.3s;

            &:hover {
                background-color: var(--primary-colors-5-00);
                color: var(--font-colors-0-00);
            }
        }
    }

    .entries {
        width: 100%;
        height: 100%;
    }

    .drag-wrapper {
        width: 100%;

        .sortable-card {
            @include flex-row(center);
            position: relative;
            margin: 0 $gap 0.75vh $gap;
            width: calc(100% - #{$gap} * 2);
            @include animate-opacity(0, 1, 0.3s);

            &:hover .list-handle {
                opacity: 1;
            }

            &:last-of-type {
                margin-bottom: 1.25vh;
            }

            .list-handle {
                $font-size: var(--font-sizes-700);

                position: absolute;
                right: calc(100% - #{$font-size} / 5);
                color: var(--font-colors-0-00);
                font-size: $font-size;
                transition: opacity 0.3s;
                opacity: 0;

                &:hover {
                    cursor: grab;
                }

                &:active {
                    cursor: grabbing;
                }
            }

            .entry {
                width: 100%;
                height: 100%;
                scroll-snap-align: start;
            }
        }
    }
}
</style>
