<template>
    <div class="event-timeline-summary-card-container">
        <span class="name">{{ name }}</span>
        <div class="range">{{ start }} - {{ end }}</div>
        <div class="breakdown"></div>
        <div class="duration">{{ duration }}</div>
    </div>
</template>

<script lang="ts">
import { Vue, prop } from 'vue-class-component';

import { EventTimelineDto } from '../../../../core/dtos/event-timeline-dto';
import { EventType } from '../../../../core/enums/event-type.enum';
import { TimeUtility } from '../../../../core/utilities/time-utility/time-utility';

class EventTimelineSummaryCardProp {
    public current = prop<EventTimelineDto>({ default: new EventTimelineDto() });
    public next = prop<EventTimelineDto | null>({ default: null });
}

export default class EventTimelineSummaryCard extends Vue.with(EventTimelineSummaryCardProp) {
    get name(): string {
        const { name, eventType } = this.current;

        if (eventType !== EventType.Idling && eventType !== EventType.Break) {
            return name;
        }

        return eventType === EventType.Idling ? 'Untracked' : 'Break';
    }

    get start(): string {
        return TimeUtility.getTimeString(new Date(this.current.startTime), false);
    }

    get end(): string {
        if (this.next) {
            return TimeUtility.getTimeString(new Date(this.next.startTime), false);
        }

        const end = new Date(this.current.startTime).setHours(23, 59, 59, 999);

        return end >= Date.now() ? 'NOW' : TimeUtility.getTimeString(new Date(end), false);
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

        return TimeUtility.getDurationString(end - start, false);
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

    .name {
        width: 32.5%;
        @include line-overflow();
        background-color: lightblue;
    }

    .range {
        width: 15%;
        text-align: center;
        background-color: red;
    }

    .breakdown {
        width: 30%;
        height: 1px;
        background-color: lightblue;
    }

    .duration {
        @include flex-row(center, center);
        padding: 0.35vh 0;
        width: 10%;
        border-radius: 5vh;
        box-shadow: 0 0 4px 1px var(--primary-colors-1-03);
        background-color: var(--primary-colors-1-00);
        color: var(--font-colors-7-00);
        font-size: var(--font-sizes-300);
        font-weight: 600;
    }
}
</style>
