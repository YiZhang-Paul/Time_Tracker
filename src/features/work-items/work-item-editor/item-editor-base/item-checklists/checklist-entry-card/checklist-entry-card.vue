<template>
    <div class="checklist-entry-card-container">
        <div class="status-toggle" :class="{ disabled: !entry.description }" @click="onStatusChange()">
            <radiobox-blank v-if="!entry.isCompleted" class="incomplete-button" />
            <check v-if="entry.isCompleted" class="complete-button" />
        </div>

        <span v-if="!isEditing"
            class="entry-description"
            :class="{ completed: entry.isCompleted }"
            @click="onEditStart()">

            {{ entry.description }}
        </span>

        <input type="text"
            v-if="isEditing"
            class="entry-description"
            ref="descriptionInput"
            v-model="editContent"
            maxlength="100"
            placeholder="what needs to be done?"
            @keyup.enter="onEditConfirm()"
            @keyup.esc="onEditCancel()"
            @blur="onEditConfirm()" />

        <delete class="delete-button" @click="$emit('delete')" />
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { Check, Delete, RadioboxBlank } from 'mdue';

import { ChecklistEntry } from '../../../../../../core/models/generic/checklist-entry';

class ChecklistEntryCardProp {
    public entry = prop<ChecklistEntry>({ default: new ChecklistEntry() });
}

@Options({
    components: {
        Check,
        Delete,
        RadioboxBlank
    },
    watch: {
        entry(): void {
            this.initialize();
        }
    },
    emits: [
        'change',
        'delete'
    ]
})
export default class ChecklistEntryCard extends Vue.with(ChecklistEntryCardProp) {
    public editContent = '';
    public isEditing = false;

    public mounted(): void {
        this.initialize();
    }

    public onEditStart(): void {
        this.isEditing = true;
        setTimeout(() => (this.$refs.descriptionInput as HTMLElement).focus());
    }

    public onEditConfirm(): void {
        if (this.editContent) {
            this.isEditing = false;
            this.$emit('change', { ...this.entry, description: this.editContent });
        }
    }

    public onEditCancel(): void {
        if (this.entry.description) {
            this.isEditing = false;
        }
    }

    public onStatusChange(): void {
        if (this.entry.description) {
            this.$emit('change', { ...this.entry, isCompleted: !this.entry.isCompleted });
        }
    }

    private initialize(): void {
        this.editContent = this.entry.description;

        if (!this.editContent) {
            this.onEditStart();
        }
    }
}
</script>

<style lang="scss" scoped>
.checklist-entry-card-container {
    @import '../../../../../../styles/presets.scss';
    @import '../../../../../../styles/animations.scss';

    @include flex-row(center, space-between);
    box-sizing: border-box;
    padding: 0.75vh 1vh;
    border-radius: 4px;
    background-color: var(--primary-colors-8-00);
    color: var(--font-colors-1-00);
    font-size: var(--font-sizes-500);
    transition: background-color 0.3s;

    &:hover {
        background-color: var(--primary-colors-6-00);

        .delete-button {
            opacity: 1;
        }
    }

    .status-toggle {
        @include flex-row(center, center);

        &.disabled .incomplete-button, &.disabled .complete-button {
            color: var(--context-colors-disabled-0-00);
        }

        &:hover {
            cursor: pointer;
        }

        .incomplete-button, .complete-button {
            transition: color 0.4s;
            @include animate-opacity(0, 1, 0.3s, 0.1s);
        }

        .incomplete-button {
            color: var(--context-colors-suggestion-0-00);
        }

        .complete-button {
            color: var(--context-colors-success-0-00);
        }
    }

    .entry-description {
        box-sizing: border-box;
        padding: 2px 5px;
        width: 82.5%;
        font-size: var(--font-sizes-300);
        font-family: inherit;
        @include animate-opacity(0, 1, 0.1s);

        &:hover {
            cursor: pointer;
        }
    }

    span.entry-description {
        @include line-overflow();
        transition: filter 0.3s, background-color 0.3s 0.1s;

        &:hover {
            background-color: var(--primary-colors-6-00);
        }

        &.completed {
            filter: brightness(0.6);
        }
    }

    input.entry-description {
        outline: none;
        border: none;
        background-color: var(--primary-colors-9-00);
        color: var(--font-colors-0-00);
    }

    .delete-button {
        opacity: 0;
        transition: color 0.3s, opacity 0.3s;

        &:hover {
            cursor: pointer;
            color: var(--context-colors-warning-1-00);
        }
    }
}
</style>
