<template>
    <div v-if="source" class="event-timeline-editor-container">
        <div class="basic-inputs">
            <tab-group v-model="typeOptions" class="type-group" @update:modelValue="onTypeSelect()"></tab-group>

            <div class="time-range">
                <span>from</span>
                <div class="value-tag">{{ start }}</div>
                <span>to</span>
                <div class="value-tag">{{ end }}</div>
            </div>

            <div class="target">
                <span>for</span>

                <div class="value-tag">
                    <component v-if="name"
                        class="icon"
                        :is="icon.component"
                        :style="{ color: icon.color }">
                    </component>

                    <span>{{ name ?? '?' }}</span>
                </div>
            </div>
        </div>

        <range-slider class="range-slider"
            :modelValue="selectedRange"
            :boundary="rangeBoundary"
            :transform="transformRange"
            :isDisabled="!canSelectRange"
            @update:modelValue="onRangeSelect($event)">
        </range-slider>

        <flat-button class="confirm-button"
            :isDisabled="isSaved"
            @click="$emit('update', target)">

            Confirm
        </flat-button>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { ref } from '@vue/reactivity';

import { Range } from '../../../../core/models/generic/range';
import { IconConfig } from '../../../../core/models/generic/icon-config';
import { ActionGroupOption } from '../../../../core/models/options/action-group-option';
import { EventTimelineEditorOption } from '../../../../core/models/options/event-timeline-editor-option';
import { EventType } from '../../../../core/enums/event-type.enum';
import { IconUtility } from '../../../../core/utilities/icon-utility/icon-utility';
import { TimeUtility } from '../../../../core/utilities/time-utility/time-utility';
import FlatButton from '../../../../shared/buttons/flat-button/flat-button.vue';
import RangeSlider from '../../../../shared/inputs/range-slider/range-slider.vue';
import TabGroup from '../../../../shared/inputs/tab-group/tab-group.vue';

class EventTimelineEditorProp {
    public source = prop<EventTimelineEditorOption>({ default: null });
}

@Options({
    components: {
        FlatButton,
        RangeSlider,
        TabGroup
    },
    emits: [
        'update'
    ]
})
export default class EventTimelineEditor extends Vue.with(EventTimelineEditorProp) {
    public typeOptions: ActionGroupOption<EventType>[] = [];
    public target = ref({ ...this.source }).value;
    public isSaved = true;

    private readonly icons = {
        [EventType.Idling]: IconUtility.getIdlingTypeIcon(),
        [EventType.Break]: IconUtility.getBreakTypeIcon(),
        [EventType.Interruption]: IconUtility.getInterruptionTypeIcon(),
        [EventType.Task]: IconUtility.getTaskTypeIcon()
    };

    get start(): string {
        return TimeUtility.getTimeString(this.target.start, false);
    }

    get end(): string {
        return TimeUtility.getTimeString(this.target.end, false);
    }

    get icon(): IconConfig {
        return this.icons[this.target.eventType];
    }

    get name(): string {
        const { name, eventType } = this.target;

        if (eventType !== EventType.Idling && eventType !== EventType.Break) {
            return name;
        }

        return eventType === EventType.Idling ? 'Untracked' : 'Sleep & Break';
    }

    get rangeBoundary(): Range<number> {
        const { start, end } = this.source;

        return new Range(start.getTime(), end.getTime());
    }

    get selectedRange(): Range<number> {
        const { start, end } = this.target;

        return new Range(start.getTime(), end.getTime());
    }

    get canSelectRange(): boolean {
        if (this.target.eventType === EventType.Idling) {
            return false;
        }

        const { start, end } = this.rangeBoundary;

        return end - start >= TimeUtility.convertTime(5, 'minute', 'millisecond');
    }

    public created(): void {
        const { eventType } = this.target;

        this.typeOptions = [
            new ActionGroupOption('', IconUtility.getIdlingTypeIcon(), EventType.Idling, eventType === EventType.Idling),
            new ActionGroupOption('', IconUtility.getBreakTypeIcon(), EventType.Break, eventType === EventType.Break),
            new ActionGroupOption('', IconUtility.getInterruptionTypeIcon(), EventType.Interruption, eventType === EventType.Interruption),
            new ActionGroupOption('', IconUtility.getTaskTypeIcon(), EventType.Task, eventType === EventType.Task)
        ];
    }

    public onTypeSelect(): void {
        const { data } = this.typeOptions.find(_ => _.isActive)!;
        this.target.eventType = data!;

        if (data === EventType.Idling) {
            this.target.start = this.source.start;
            this.target.end = this.source.end;
        }
    }

    public transformRange(time: number): string {
        return TimeUtility.getTimeString(new Date(time), false);
    }

    public onRangeSelect({ start, end }: Range<number>): void {
        this.target.start = new Date(start);
        this.target.end = new Date(end);
        this.isSaved = false;
    }
}
</script>

<style lang="scss" scoped>
.event-timeline-editor-container {
    @import '../../../../styles/presets.scss';
    @import '../../../../styles/animations.scss';

    @include flex-column(center, space-between);
    box-sizing: border-box;
    padding: 1.5vh;
    border-radius: 10px;
    box-shadow: 0 0 3px 2px rgba(0, 0, 0, 0.1);
    background-color: var(--primary-colors-9-00);
    font-size: var(--font-sizes-300);

    .basic-inputs {
        $gap: 1vh;

        @include flex-row(center);
        margin-left: 2.5%;
        width: 100%;
        @include animate-property(opacity, 0, 1, 0.3s, 0.2s);

        .value-tag {
            padding: 3px 10px;
            margin-left: $gap;
            border-radius: 25px;
            background-color: var(--primary-colors-6-00);
        }

        .time-range {
            @include flex-row(center);
            margin-left: 10%;

            span:not(:first-of-type) {
                margin-left: $gap;
            }

            .value-tag {
                min-width: 2.5rem;
                text-align: center;
            }
        }

        .target {
            @include flex-row(center);
            margin-left: $gap;

            div {
                @include flex-row(center);

                .icon {
                    margin-right: 0.5vh;
                    font-size: var(--font-sizes-400);
                }

                span {
                    max-width: 15vw;
                    @include line-overflow();
                }
            }
        }
    }

    .range-slider {
        width: 95%;
        @include animate-property(opacity, 0, 1, 0.3s, 0.2s);
    }

    .confirm-button {
        align-self: flex-end;
        font-size: var(--font-sizes-200);
        transition: all 0.3s;
        @include animate-property(opacity, 0, 1, 0.3s, 0.2s);

        &:not(.disabled) {
            box-shadow: 0 0 5px 2px var(--context-colors-success-1-03);
            background-color: var(--context-colors-success-1-00);
        }
    }
}
</style>
