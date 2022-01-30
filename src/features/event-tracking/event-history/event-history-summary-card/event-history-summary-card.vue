<template>
    <div class="event-history-card-summary-container">
        <div :style="{ color }">{{ start }} ~ {{ end }}</div>
        <span>{{ name }}</span>
    </div>
</template>

<script lang="ts">
import { Vue, prop } from 'vue-class-component';

import { EventHistorySummary } from '../../../../core/models/event/event-history-summary';
import { EventType } from '../../../../core/enums/event-type.enum';
import { TimeUtility } from '../../../../core/utilities/time-utility/time-utility';

class EventHistorySummaryCardProp {
    public current = prop<EventHistorySummary>({ default: new EventHistorySummary() });
    public next = prop<EventHistorySummary | null>({ default: null });
}

export default class EventHistorySummaryCard extends Vue.with(EventHistorySummaryCardProp) {
    get color(): string {
        const { eventType } = this.current;
        const type = eventType === EventType.Idling || eventType === EventType.Break ? 'not-working' : 'working';

        return `var(--event-type-colors-${type}-0-00)`;
    }

    get start(): string {
        return TimeUtility.getTimeString(new Date(this.current.timestamp));
    }

    get end(): string {
        if (this.next) {
            return TimeUtility.getTimeString(new Date(this.next.timestamp));
        }

        const start = new Date(this.current.timestamp);

        return TimeUtility.getTimeString(new Date(start.setHours(23, 59, 59, 999)));
    }

    get name(): string {
        const { name, eventType, isDeleted } = this.current;

        if (eventType === EventType.Idling || eventType === EventType.Break) {
            return eventType === EventType.Idling ? 'Idling' : 'Break';
        }

        return name ? `${name} ${isDeleted ? '(DELETED)' : ''}` : '';
    }
}
</script>

<style lang="scss" scoped>
.event-history-card-summary-container {
    @import '../../../../styles/presets.scss';
    @import '../../../../styles/animations.scss';

    @include flex-row(center);
    @include animate-opacity(0, 1, 0.3s, 0.6s);

    & > div {
        @include flex-row(center, center);
        box-sizing: border-box;
        padding: 0.75vh 1.75vh;
        margin-right: 2vh;
        min-width: 15rem;
        border-radius: 5px;
        box-shadow: 0 0 6px 1px rgba(0, 0, 0, 0.35);
        background-color: var(--primary-colors-9-00);
    }
}
</style>
