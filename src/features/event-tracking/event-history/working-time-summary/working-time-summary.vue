<template>
    <div class="working-time-summary-container">
        <div class="summaries">
            <event-time-summary-card :title="'You worked'"
                :duration="totalDuration"
                :icon="workingTypeIcon">
            </event-time-summary-card>

            <completion-indicator class="completion-indicator"
                :description="dailyTargetTitle"
                :percentage="dailyTargetCompletion">
            </completion-indicator>
        </div>

        <div class="summaries">
            <event-time-summary-card :title="'Interruptions'"
                :duration="interruptionDuration"
                :icon="interruptionIcon">
            </event-time-summary-card>
        </div>

        <div class="summaries">
            <event-time-summary-card :title="'Tasks'"
                :duration="taskDuration"
                :icon="taskIcon">
            </event-time-summary-card>
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

class WorkingTimeSummaryProp {
    public summaries = prop<EventSummariesDto>({ default: new EventSummariesDto() });
}

@Options({
    components: {
        CompletionIndicator,
        EventTimeSummaryCard
    }
})
export default class WorkingTimeSummary extends Vue.with(WorkingTimeSummaryProp) {
    public readonly workingTypeIcon = IconUtility.getWorkingTypeIcon();
    public readonly interruptionIcon = IconUtility.getInterruptionTypeIcon();
    public readonly taskIcon = IconUtility.getTaskTypeIcon();
    private readonly dailyTargetHours = 8;

    get totalDuration(): number {
        return this.getDuration([EventType.Interruption, EventType.Task]);
    }

    get dailyTargetTitle(): string {
        const converted = TimeUtility.convertTime(this.totalDuration, 'millisecond', 'hour');
        const completed = Math.floor(converted * 10) / 10;

        return `Daily target - ${completed} out of ${this.dailyTargetHours} hrs`;
    }

    get dailyTargetCompletion(): number {
        return this.totalDuration / TimeUtility.convertTime(this.dailyTargetHours, 'hour', 'millisecond');
    }

    get interruptionDuration(): number {
        return this.getDuration([EventType.Interruption]);
    }

    get taskDuration(): number {
        return this.getDuration([EventType.Task]);
    }

    private getDuration(types: EventType[]): number {
        const events = this.summaries.duration.filter(_ => types.includes(_.eventType));

        return events.map(_ => _.duration).reduce((total, _) => total + _, 0);
    }
}
</script>

<style lang="scss" scoped>
.working-time-summary-container {
    @import '../../../../styles/presets.scss';

    @include flex-column(flex-start, space-between);

    .summaries {
        width: 100%;
        height: 33%;

        .completion-indicator {
            margin-top: 1.5vh;
        }
    }
}
</style>
