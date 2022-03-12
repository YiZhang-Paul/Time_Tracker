<template>
    <div class="not-working-time-summary-container">
        <div class="summaries">
            <event-type-summary-card :title="'Time didn\'t work'"
                :duration="totalDuration"
                :icon="notWorkingTypeIcon">
            </event-type-summary-card>

            <completion-indicator class="completion-indicator"
                :description="quotaTitle"
                :percentage="quotaMilliseconds ? totalDuration / quotaMilliseconds : 0"
                :isHigherPreferred="false">
            </completion-indicator>
        </div>

        <div class="summaries">
            <event-type-summary-card :title="'Untracked'"
                :duration="idlingDuration"
                :icon="idlingIcon">
            </event-type-summary-card>

            <completion-indicator class="completion-indicator"
                :description="'Percentage - lower is better'"
                :percentage="totalDuration ? idlingDuration / totalDuration : 0"
                :isHigherPreferred="false">
            </completion-indicator>
        </div>

        <div class="summaries">
            <event-type-summary-card :title="'Sleeps & Breaks'"
                :duration="breakDuration"
                :icon="breakIcon">
            </event-type-summary-card>

            <completion-indicator class="completion-indicator"
                :description="breakCompletionTitle"
                :percentage="breakCompletion">
            </completion-indicator>

            <completion-indicator class="completion-indicator"
                :description="'Percentage - higher is better'"
                :percentage="totalDuration ? breakDuration / totalDuration : 0">
            </completion-indicator>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';

import { EventSummariesDto } from '../../../../core/dtos/event-summaries-dto';
import { EventType } from '../../../../core/enums/event-type.enum';
import { IconUtility } from '../../../../core/utilities/icon-utility/icon-utility';
import { TimeUtility } from '../../../../core/utilities/time-utility/time-utility';
import CompletionIndicator from '../../../../shared/indicators/completion-indicator/completion-indicator.vue';
import EventTypeSummaryCard from '../event-type-summary-card/event-type-summary-card.vue';

class NotWorkingTimeSummaryProp {
    public summaries = prop<EventSummariesDto>({ default: new EventSummariesDto() });
}

@Options({
    components: {
        CompletionIndicator,
        EventTypeSummaryCard
    }
})
export default class NotWorkingTimeSummary extends Vue.with(NotWorkingTimeSummaryProp) {
    public readonly quotaHours = 16;
    public readonly quotaMilliseconds = TimeUtility.convertTime(this.quotaHours, 'hour', 'millisecond');
    public readonly idlingIcon = IconUtility.getIdlingTypeIcon();
    public readonly breakIcon = IconUtility.getBreakTypeIcon();
    public readonly notWorkingTypeIcon = IconUtility.getNotWorkingTypeIcon();

    get totalDuration(): number {
        return this.getDuration([EventType.Idling, EventType.Break]);
    }

    get quotaTitle(): string {
        const completed = TimeUtility.convertTime(this.totalDuration, 'millisecond', 'hour');

        return `Daily quota - ${completed} out of ${this.quotaHours} hrs`;
    }

    get idlingDuration(): number {
        return this.getDuration([EventType.Idling]);
    }

    get breakDuration(): number {
        return this.getDuration([EventType.Break]);
    }

    get breakCompletionTitle(): string {
        const completed = TimeUtility.convertTime(this.breakDuration, 'millisecond', 'hour');

        return `Daily target - ${completed} out of ${this.breakTarget} hrs`;
    }

    get breakCompletion(): number {
        return TimeUtility.convertTime(this.breakDuration, 'millisecond', 'hour') / this.breakTarget;
    }

    get breakTarget(): number {
        const workingDuration = this.getDuration([EventType.Interruption, EventType.Task]);

        return TimeUtility.convertTime(workingDuration / 5, 'millisecond', 'hour') + 8;
    }

    private getDuration(types: EventType[]): number {
        const events = this.summaries.duration.filter(_ => types.includes(_.eventType));

        return events.map(_ => _.duration).reduce((total, _) => total + _, 0);
    }
}
</script>

<style lang="scss" scoped>
.not-working-time-summary-container {
    @import '../../../../styles/presets.scss';

    @include flex-column(flex-start, space-between);

    .summaries {
        width: 100%;
        height: 33%;

        &:first-of-type {
            height: 25%;
        }

        .completion-indicator {
            margin-top: 1.25vh;
            width: 82.5%;
        }
    }
}
</style>
