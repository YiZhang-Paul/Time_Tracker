<template>
    <div class="item-checklists-container">
        <flat-button class="add-button" @click="onEntryAdd()"><plus /></flat-button>

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
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { DragVertical, Plus } from 'mdue';
import Draggable from 'vuedraggable';

import { ChecklistEntry } from '../../../../../core/models/generic/checklist-entry';
import FlatButton from '../../../../../shared/buttons/flat-button/flat-button.vue';

import ChecklistEntryCard from './checklist-entry-card/checklist-entry-card.vue';

class ItemChecklistsProp {
    public modelValue = prop<ChecklistEntry[]>({ default: [] });
}

@Options({
    components: {
        DragVertical,
        Plus,
        FlatButton,
        Draggable,
        ChecklistEntryCard
    },
    emits: [
        'update:modelValue'
    ]
})
export default class ItemChecklists extends Vue.with(ItemChecklistsProp) {
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

    @include flex-column(center);

    .add-button {
        width: 100%;
        margin: 0.5vh 0 0.75vh 0;
        background-color: var(--primary-colors-7-00);
        color: var(--font-colors-2-00);
        transition: background-color 0.3s, color 0.3s;

        &:hover {
            background-color: var(--primary-colors-5-00);
            color: var(--font-colors-0-00);
        }
    }

    .drag-wrapper {
        width: 100%;

        .sortable-card {
            $handle-width: 0.5vh;

            @include flex-row(center);
            position: relative;
            margin-left: $handle-width;
            width: calc(100% - #{$handle-width});
            @include animate-opacity(0, 1, 0.3s);

            &:hover .list-handle {
                opacity: 1;
            }

            &:not(:first-of-type) {
                margin-top: 0.75vh;
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
            }
        }
    }
}
</style>
