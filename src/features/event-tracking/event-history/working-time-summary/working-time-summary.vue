<template>
    <div class="working-time-summary-container">
        <div class="summaries">
            <event-type-summary-card :title="'You worked'"
                :duration="totalDuration"
                :icon="workingTypeIcon">
            </event-type-summary-card>

            <completion-indicator class="completion-indicator"
                :description="targetTitle"
                :percentage="dailyGoalCompletion">
            </completion-indicator>
        </div>

        <div class="summaries">
            <event-type-summary-card :title="'Interruptions'"
                :duration="interruptionDuration"
                :icon="interruptionIcon">
            </event-type-summary-card>

            <completion-indicator class="completion-indicator"
                :description="interruptionCompletionTitle"
                :percentage="interruptionCompletion"
                :isDisabled="isInterruptionCompletionDisabled">
            </completion-indicator>

            <completion-indicator class="completion-indicator"
                :description="'Percentage - lower is better'"
                :percentage="totalDuration ? interruptionDuration / totalDuration : 0"
                :isHigherPreferred="false">
            </completion-indicator>
        </div>

        <div class="summaries">
            <event-type-summary-card :title="'Tasks'"
                :duration="taskDuration"
                :icon="taskIcon">
            </event-type-summary-card>

            <completion-indicator class="completion-indicator"
                :description="taskCompletionTitle"
                :percentage="taskCompletion"
                :isDisabled="isTaskCompletionDisabled">
            </completion-indicator>

            <completion-indicator class="completion-indicator"
                :description="'Percentage - higher is better'"
                :percentage="totalDuration ? taskDuration / totalDuration : 0">
            </completion-indicator>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { mapStores } from 'pinia';

import { useEventStore } from '../../../../stores/event/event.store';
import { EventSummariesDto } from '../../../../core/dtos/event-summaries-dto';
import { EventType } from '../../../../core/enums/event-type.enum';
import { IconUtility } from '../../../../core/utilities/icon-utility/icon-utility';
import { TimeUtility } from '../../../../core/utilities/time-utility/time-utility';
import CompletionIndicator from '../../../../shared/indicators/completion-indicator/completion-indicator.vue';
import EventTypeSummaryCard from '../event-type-summary-card/event-type-summary-card.vue';

class WorkingTimeSummaryProp {
    public summaries = prop<EventSummariesDto>({ default: new EventSummariesDto() });
}

@Options({
    components: {
        CompletionIndicator,
        EventTypeSummaryCard
    },
    computed: {
        ...mapStores(useEventStore)
    }
})
export default class WorkingTimeSummary extends Vue.with(WorkingTimeSummaryProp) {
    public readonly workingTypeIcon = IconUtility.getWorkingTypeIcon();
    public readonly interruptionIcon = IconUtility.getInterruptionTypeIcon();
    public readonly taskIcon = IconUtility.getTaskTypeIcon();
    private eventStore!: ReturnType<typeof useEventStore>;

    get totalDuration(): number {
        return this.getDuration([EventType.Interruption, EventType.Task]);
    }

    get targetTitle(): string {
        const completed = TimeUtility.convertTime(this.totalDuration, 'millisecond', 'hour');
        const target = TimeUtility.convertTime(this.eventStore.dailyWorkDuration, 'millisecond', 'hour');

        return `Daily target - ${completed} out of ${target} hrs`;
    }

    get dailyGoalCompletion(): number {
        const target = this.eventStore.dailyWorkDuration;

        return target ? this.totalDuration / target : 0;
    }

    get interruptionDuration(): number {
        return this.getDuration([EventType.Interruption]);
    }

    get interruptionCompletionTitle(): string {
        const events = this.summaries.duration.filter(_ => _.eventType === EventType.Interruption);

        return `Completed - ${events.filter(_ => _.isResolved).length} out of ${events.length}`;
    }

    get interruptionCompletion(): number {
        const events = this.summaries.duration.filter(_ => _.eventType === EventType.Interruption);

        return events.length ? events.filter(_ => _.isResolved).length / events.length : 0;
    }

    get isInterruptionCompletionDisabled(): boolean {
        return this.summaries.duration.every(_ => _.eventType !== EventType.Interruption);
    }

    get taskDuration(): number {
        return this.getDuration([EventType.Task]);
    }

    get taskCompletionTitle(): string {
        const events = this.summaries.duration.filter(_ => _.eventType === EventType.Task);

        return `Completed - ${events.filter(_ => _.isResolved).length} out of ${events.length}`;
    }

    get taskCompletion(): number {
        const events = this.summaries.duration.filter(_ => _.eventType === EventType.Task);

        return events.length ? events.filter(_ => _.isResolved).length / events.length : 0;
    }

    get isTaskCompletionDisabled(): boolean {
        return this.summaries.duration.every(_ => _.eventType !== EventType.Task);
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
