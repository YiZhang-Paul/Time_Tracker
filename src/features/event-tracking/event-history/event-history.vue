<template>
    <div class="event-history-container">
        <div class="date">
            <span>History of</span>
            <date-selector v-model="day" @update:modelValue="onDaySelect()"></date-selector>
        </div>

        <div class="content">
            <div class="working-time-breakdown">
                <sword-cross class="icon" />

                <template v-if="summaries.timeline.length">
                    <span>Working: {{ workingTime }}</span>
                    <span>Interruptions: {{ interruptionTime }}</span>
                    <span>Tasks: {{ taskTime }}</span>
                </template>

                <span v-if="!summaries.timeline.length">time information not available.</span>
            </div>

            <div v-if="!summaries.timeline.length" class="event-timeline-placeholder">no data available.</div>

            <overlay-scrollbar-panel v-if="summaries.timeline.length" class="event-timeline">
                <event-history-summary-card v-for="(timeline, index) in summaries.timeline"
                    class="event-history-summary-card"
                    :current="timeline"
                    :next="index === summaries.timeline.length - 1 ? null : summaries.timeline[index + 1]"
                    :key="index">
                </event-history-summary-card>
            </overlay-scrollbar-panel>

            <div class="not-working-time-breakdown">
                <shield-cross class="icon" />

                <template v-if="summaries.timeline.length">
                    <span>Not Working: {{ notWorkingTime }}</span>
                    <span>Idling: {{ idlingTime }}</span>
                    <span>Breaks: {{ breakTime }}</span>
                </template>

                <span v-if="!summaries.timeline.length">time information not available.</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { mapStores } from 'pinia';
import { ShieldCross, SwordCross } from 'mdue';

import { useEventStore } from '../../../stores/event/event.store';
import { EventDurationDto } from '../../../core/dtos/event-duration-dto';
import { EventSummariesDto } from '../../../core/dtos/event-summaries-dto';
import { TimeUtility } from '../../../core/utilities/time-utility/time-utility';
import DateSelector from '../../../shared/inputs/date-selector/date-selector.vue';
import OverlayScrollbarPanel from '../../../shared/panels/overlay-scrollbar-panel/overlay-scrollbar-panel.vue';

import EventHistorySummaryCard from './event-history-summary-card/event-history-summary-card.vue';

@Options({
    components: {
        ShieldCross,
        SwordCross,
        EventHistorySummaryCard,
        DateSelector,
        OverlayScrollbarPanel
    },
    computed: {
        ...mapStores(useEventStore)
    }
})
export default class EventHistory extends Vue {
    public day = new Date();
    public summaries = new EventSummariesDto();
    public eventStore!: ReturnType<typeof useEventStore>;

    get date(): string {
        return TimeUtility.getDateString(this.day);
    }

    get workingTime(): string {
        return this.getDuration([...this.summaries.interruption, ...this.summaries.task]);
    }

    get notWorkingTime(): string {
        return this.getDuration([...this.summaries.idling, ...this.summaries.break]);
    }

    get interruptionTime(): string {
        return this.getDuration(this.summaries.interruption);
    }

    get taskTime(): string {
        return this.getDuration(this.summaries.task);
    }

    get idlingTime(): string {
        return this.getDuration(this.summaries.idling);
    }

    get breakTime(): string {
        return this.getDuration(this.summaries.break);
    }

    public created(): void {
        this.eventStore.loadOngoingEventSummary();
        this.onDaySelect();
    }

    public async onDaySelect(): Promise<void> {
        const [year, month, date] = [this.day.getFullYear(), this.day.getMonth() + 1, this.day.getDate()];
        this.summaries = await this.eventStore.getEventSummariesByDay(year, month, date);
    }

    private getDuration(events: EventDurationDto[]): string {
        const duration = events.map(_ => _.duration).reduce((total, _) => total + _, 0);

        return TimeUtility.getDurationString(duration, false);
    }
}
</script>

<style lang="scss" scoped>
.event-history-container {
    @import '../../../styles/presets.scss';
    @import '../../../styles/animations.scss';

    $timeline-width: 40%;
    $timeline-height: 75%;

    @include flex-column(center);
    color: var(--font-colors-3-00);
    font-size: var(--font-sizes-500);
    @include animate-opacity(0, 1, 0.3s, 0.5s);

    .date {
        @include flex-row(center, center);
        width: 100%;
        height: 7.5%;
        color: var(--font-colors-1-00);

        & > span {
            margin-right: 1.5vh;
            font-size: var(--font-sizes-700);
        }
    }

    .content {
        @include flex-row(flex-start, space-between);
        width: 100%;
        height: 92.5%;

        .working-time-breakdown, .not-working-time-breakdown {
            @include flex-column(center, center);
            width: 30%;
            height: 80%;

            & > span {
                @include animate-opacity(0, 1, 0.4s);
            }

            .icon {
                margin-bottom: 1.5vh;
                font-size: var(--font-sizes-1000);
            }
        }

        .working-time-breakdown {
            margin-bottom: 5vh;
            @include animate-opacity(0, 1, 0.4s, 0.5s);
        }

        .not-working-time-breakdown {
            @include animate-opacity(0, 1, 0.4s, 0.7s);
        }

        .event-timeline-placeholder, .event-timeline {
            @include flex-column(center, center);
            margin-top: 5vh;
        }

        .event-timeline-placeholder {
            width: $timeline-width;
            height: $timeline-height;
        }

        .event-timeline {
            padding: 0 3.5vh;
            max-width: $timeline-width;
            max-height: $timeline-height;

            .event-history-summary-card {
                margin: 1vh 0;
                scroll-snap-align: start;
            }
        }
    }
}
</style>
