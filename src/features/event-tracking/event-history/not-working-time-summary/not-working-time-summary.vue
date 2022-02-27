<template>
    <div class="not-working-time-summary-container">
        <div class="summaries">
            <event-time-summary-card :title="'Time didn\'t work'"
                :duration="totalDuration"
                :icon="notWorkingTypeIcon">
            </event-time-summary-card>

            <completion-indicator class="completion-indicator"
                :description="quotaTitle"
                :percentage="totalDuration / quotaMilliseconds"
                :isHigherPreferred="false">
            </completion-indicator>
        </div>

        <div class="summaries">
            <event-time-summary-card :title="'Untracked'"
                :duration="idlingDuration"
                :icon="idlingIcon">
            </event-time-summary-card>

            <completion-indicator class="completion-indicator"
                :description="'Percentage - lower is better'"
                :percentage="idlingDuration / totalDuration"
                :isHigherPreferred="false">
            </completion-indicator>
        </div>

        <div class="summaries">
            <event-time-summary-card :title="'Sleeps & Breaks'"
                :duration="breakDuration"
                :icon="breakIcon">
            </event-time-summary-card>

            <completion-indicator class="completion-indicator"
                :description="breakTargetTitle"
                :percentage="breakTarget">
            </completion-indicator>

            <completion-indicator class="completion-indicator"
                :description="'Percentage - higher is better'"
                :percentage="breakDuration / totalDuration">
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
import EventTimeSummaryCard from '../event-time-summary-card/event-time-summary-card.vue';

class NotWorkingTimeSummaryProp {
    public summaries = prop<EventSummariesDto>({ default: new EventSummariesDto() });
}

@Options({
    components: {
        CompletionIndicator,
        EventTimeSummaryCard
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

    get breakTargetTitle(): string {
        const workTime = this.getDuration([EventType.Interruption, EventType.Task]);
        const workingDuration = TimeUtility.convertTime(workTime, 'millisecond', 'hour');
        const breakDuration = TimeUtility.convertTime(this.breakDuration, 'millisecond', 'hour');

        return `Daily target - ${breakDuration} out of ${workingDuration} hrs`;
    }

    get breakTarget(): number {
        const events = this.summaries.duration.filter(_ => _.eventType === EventType.Break);

        return events.length ? events.filter(_ => _.isResolved).length / events.length : 0;
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
            width: 95%;
        }
    }
}
</style>
