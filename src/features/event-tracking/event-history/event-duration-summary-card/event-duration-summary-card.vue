<template>
    <div class="event-duration-summary-card-container">
        <div class="rank">
            <trophy v-if="rank <= 3" :class="['icon', `rank-${rank}`]" />

            <div v-if="rank > 3" class="value">
                <span>{{ rank }}</span>
            </div>
        </div>

        <span class="name">{{ summary.name }}</span>
        <div class="duration">{{ duration }}</div>

        <activity-indicator class="breakdown"
            :periods="timePeriods"
            :color="timePeriodsColor">
        </activity-indicator>

        <div class="status" :class="{ resolved: summary.isResolved, deleted: summary.isDeleted }">
            <span v-if="summary.isDeleted">Deleted</span>
            <span v-if="!summary.isDeleted">{{ summary.isResolved ? 'Done' : 'Not Done' }}</span>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { Trophy } from 'mdue';

import { EventDurationDto } from '../../../../core/dtos/event-duration-dto';
import { Range } from '../../../../core/models/generic/range';
import { EventType } from '../../../../core/enums/event-type.enum';
import { IconUtility } from '../../../../core/utilities/icon-utility/icon-utility';
import { TimeUtility } from '../../../../core/utilities/time-utility/time-utility';
import ActivityIndicator from '../../../../shared/indicators/activity-indicator/activity-indicator.vue';

class EventDurationSummaryCardProp {
    public summary = prop<EventDurationDto>({ default: new EventDurationDto() });
    public rank = prop<number>({ default: 1 });
}

@Options({
    components: {
        Trophy,
        ActivityIndicator
    }
})
export default class EventDurationSummaryCard extends Vue.with(EventDurationSummaryCardProp) {
    private readonly icons = {
        [EventType.Idling]: IconUtility.getIdlingTypeIcon(),
        [EventType.Break]: IconUtility.getBreakTypeIcon(),
        [EventType.Interruption]: IconUtility.getInterruptionTypeIcon(),
        [EventType.Task]: IconUtility.getTaskTypeIcon()
    };

    get timePeriods(): Range<number>[] {
        return this.summary.periods.map(({ start, end }) => {
            const [startTime, endTime] = [new Date(start), new Date(end)];

            return new Range(startTime.getTime(), endTime.getTime());
        });
    }

    get timePeriodsColor(): string {
        return this.icons[this.summary.eventType].color;
    }

    get duration(): string {
        if (this.summary.duration < 60 * 1000) {
            return '< 1 min';
        }

        return TimeUtility.getDurationString(this.summary.duration, 'standard');
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

    .rank {
        @include flex-row(center);
        margin-right: 1.5%;
        width: 3.5%;

        .icon {
            font-size: var(--font-sizes-700);

            &.rank-1 {
                color: var(--rank-colors-first-place-0-00);
            }

            &.rank-2 {
                color: var(--rank-colors-second-place-0-00);
            }

            &.rank-3 {
                color: var(--rank-colors-third-place-0-00);
            }
        }

        .value {
            @include flex-row(center, center);
            width: 1.75rem;
            height: 1.75rem;
            border-radius: 50%;
            background-color: var(--context-colors-info-5-00);
            font-size: var(--font-sizes-300);
        }
    }

    .name {
        width: 37.5%;
        @include line-overflow();
    }

    .duration {
        width: 15%;
        text-align: center;
    }

    .breakdown {
        margin-left: 5%;
        margin-right: 7.5%;
        width: 20%;
        height: 0.75vh;
    }

    .status {
        @include flex-row(center, center);
        padding: 0.35vh 0;
        width: 10%;
        border-radius: 5vh;
        box-shadow: 0 0 4px 1px var(--context-colors-suggestion-1-03);
        background-color: var(--context-colors-suggestion-0-00);
        color: var(--font-colors-8-00);
        font-size: var(--font-sizes-300);

        &.resolved {
            box-shadow: 0 0 4px 1px var(--context-colors-success-1-03);
            background-color: var(--context-colors-success-0-00);
        }

        &.deleted {
            box-shadow: 0 0 4px 1px var(--context-colors-disabled-1-03);
            background-color: var(--context-colors-disabled-0-00);
        }
    }
}
</style>
