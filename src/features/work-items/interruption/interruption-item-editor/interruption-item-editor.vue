<template>
    <div class="interruption-item-editor-container">
        <div class="header">
            <input type="text"
                class="name"
                v-model="item.name"
                maxlength="140"
                placeholder="enter title here..." />
        </div>

        <textarea class="description"
            v-model="item.description"
            placeholder="no descriptions...">
        </textarea>

        <div class="footer">
            <template v-if="item.id !== -1">
                <play-circle v-if="!isActiveWorkItem"
                    class="action-button start-button"
                    @click="$emit('start', item)" />

                <stop-circle v-if="isActiveWorkItem"
                    class="action-button stop-button"
                    @click="$emit('stop', item)" />

                <check-bold v-if="!item.resolvedTime"
                    class="action-button resolve-button"
                    @click="$emit('resolve', item)" />
            </template>

            <selection-group class="priority-selector"
                :options="priorityOptions"
                :selectedOption="priority"
                @select="item.priority = $event.properties.priority">
            </selection-group>

            <div class="filler"></div>
            <span v-if="item.creationTime">Created {{ creationTime }}</span>
            <cloud-upload class="action-button save-button" @click="onSave()" />
            <delete-variant class="action-button delete-button" @click="$emit('delete', item)" />
        </div>
    </div>
</template>

<script lang="ts">
import { markRaw } from '@vue/reactivity';
import { Options, Vue, prop } from 'vue-class-component';
import { mapStores } from 'pinia';
import { CheckBold, CloudUpload, DeleteVariant, PlayCircle, StopCircle } from 'mdue';

import { useEventStore } from '../../../../stores/event/event.store';
import { DynamicComponentOption } from '../../../../core/models/options/dynamic-component-option';
import { InterruptionItem } from '../../../../core/models/interruption/interruption-item';
import { Priority } from '../../../../core/enums/priority.enum';
import { EventType } from '../../../../core/enums/event-type.enum';
import { TimeUtility } from '../../../../core/utilities/time-utility/time-utility';
import PriorityIndicator from '../../../../shared/indicators/priority-indicator/priority-indicator.vue';
import SelectionGroup from '../../../../shared/inputs/selection-group/selection-group.vue';

class InterruptionItemEditorProp {
    public item = prop<InterruptionItem>({ default: new InterruptionItem(-1) });
}

@Options({
    components: {
        CheckBold,
        CloudUpload,
        DeleteVariant,
        PlayCircle,
        StopCircle,
        PriorityIndicator,
        SelectionGroup
    },
    emits: [
        'create',
        'update',
        'delete',
        'start',
        'stop',
        'resolve'
    ],
    computed: {
        ...mapStores(useEventStore)
    }
})
/* istanbul ignore next */
export default class InterruptionItemEditor extends Vue.with(InterruptionItemEditorProp) {
    public readonly priorityOptions = [Priority.Low, Priority.Medium, Priority.High].map(_ => {
        const component = markRaw(PriorityIndicator);
        const properties = { priority: _ };

        return new DynamicComponentOption(component, properties);
    });

    private eventStore!: ReturnType<typeof useEventStore>;

    get priority(): DynamicComponentOption<typeof PriorityIndicator> {
        return this.priorityOptions.find(_ => _.properties.priority === this.item.priority)!;
    }

    get isActiveWorkItem(): boolean {
        return this.eventStore.isActiveWorkItem(EventType.Interruption, this.item.id);
    }

    get creationTime(): string {
        return TimeUtility.getDateTimeString(new Date(this.item.creationTime));
    }

    public onSave(): void {
        if (this.item.name.trim()) {
            const event = this.item.id === -1 ? 'create' : 'update';
            this.$emit(event, this.item);
        }
    }
}
</script>

<style lang="scss" scoped>
.interruption-item-editor-container {
    @import '../../../../styles/presets.scss';
    @import '../../../../styles/animations.scss';

    $content-width: 95%;

    @include flex-column(center, center);
    position: relative;
    box-sizing: border-box;

    .header {
        $starting-height: 87.5%;

        @include flex-row(center, center);
        position: absolute;
        top: 5%;
        width: calc(#{$content-width} + 2.5vh);
        height: $starting-height;
        border-radius: 5px;
        background-color: var(--primary-colors-10-00);
        box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.35);
        animation: raise-header 0.2s ease forwards, shrink-header 0.4s ease 0.2s forwards;

        .name {
            width: 90%;
            border: none;
            outline: none;
            background-color: var(--primary-colors-8-00);
            color: var(--font-colors-0-00);
            text-align: center;
            font-size: var(--font-sizes-600);
            font-family: inherit;
            @include animate-opacity(0, 1, 0.3s, 0.6s);
        }

        @keyframes raise-header {
            from {
                background-color: var(--primary-colors-10-00);
                box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.35);
            }
            to {
                background-color: var(--primary-colors-8-00);
                box-shadow: 0 0 6px 1px rgba(0, 0, 0, 0.35);
            }
        }

        @keyframes shrink-header {
            from { height: $starting-height; }
            to { height: 12.5%; }
        }
    }

    .description {
        box-sizing: border-box;
        padding: 1.75vh 1vh;
        margin-top: 10%;
        width: $content-width;
        height: 80%;
        border: none;
        outline: none;
        resize: none;
        border-radius: 0 0 5px 5px;
        background-color: var(--text-editor-color);
        color: var(--font-colors-0-00);
        font-size: inherit;
        font-family: inherit;
    }

    .footer {
        @include flex-row(center, flex-end);
        width: $content-width;
        height: 10%;
        color: var(--font-colors-2-00);
        font-size: var(--font-sizes-300);
        @include animate-opacity(0, 1, 0.3s, 0.6s);

        .priority-selector {
            font-size: var(--font-sizes-400);
        }

        .filler {
            flex-grow: 1;
        }

        .action-button {
            cursor: pointer;
            font-size: var(--font-sizes-600);
            transition: color 0.3s;
        }

        .start-button, .stop-button, .resolve-button {
            margin-right: 1vh;
        }

        .save-button, .delete-button {
            margin-left: 1vh;
        }

        .start-button {
            color: var(--start-button-color-inactive);

            &:hover {
                color: var(--start-button-color-active);
            }
        }

        .stop-button {
            color: var(--stop-button-color-inactive);

            &:hover {
                color: var(--stop-button-color-active);
            }
        }

        .resolve-button {
            color: var(--context-colors-success-1-00);

            &:hover {
                color: var(--context-colors-success-0-00);
            }
        }

        .save-button {
            color: var(--context-colors-info-1-00);

            &:hover {
                color: var(--context-colors-info-0-00);
            }
        }

        .delete-button {
            color: var(--context-colors-warning-1-00);

            &:hover {
                color: var(--context-colors-warning-0-00);
            }
        }
    }
}
</style>
