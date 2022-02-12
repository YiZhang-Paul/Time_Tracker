<template>
    <div class="item-checklists-container">
        <flat-button class="add-button" @click="onEntryAdd()"><plus /></flat-button>

        <checklist-entry-card v-for="(entry, index) in modelValue"
            class="entry"
            :entry="entry"
            :key="index"
            @change="onEntryChange($event, index)"
            @delete="onEntryDelete(index)">
        </checklist-entry-card>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { Plus } from 'mdue';

import { ChecklistEntry } from '../../../../../core/models/generic/checklist-entry';
import FlatButton from '../../../../../shared/buttons/flat-button/flat-button.vue';

import ChecklistEntryCard from './checklist-entry-card/checklist-entry-card.vue';

class ItemChecklistsProp {
    public modelValue = prop<ChecklistEntry[]>({ default: [] });
}

@Options({
    components: {
        Plus,
        FlatButton,
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

    .entry {
        width: 100%;

        &:not(:first-of-type) {
            margin-top: 0.75vh;
        }
    }
}
</style>
