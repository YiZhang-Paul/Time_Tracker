<template>
    <div class="event-duration-summary-card-container">
        <span class="name">{{ summary.name }}</span>
        <div class="duration">{{ duration }}</div>
        <div class="breakdown"></div>

        <div class="status" :class="{ resolved: summary.isResolved }">
            {{ summary.isResolved ? 'Done' : 'Not Done' }}
        </div>
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

    @include flex-row(center, center);
    box-sizing: border-box;
    padding: 1.5vh 2.5vh;
    border-radius: 5vh;
    box-shadow: 0 0 6px 1px rgba(0, 0, 0, 0.35);
    background-color: var(--primary-colors-9-00);
    font-size: var(--font-sizes-400);

    .name {
        width: 37.5%;
        @include line-overflow();
    }

    .duration {
        width: 15%;
        text-align: center;
    }

    .breakdown {
        width: 32.5%;
        height: 1px;
    }

    .status {
        @include flex-row(center, center);
        padding: 0.35vh 0;
        width: 10%;
        border-radius: 5vh;
        box-shadow: 0 0 4px 1px var(--context-colors-suggestion-1-03);
        background-color: var(--context-colors-suggestion-0-00);
        color: var(--font-colors-7-00);
        font-size: var(--font-sizes-300);

        &.resolved {
            box-shadow: 0 0 4px 1px var(--context-colors-success-1-03);
            background-color: var(--context-colors-success-0-00);
        }
    }
}
</style>
