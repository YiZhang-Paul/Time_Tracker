<template>
    <div class="event-history-container">
        <div v-for="summary in summaries" :key="summary.id">
            <span>{{ summary.eventType }}, {{ summary.timestamp }}, {{ summary.name }}, {{ summary.isDeleted }}</span>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { mapStores } from 'pinia';

import { useEventStore } from '../../stores/event/event.store';
import { EventHistorySummary } from '../../core/models/event/event-history-summary';

@Options({
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
        this.summaries = await this.eventStore.getEventHistorySummariesByDay(year, month + 1, date - 1);
    }
}
</script>

<style lang="scss" scoped>
.event-history-container {
    @import '../../styles/presets.scss';

    @include flex-column(center, center);
    color: var(--font-colors-3-00);
    font-size: var(--font-sizes-500);
}
</style>
