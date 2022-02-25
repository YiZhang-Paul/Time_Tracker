<template>
    <div class="event-timeline-summary-card-container">
        <div class="icon">
            <progress-question v-if="current.eventType === eventType.Idling" class="untracked" />
            <food v-if="current.eventType === eventType.Break" class="break" />
            <flash-alert v-if="current.eventType === eventType.Interruption" class="interruption" />
            <target v-if="current.eventType === eventType.Task" class="task" />
        </div>

        <span class="name">{{ name }}</span>
        <div class="range">{{ start }} - {{ end }}</div>
        <div class="breakdown"></div>
        <div class="duration">{{ duration }}</div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { FlashAlert, Food, ProgressQuestion, Target } from 'mdue';

import { EventTimelineDto } from '../../../../core/dtos/event-timeline-dto';
import { EventType } from '../../../../core/enums/event-type.enum';
import { TimeUtility } from '../../../../core/utilities/time-utility/time-utility';

class EventTimelineSummaryCardProp {
    public current = prop<EventTimelineDto>({ default: new EventTimelineDto() });
    public next = prop<EventTimelineDto | null>({ default: null });
}

@Options({
    components: {
        FlashAlert,
        Food,
        ProgressQuestion,
        Target
    }
})
export default class EventTimelineSummaryCard extends Vue.with(EventTimelineSummaryCardProp) {
    public readonly eventType = EventType;

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

    .icon {
        @include flex-row(center);
        margin-right: 1.5%;
        width: 3.5%;
        font-size: var(--font-sizes-700);

        .untracked {
            color: var(--item-type-colors-idling-0-00);
        }

        .break {
            color: var(--item-type-colors-break-0-00);
        }

        .interruption {
            color: var(--item-type-colors-interruption-0-00);
        }

        .task {
            color: var(--item-type-colors-task-0-00);
        }
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
        width: 32.5%;
        height: 1px;
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
