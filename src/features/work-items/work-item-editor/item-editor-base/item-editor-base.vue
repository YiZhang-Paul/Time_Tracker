<template>
    <div v-if="item && type" class="item-editor-base-container">
        <div class="header">
            <progress-indicator class="selector-wrapper"
                :style="{ '--item-editor-base-wrapper-color': wrapperColor }"
                :progress="progress">

                <slot name="selector"></slot>
            </progress-indicator>

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

            <expand-menu class="additional-actions action-button"
                :options="menuOptions"
                @select="onMenuOptionSelect($event)">
            </expand-menu>

            <icon-button class="close-button action-button" @click="$emit('close', item)">
                <close />
            </icon-button>
        </div>

        <div v-if="item.id !== -1" class="status-toggles">
            <expand-icon-button class="pending status-toggle"
                :text="'Pending'"
                :isActive="isPending"
                @click="onPending()">

                <refresh />
            </expand-icon-button>

            <expand-icon-button class="ongoing status-toggle"
                :text="'In Progress'"
                :isActive="isOngoing"
                @click="onStart()">

                <play-circle-outline />
            </expand-icon-button>

            <expand-icon-button class="resolved status-toggle"
                :text="'Done'"
                :isActive="isResolved"
                @click="onResolve()">

                <check />
            </expand-icon-button>
        </div>

        <div class="content">
            <textarea :id="textareaId"
                class="description"
                ref="descriptionInput"
                v-model="item.description"
                @update:modelValue="$emit('update:isSaved', false)"
                placeholder="no descriptions...">
            </textarea>

            <div class="side-panel">
                <item-checklists class="item-checklists"
                    v-model="item.checklists"
                    @update:modelValue="$emit('update:isSaved', false)">
                </item-checklists>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { Check, Close, CloudUpload, PlayCircleOutline, Refresh } from 'mdue';
import { mapStores } from 'pinia';
import OverlayScrollbars from 'overlayscrollbars';

import { useEventStore } from '../../../../stores/event/event.store';
import { InterruptionItem } from '../../../../core/models/interruption/interruption-item';
import { TaskItem } from '../../../../core/models/task/task-item';
import { EventType } from '../../../../core/enums/event-type.enum';
import { TimeUtility } from '../../../../core/utilities/time-utility/time-utility';
import FlatButton from '../../../../shared/buttons/flat-button/flat-button.vue';
import IconButton from '../../../../shared/buttons/icon-button/icon-button.vue';
import ExpandIconButton from '../../../../shared/buttons/expand-icon-button/expand-icon-button.vue';
import ExpandMenu from '../../../../shared/inputs/expand-menu/expand-menu.vue';
import ProgressIndicator from '../../../../shared/indicators/progress-indicator/progress-indicator.vue';

import ItemChecklists from './item-checklists/item-checklists.vue';

class ItemEditorBaseProp {
    public item = prop<InterruptionItem & TaskItem>({ default: null });
    public type = prop<EventType>({ default: null });
    public isSaved = prop<boolean>({ default: true });
}

@Options({
    components: {
        Check,
        Close,
        CloudUpload,
        PlayCircleOutline,
        Refresh,
        FlatButton,
        IconButton,
        ExpandIconButton,
        ExpandMenu,
        ProgressIndicator,
        ItemChecklists
    },
    emits: [
        'close',
        'create',
        'update',
        'update:isSaved',
        'delete',
        'pending',
        'start',
        'resolve'
    ],
    computed: {
        ...mapStores(useEventStore)
    }
})
export default class ItemEditorBase extends Vue.with(ItemEditorBaseProp) {
    public readonly textareaId = `textarea-${Date.now()}`;
    public readonly menuOptions = ['Delete'];
    private eventStore!: ReturnType<typeof useEventStore>;

    get progress(): number {
        const { checklists } = this.item;

        if (!checklists.length) {
            return 0;
        }

        return checklists.filter(_ => _.isCompleted).length / checklists.length * 100;
    }

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

    get isPending(): boolean {
        return !this.isOngoing && !this.isResolved;
    }

    get isOngoing(): boolean {
        return this.eventStore.isActiveWorkItem(this.type, this.item.id);
    }

    get isResolved(): boolean {
        return Boolean(this.item.resolvedTime);
    }

    public mounted(): void {
        if (!this.item) {
            return;
        }

        OverlayScrollbars(document.getElementById(this.textareaId)!, {
            scrollbars: {
                autoHide: 'leave',
                autoHideDelay: 100
            },
            textarea: {
                dynWidth: true,
                dynHeight: true
            }
        });

        if (this.isExistingItem) {
            (this.$refs.descriptionInput as HTMLElement).focus();
        }
        else {
            (this.$refs.nameInput as HTMLElement).focus();
        }
    }

    public onSave(): void {
        if (this.item.name.trim()) {
            this.item.checklists = this.item.checklists.filter(_ => _.description.trim());
            this.$emit(this.isExistingItem ? 'update' : 'create', this.item);
        }
    }

    public onMenuOptionSelect(option: string): void {
        if (option === this.menuOptions[0]) {
            this.$emit('delete', this.item);
        }
    }

    public onPending(): void {
        if (!this.isPending) {
            this.$emit('pending', this.item);
        }
    }

    public onStart(): void {
        if (!this.isOngoing) {
            this.$emit('start', this.item);
        }
    }

    public onResolve(): void {
        if (!this.isResolved) {
            this.$emit('resolve', this.item);
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

            margin-left: calc(2.25vh - #{$gap});
            margin-right: 1.75vh;
            width: $dimension;
            min-width: $dimension;
            height: $dimension;
            min-height: $dimension;
            border-color: var(--item-editor-base-wrapper-color);

            ::v-deep(.progress) {
                background-color: var(--item-editor-base-wrapper-color);
            }
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
            height: 3vh;
            color: var(--font-colors-3-00);
            font-size: var(--font-sizes-200);

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

        .additional-actions:hover, .additional-actions.active {
            background-color: var(--primary-colors-4-00);
            color: var(--font-colors-0-00);
        }

        .close-button:hover {
            background-color: var(--context-colors-warning-1-00);
            color: var(--font-colors-0-00);
        }
    }

    .status-toggles {
        @include flex-row(center);
        width: 100%;
        @include animate-opacity(0, 1, 0.3s);

        .status-toggle {
            color: var(--font-colors-1-00);
            opacity: 0.35;

            &:hover, &.active {
                color: var(--font-colors-0-00);
                opacity: 1;
            }

            &:not(:first-of-type) {
                margin-left: 1vh;
            }
        }

        .pending {
            background-color: var(--context-colors-suggestion-1-00);

            &:hover, &.active {
                box-shadow: 0 0 6px 1px var(--context-colors-suggestion-1-03);
            }
        }

        .ongoing {
            background-color: var(--context-colors-info-1-00);

            &:hover, &.active {
                box-shadow: 0 0 6px 1px var(--context-colors-info-1-03);
            }
        }

        .resolved {
            background-color: var(--context-colors-success-1-00);

            &:hover, &.active {
                box-shadow: 0 0 6px 1px var(--context-colors-success-1-03);
            }
        }
    }

    .content {
        $description-width: 65%;

        @include flex-row(initial, center);
        box-sizing: border-box;
        width: 100%;
        height: 75%;

        ::v-deep(.description), .side-panel {
            height: 100%;
            border-radius: $border-radius;
            background-color: var(--primary-colors-10-00);
        }

        ::v-deep(.description) {
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
            @include flex-row(center, center);
            box-sizing: border-box;
            margin-left: $gap;
            width: calc(100% - #{$description-width} - #{$gap});

            .item-checklists {
                width: 100%;
                height: 100%;
            }
        }
    }
}
</style>
