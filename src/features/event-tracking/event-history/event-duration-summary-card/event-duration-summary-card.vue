<template>
    <div class="event-duration-summary-card-container">
        <div :style="{ color }">{{ duration }}</div>
        <span class="name">{{ summary.name }}</span>
        <span v-if="summary.isDeleted" class="deleted-label">(DELETED)</span>
    </div>
</template>

<script lang="ts">
import { Vue, prop } from 'vue-class-component';

import { EventDurationDto } from '../../../../core/dtos/event-duration-dto';
import { EventType } from '../../../../core/enums/event-type.enum';
import { TimeUtility } from '../../../../core/utilities/time-utility/time-utility';

class EventDurationSummaryCardProp {
    public summary = prop<EventDurationDto>({ default: new EventDurationDto() });
}

export default class EventDurationSummaryCard extends Vue.with(EventDurationSummaryCardProp) {
    get color(): string {
        const type = this.summary.eventType === EventType.Interruption ? 'interruption' : 'task';

        return `var(--item-type-colors-${type}-0-00)`;
    }

    get duration(): string {
        if (this.summary.duration < 60 * 1000) {
            return '< 1m';
        }

        return TimeUtility.getDurationString(this.summary.duration, false);
    }
}
</script>

<style lang="scss" scoped>
.event-duration-summary-card-container {
    @import '../../../../styles/presets.scss';

    @include flex-row(center);

    & > div {
        @include flex-row(center, center);
        box-sizing: border-box;
        padding: 0.75vh 1.75vh;
        margin-right: 2vh;
        min-width: 10rem;
        border-radius: 5px;
        background-color: var(--primary-colors-9-00);
        box-shadow: 0 0 6px 1px rgba(0, 0, 0, 0.35);
    }

    .name {
        @include line-overflow();
    }

    .deleted-label {
        margin-top: 0.25rem;
        margin-left: 0.5vh;
        color: var(--context-colors-suggestion-0-00);
        font-size: var(--font-sizes-100);
    }
}
</style>
