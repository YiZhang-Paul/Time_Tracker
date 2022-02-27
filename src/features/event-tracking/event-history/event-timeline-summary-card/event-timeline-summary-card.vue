<template>
    <div class="event-timeline-summary-card-container">
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
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';

import { EventTimelineDto } from '../../../../core/dtos/event-timeline-dto';
import { IconConfig } from '../../../../core/models/generic/icon-config';
import { TimePeriod } from '../../../../core/models/generic/time-period';
import { EventType } from '../../../../core/enums/event-type.enum';
import { IconUtility } from '../../../../core/utilities/icon-utility/icon-utility';
import { TimeUtility } from '../../../../core/utilities/time-utility/time-utility';
import ActivityIndicator from '../../../../shared/indicators/activity-indicator/activity-indicator.vue';

class EventTimelineSummaryCardProp {
    public current = prop<EventTimelineDto>({ default: new EventTimelineDto() });
    public next = prop<EventTimelineDto | null>({ default: null });
}

@Options({
    components: {
        ActivityIndicator
    }
})
export default class EventTimelineSummaryCard extends Vue.with(EventTimelineSummaryCardProp) {
    private readonly icons = {
        [EventType.Idling]: IconUtility.getIdlingTypeIcon(),
        [EventType.Break]: IconUtility.getBreakTypeIcon(),
        [EventType.Interruption]: IconUtility.getInterruptionTypeIcon(),
        [EventType.Task]: IconUtility.getTaskTypeIcon()
    };

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

    get timePeriods(): TimePeriod[] {
        return [{ start: this.current.startTime, end: this.endTime.toISOString() }];
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

        return duration < 60 * 1000 ? '< 1m' : TimeUtility.getDurationString(duration, 'short');
    }
}
</script>

<style lang="scss" scoped>
.event-timeline-summary-card-container {
    @import '../../../../styles/presets.scss';

    @include flex-row(center, center);
    box-sizing: border-box;
    padding: 1.5vh 2.5vh;
    border-radius: 5vh;
    box-shadow: 0 0 6px 1px rgba(0, 0, 0, 0.35);
    background-color: var(--primary-colors-9-00);
    font-size: var(--font-sizes-400);

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
</style>
