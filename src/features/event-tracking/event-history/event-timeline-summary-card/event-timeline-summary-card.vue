<template>
    <div class="event-timeline-summary-card-container" ref="container">
        <div class="summary" :class="{ active: isExpanded }" @click="isExpanded = !isExpanded">
            <div class="type">
                <component :is="icon.component" :style="{ color: icon.color }"></component>
            </div>

            <span class="name">{{ name }}</span>
            <div class="range">{{ timeRange }}</div>

            <activity-indicator class="breakdown"
                :periods="timePeriods"
                :color="icon.color">
            </activity-indicator>

            <div class="duration">{{ duration }}</div>
        </div>

        <event-timeline-editor v-if="isExpanded"
            class="editor"
            :source="editorOption"
            @update="onUpdate($event)">
        </event-timeline-editor>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';

import { EventTimelineDto } from '../../../../core/dtos/event-timeline-dto';
import { IconConfig } from '../../../../core/models/generic/icon-config';
import { Range } from '../../../../core/models/generic/range';
import { EventTimelineEditorOption } from '../../../../core/models/options/event-timeline-editor-option';
import { EventType } from '../../../../core/enums/event-type.enum';
import { DomUtility } from '../../../../core/utilities/dom-utility/dom-utility';
import { IconUtility } from '../../../../core/utilities/icon-utility/icon-utility';
import { TimeUtility } from '../../../../core/utilities/time-utility/time-utility';
import ActivityIndicator from '../../../../shared/indicators/activity-indicator/activity-indicator.vue';
import EventTimelineEditor from '../event-timeline-editor/event-timeline-editor.vue';

class EventTimelineSummaryCardProp {
    public current = prop<EventTimelineDto>({ default: new EventTimelineDto() });
    public next = prop<EventTimelineDto | null>({ default: null });
}

@Options({
    components: {
        ActivityIndicator,
        EventTimelineEditor
    },
    emits: [
        'update'
    ]
})
export default class EventTimelineSummaryCard extends Vue.with(EventTimelineSummaryCardProp) {
    public isExpanded = false;

    private readonly icons = {
        [EventType.Idling]: IconUtility.getIdlingTypeIcon(),
        [EventType.Break]: IconUtility.getBreakTypeIcon(),
        [EventType.Interruption]: IconUtility.getInterruptionTypeIcon(),
        [EventType.Task]: IconUtility.getTaskTypeIcon()
    };

    get editorOption(): EventTimelineEditorOption {
        const { id, eventType, name, startTime } = this.current;
        const endTime = Math.min(this.endTime.getTime(), Date.now());

        return new EventTimelineEditorOption(id, eventType, name, new Date(startTime), new Date(endTime));
    }

    get icon(): IconConfig {
        return this.icons[this.current.eventType];
    }

    get name(): string {
        const { name, eventType } = this.current;

        if (eventType !== EventType.Idling && eventType !== EventType.Break) {
            return name;
        }

        return eventType === EventType.Idling ? 'Untracked' : 'Break';
    }

    get timeRange(): string {
        const start = TimeUtility.getTimeString(new Date(this.current.startTime), false);
        const end = this.endTime.getTime() >= Date.now() ? 'NOW' : TimeUtility.getTimeString(this.endTime, false);

        return `${start} - ${end}`;
    }

    get timePeriods(): Range<number>[] {
        return [{
            start: new Date(this.current.startTime).getTime(),
            end: Math.min(this.endTime.getTime(), Date.now())
        }];
    }

    get endTime(): Date {
        if (this.next) {
            return new Date(this.next.startTime);
        }

        const start = new Date(this.current.startTime);

        return new Date(start.setHours(23, 59, 59, 999));
    }

    get duration(): string {
        let end: number;
        const start = new Date(this.current.startTime).getTime();

        if (this.next) {
            end = new Date(this.next.startTime).getTime();
        }
        else {
            end = Math.min(Date.now(), new Date(this.current.startTime).setHours(23, 59, 59, 999));
        }

        const duration = end - start;
        const oneMinute = TimeUtility.convertTime(1, 'minute', 'millisecond');

        return duration < oneMinute ? '< 1m' : TimeUtility.getDurationString(duration, 'short');
    }

    public mounted(): void {
        document.addEventListener('click', this.checkClickOutside);
    }

    public beforeUnmount(): void {
        document.removeEventListener('click', this.checkClickOutside);
    }

    public onUpdate(updated: EventTimelineEditorOption): void {
        this.$emit('update', updated);
        this.isExpanded = false;
    }

    private checkClickOutside(event: Event): void {
        if (DomUtility.isClickOutside(event, this.$refs.container as HTMLElement)) {
            this.isExpanded = false;
        }
    }
}
</script>

<style lang="scss" scoped>
.event-timeline-summary-card-container {
    @import '../../../../styles/presets.scss';
    @import '../../../../styles/animations.scss';

    @include flex-column(center);

    .summary {
        @include flex-row(center, center);
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        padding: 1.5vh 2.5vh;
        border-radius: 5vh;
        box-shadow: 0 0 4px 2px rgba(0, 0, 0, 0.25);
        background-color: var(--primary-colors-9-00);
        font-size: var(--font-sizes-400);
        transition: background-color 0.2s;

        &:hover, &.active {
            cursor: pointer;
            background-color: var(--primary-colors-6-00);
        }

        .type {
            @include flex-row(center);
            margin-right: 1.5%;
            width: 3.5%;
            font-size: var(--font-sizes-700);
        }

        .name {
            width: 37.5%;
            @include line-overflow();
        }

        .range {
            width: 15%;
            text-align: center;
        }

        .breakdown {
            margin-left: 5%;
            margin-right: 7.5%;
            width: 20%;
            height: 0.75vh;
        }

        .duration {
            @include flex-row(center, center);
            padding: 0.35vh 0;
            width: 10%;
            border-radius: 5vh;
            box-shadow: 0 0 4px 1px var(--context-colors-info-4-03);
            background-color: var(--context-colors-info-4-00);
            color: var(--font-colors-1-00);
            font-size: var(--font-sizes-300);
        }
    }

    .editor {
        margin-top: 1vh;
        width: 97.5%;
        @include animate-property(height, 0, 20vh, 0.2s);
    }
}
</style>
