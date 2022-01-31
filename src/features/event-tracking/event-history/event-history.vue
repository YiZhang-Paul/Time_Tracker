<template>
    <div class="event-history-container">
        <div class="date">
            <span>History of</span>
            <date-selector v-model="day" @update:modelValue="onDaySelect()"></date-selector>
        </div>

        <div class="content">
            <div class="time-breakdown">
                <div class="working-time-breakdown">
                    <sword-cross class="icon" />

                    <template v-if="summaries.length">
                        <span>Spent on working: {{ workingTime }}</span>
                        <span>Interruptions: {{ interruptionTime }}</span>
                        <span>Tasks: {{ taskTime }}</span>
                    </template>

                    <span v-if="!summaries.length">time information not available.</span>
                </div>

                <div class="not-working-time-breakdown">
                    <shield-cross class="icon" />

                    <template v-if="summaries.length">
                        <span>Not spent on working: {{ notWorkingTime }}</span>
                        <span>Idling: {{ idlingTime }}</span>
                        <span>Breaks: {{ breakTime }}</span>
                    </template>

                    <span v-if="!summaries.length">time information not available.</span>
                </div>
            </div>

            <div v-if="!summaries.length" class="timeline-placeholder">no data available.</div>

            <overlay-scrollbar-panel v-if="summaries.length" class="event-timeline">
                <event-history-summary-card v-for="(summary, index) in summaries"
                    class="event-history-summary-card"
                    :current="summary"
                    :next="index === summaries.length - 1 ? null : summaries[index + 1]"
                    :key="index">
                </event-history-summary-card>
            </overlay-scrollbar-panel>

            <div class="event-breakdown">
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { mapStores } from 'pinia';
import { ShieldCross, SwordCross } from 'mdue';

import { useEventStore } from '../../../stores/event/event.store';
import { EventTimeBreakdownDto } from '../../../core/dtos/event-time-breakdown-dto';
import { EventHistorySummary } from '../../../core/models/event/event-history-summary';
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
    public breakdown = new EventTimeBreakdownDto();
    public summaries: EventHistorySummary[] = [];
    public eventStore!: ReturnType<typeof useEventStore>;

    get date(): string {
        return TimeUtility.getDateString(this.day);
    }

    get workingTime(): string {
        return TimeUtility.getDurationString(this.breakdown.interruption + this.breakdown.task, false);
    }

    get notWorkingTime(): string {
        return TimeUtility.getDurationString(this.breakdown.idling + this.breakdown.break, false);
    }

    get interruptionTime(): string {
        return TimeUtility.getDurationString(this.breakdown.interruption, false);
    }

    get taskTime(): string {
        return TimeUtility.getDurationString(this.breakdown.task, false);
    }

    get idlingTime(): string {
        return TimeUtility.getDurationString(this.breakdown.idling, false);
    }

    get breakTime(): string {
        return TimeUtility.getDurationString(this.breakdown.break, false);
    }

    public created(): void {
        this.eventStore.loadOngoingEventSummary();
        this.onDaySelect();
    }

    public async onDaySelect(): Promise<void> {
        const [year, month, date] = [this.day.getFullYear(), this.day.getMonth() + 1, this.day.getDate()];
        this.breakdown = await this.eventStore.getTimeBreakdownByDay(year, month, date);
        this.summaries = await this.eventStore.getEventHistorySummariesByDay(year, month, date);
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

        .time-breakdown, .event-breakdown {
            width: 30%;
            height: 80%;
        }

        .time-breakdown {
            @include flex-column(center, center);

            .working-time-breakdown, .not-working-time-breakdown {
                @include flex-column(center, center);

                & > span {
                    @include animate-opacity(0, 1, 0.4s);
                }
            }

            .working-time-breakdown {
                margin-bottom: 5vh;
                @include animate-opacity(0, 1, 0.4s, 0.5s);
            }

            .not-working-time-breakdown {
                @include animate-opacity(0, 1, 0.4s, 0.7s);
            }

            .icon {
                margin-bottom: 1.5vh;
                font-size: var(--font-sizes-1000);
            }
        }

        .timeline-placeholder, .event-timeline {
            @include flex-column(center, center);
            margin-top: 5vh;
        }

        .timeline-placeholder {
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
