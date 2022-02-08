<template>
    <div v-if="item && type" class="item-editor-base-container">
        <div class="header">
            <div class="selector-wrapper" :style="{ 'border-color': wrapperColor }">
                <slot name="selector"></slot>
            </div>

            <div class="basic-information">
                <input type="text"
                    class="name"
                    ref="nameInput"
                    v-model="item.name"
                    @update:modelValue="$emit('update:isSaved', false)"
                    maxlength="140"
                    placeholder="enter title here..." />

                <span class="modified-time">
                    {{ isExistingItem ? `Updated ${modifiedTime}` : 'not created yet' }}
                </span>
            </div>
        </div>

        <div class="editor-actions">
            <flat-button class="save-button action-button" :isDisabled="isSaved" @click="onSave()">
                <cloud-upload v-if="!isSaved" class="icon" />
                <span v-if="isExistingItem && isSaved">Saved</span>
                <span v-if="!isSaved">{{ isExistingItem ? 'Save' : 'Create' }}</span>
            </flat-button>

            <icon-button class="close-button action-button" @click="$emit('close', item)">
                <close />
            </icon-button>
        </div>

        <div class="content">
            <textarea class="description"
                ref="descriptionInput"
                v-model="item.description"
                @update:modelValue="$emit('update:isSaved', false)"
                placeholder="no descriptions...">
            </textarea>

            <div class="side-panel"></div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { Close, CloudUpload } from 'mdue';

import { InterruptionItem } from '../../../../core/models/interruption/interruption-item';
import { TaskItem } from '../../../../core/models/task/task-item';
import { EventType } from '../../../../core/enums/event-type.enum';
import { TimeUtility } from '../../../../core/utilities/time-utility/time-utility';
import FlatButton from '../../../../shared/buttons/flat-button/flat-button.vue';
import IconButton from '../../../../shared/buttons/icon-button/icon-button.vue';

class ItemEditorBaseProp {
    public item = prop<InterruptionItem & TaskItem>({ default: null });
    public type = prop<EventType>({ default: null });
    public isSaved = prop<boolean>({ default: true });
}

@Options({
    components: {
        Close,
        CloudUpload,
        FlatButton,
        IconButton
    },
    emits: [
        'close',
        'create',
        'update',
        'update:isSaved'
    ]
})
export default class ItemEditorBase extends Vue.with(ItemEditorBaseProp) {
    get wrapperColor(): string {
        const type = this.type === EventType.Task ? 'task' : 'interruption';

        return `var(--item-type-colors-${type}-0-00)`;
    }

    get modifiedTime(): string {
        return TimeUtility.getDateTimeString(new Date(this.item.modifiedTime));
    }

    get isExistingItem(): boolean {
        return this.item.id !== -1;
    }

    public mounted(): void {
        if (this.isExistingItem) {
            (this.$refs.descriptionInput as HTMLElement).focus();
        }
        else {
            (this.$refs.nameInput as HTMLElement).focus();
        }
    }

    public onSave(): void {
        if (this.item.name.trim()) {
            this.$emit(this.isExistingItem ? 'update' : 'create', this.item);
        }
    }
}
</script>

<style lang="scss" scoped>
.item-editor-base-container {
    @import '../../../../styles/presets.scss';
    @import '../../../../styles/animations.scss';

    $gap: 2vh;
    $border-radius: 5px;

    @include flex-column(center, space-between);
    box-sizing: border-box;
    position: relative;
    padding: $gap;
    border-radius: $border-radius;
    background-color: var(--primary-colors-9-00);
    box-shadow: 0 0 6px 1px rgba(0, 0, 0, 0.35);
    @include animate-opacity(0, 1, 0.3s, 0.2s);

    .header {
        @include flex-row(center);
        width: 100%;
        height: 12.5%;

        .selector-wrapper {
            $dimension: 6vh;

            @include flex-row(center, center);
            margin-left: calc(2.25vh - #{$gap});
            margin-right: 1.75vh;
            width: $dimension;
            min-width: $dimension;
            height: $dimension;
            min-height: $dimension;
            border: 2px dashed;
            border-radius: 50%;
            color: var(--font-colors-2-00);
            font-size: var(--font-sizes-500);
        }

        .basic-information {
            @include flex-column(initial, center);
            width: 100%;

            .name {
                width: 75%;
                border: none;
                outline: none;
                background-color: transparent;
                color: var(--font-colors-0-00);
                font-size: var(--font-sizes-500);
                font-family: inherit;
            }

            .modified-time {
                margin-top: 0.15rem;
                margin-left: 0.15rem;
                color: var(--font-colors-4-00);
                font-size: var(--font-sizes-300);
            }
        }
    }

    .editor-actions {
        @include flex-row(center, center);
        position: absolute;
        top: $gap;
        right: $gap;

        .action-button {
            transition: all 0.3s;

            &:not(:first-child) {
                margin-left: 1.25vh;
            }
        }

        .save-button {

            &:not(.disabled) {
                background-color: var(--context-colors-info-1-00);
                box-shadow: 0 0 6px 1px var(--context-colors-info-1-03);
                color: var(--font-colors-0-00);

                &:hover {
                    background-color: var(--context-colors-info-0-00);
                    box-shadow: 0 0 6px 2px var(--context-colors-info-0-03);
                }
            }

            &.disabled {
                background-color: transparent;
            }

            .icon, span {
                @include animate-opacity(0, 1, 0.3s);
            }

            .icon {
                margin-right: 0.75vh;
                font-size: var(--font-sizes-400);
            }
        }

        .close-button:hover {
            background-color: var(--context-colors-warning-1-00);
            color: var(--font-colors-0-00);
        }
    }

    .content {
        $description-width: 70%;

        @include flex-row(initial, center);
        box-sizing: border-box;
        width: 100%;
        height: 75%;

        .description, .side-panel {
            height: 100%;
            border-radius: $border-radius;
            background-color: var(--primary-colors-10-00);
        }

        .description {
            box-sizing: border-box;
            padding: 1vh;
            width: $description-width;
            border: none;
            outline: none;
            resize: none;
            color: var(--font-colors-0-00);
            font-size: inherit;
            font-family: inherit;
        }

        .side-panel {
            margin-left: $gap;
            width: calc(100% - #{$description-width});
        }
    }
}
</style>
