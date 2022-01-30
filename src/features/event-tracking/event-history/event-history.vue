<template>
    <div class="event-history-container">
        <span class="date">History of {{ date }}</span>

        <overlay-scrollbar-panel class="event-timeline">
            <event-history-summary-card v-for="(summary, index) in summaries"
                class="event-history-summary-card"
                :current="summary"
                :next="index === summaries.length - 1 ? null : summaries[index + 1]"
                :key="index">
            </event-history-summary-card>
        </overlay-scrollbar-panel>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { mapStores } from 'pinia';

import { useEventStore } from '../../../stores/event/event.store';
import { EventHistorySummary } from '../../../core/models/event/event-history-summary';
import { TimeUtility } from '../../../core/utilities/time-utility/time-utility';
import OverlayScrollbarPanel from '../../../shared/panels/overlay-scrollbar-panel/overlay-scrollbar-panel.vue';

import EventHistorySummaryCard from './event-history-summary-card/event-history-summary-card.vue';

@Options({
    components: {
        EventHistorySummaryCard,
        OverlayScrollbarPanel
    },
    computed: {
        ...mapStores(useEventStore)
    }
})
export default class EventHistory extends Vue {
    public day = new Date();
    public summaries: EventHistorySummary[] = [];
    public eventStore!: ReturnType<typeof useEventStore>;

    get date(): string {
        return TimeUtility.getDateString(this.day);
    }

    public created(): void {
        this.initialize();
    }

    public async initialize(): Promise<void> {
        this.eventStore.loadOngoingEventSummary();
        const [year, month, date] = [this.day.getFullYear(), this.day.getMonth(), this.day.getDate()];
        this.summaries = await this.eventStore.getEventHistorySummariesByDay(year, month + 1, date - 2);
    }
}
</script>

<style lang="scss" scoped>
.event-history-container {
    @import '../../../styles/presets.scss';

    @include flex-column(center);
    color: var(--font-colors-3-00);
    font-size: var(--font-sizes-500);

    .date {
        margin: 2.5vh 0 5vh 0;
        color: var(--font-colors-1-00);
        font-size: var(--font-sizes-700);
    }

    .event-timeline {
        @include flex-column();
        padding: 0 3.5vh;
        max-width: 45vw;
        max-height: 70%;

        .event-history-summary-card {
            margin: 1vh 0;
            scroll-snap-align: start;
        }
    }
}
</style>
