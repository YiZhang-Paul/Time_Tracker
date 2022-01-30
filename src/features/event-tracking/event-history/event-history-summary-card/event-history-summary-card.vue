<template>
    <div class="event-history-card-summary-container">
        <span>{{ new Date(current.timestamp).toLocaleTimeString() }} ~ </span>
        <span v-if="next">{{ new Date(next.timestamp).toLocaleTimeString() }}</span>
        <span v-if="!next">{{ new Date(new Date(current.timestamp).setHours(23, 59, 59, 999)).toLocaleTimeString() }}</span>
        <span>: {{ current.eventType }}</span>
        <span v-if="current.name">{{ current.name }} <span v-if="current.isDeleted">(REMOVED)</span></span>
    </div>
</template>

<script lang="ts">
import { Vue, prop } from 'vue-class-component';

import { EventHistorySummary } from '../../../../core/models/event/event-history-summary';

class EventHistorySummaryCardProp {
    public current = prop<EventHistorySummary>({ default: new EventHistorySummary() });
    public next = prop<EventHistorySummary | null>({ default: null });
}

export default class EventHistorySummaryCard extends Vue.with(EventHistorySummaryCardProp) { }
</script>

<style lang="scss" scoped>
.event-history-card-summary-container {
    @import '../../../../styles/presets.scss';

    @include flex-row(center);
}
</style>
