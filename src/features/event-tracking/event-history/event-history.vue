<template>
    <div class="event-history-container">
        <div class="event-timeline">
            <event-history-summary-card v-for="(summary, index) in summaries"
                class="event-history-summary-card"
                :current="summary"
                :next="index === summaries.length - 1 ? null : summaries[index + 1]"
                :key="index">
            </event-history-summary-card>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { mapStores } from 'pinia';

import { useEventStore } from '../../../stores/event/event.store';
import { EventHistorySummary } from '../../../core/models/event/event-history-summary';

import EventHistorySummaryCard from './event-history-summary-card/event-history-summary-card.vue';

@Options({
    components: {
        EventHistorySummaryCard
    },
    computed: {
        ...mapStores(useEventStore)
    }
})
export default class EventHistory extends Vue {
    public summaries: EventHistorySummary[] = [];
    public eventStore!: ReturnType<typeof useEventStore>;

    public async created(): Promise<void> {
        const now = new Date();
        const [year, month, date] = [now.getFullYear(), now.getMonth(), now.getDate()];
        this.summaries = await this.eventStore.getEventHistorySummariesByDay(year, month + 1, date - 2);
    }
}
</script>

<style lang="scss" scoped>
.event-history-container {
    @import '../../../styles/presets.scss';

    @include flex-column(center, center);
    color: var(--font-colors-3-00);
    font-size: var(--font-sizes-500);

    .event-timeline {
        max-width: 40vw;
        border: 1px solid red;

        .event-history-summary-card {
            border: 1px solid lightblue;
        }
    }
}
</style>
