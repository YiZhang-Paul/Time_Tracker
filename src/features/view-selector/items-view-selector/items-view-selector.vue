<template>
    <div class="items-view-selector-container" :class="{ hovered: isHovered }" @mouseover="isHovered = true">
        <div class="background">
            <div class="glare top-right"></div>
            <div class="glare bottom-left"></div>
        </div>

        <daily-goal-summary class="daily-target" :workingDuration="workingDuration"></daily-goal-summary>

        <div class="active-item" :class="{ active: activeItemName }">
            <template v-if="activeItemName">
                <lightbulb-on class="icon" />
                <span>{{ activeItemName }}</span>
            </template>

            <template v-if="!activeItemName">
                <alarm-snooze class="icon" />
                <span>no ongoing item</span>
            </template>
        </div>

        <flat-button class="view-button">View All Items</flat-button>

        <div class="completions">
            <category-summary-display class="summary" :title="'Interruptions'" :icon="interruptionTypeIcon">
                <completion-indicator class="completion-indicator"
                    :description="interruptionCompletionTitle"
                    :percentage="interruptionCompletion"
                    :isDisabled="isInterruptionCompletionDisabled">
                </completion-indicator>
            </category-summary-display>

            <category-summary-display class="summary" :title="'Tasks'" :icon="taskTypeIcon">
                <completion-indicator class="completion-indicator"
                    :description="taskCompletionTitle"
                    :percentage="taskCompletion"
                    :isDisabled="isTaskCompletionDisabled">
                </completion-indicator>
            </category-summary-display>
        </div>

        <div class="label">to-do</div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { mapStores } from 'pinia';
import { AlarmSnooze, LightbulbOn } from 'mdue';

import { useEventStore } from '../../../stores/event/event.store';
import { useInterruptionStore } from '../../../stores/interruption/interruption.store';
import { useTaskStore } from '../../../stores/task/task.store';
import { ItemSummariesDto } from '../../../core/dtos/item-summaries-dto';
import { TimeUtility } from '../../../core/utilities/time-utility/time-utility';
import { IconUtility } from '../../../core/utilities/icon-utility/icon-utility';
import FlatButton from '../../../shared/buttons/flat-button/flat-button.vue';
import CategorySummaryDisplay from '../../../shared/displays/category-summary-display/category-summary-display.vue';
import CompletionIndicator from '../../../shared/indicators/completion-indicator/completion-indicator.vue';

import DailyGoalSummary from './daily-goal-summary/daily-goal-summary.vue';

@Options({
    components: {
        AlarmSnooze,
        LightbulbOn,
        FlatButton,
        CategorySummaryDisplay,
        CompletionIndicator,
        DailyGoalSummary
    },
    computed: {
        ...mapStores(useEventStore, useInterruptionStore, useTaskStore)
    }
})
export default class ItemsViewSelector extends Vue {
    public readonly interruptionTypeIcon = IconUtility.getInterruptionTypeIcon();
    public readonly taskTypeIcon = IconUtility.getTaskTypeIcon();
    public isHovered = false;
    private eventStore!: ReturnType<typeof useEventStore>;
    private interruptionStore!: ReturnType<typeof useInterruptionStore>;
    private taskStore!: ReturnType<typeof useTaskStore>;

    get workingDuration(): number {
        return TimeUtility.convertTime(this.eventStore.getWorkingDuration(), 'millisecond', 'hour');
    }

    get activeItemName(): string {
        const item = this.interruptionStore.activeSummary || this.taskStore.activeSummary;

        return item?.name ?? '';
    }

    get interruptionCompletionTitle(): string {
        return this.getCompletionTitle(this.interruptionStore.summaries);
    }

    get interruptionCompletion(): number {
        return this.getCompletionRate(this.interruptionStore.summaries);
    }

    get isInterruptionCompletionDisabled(): boolean {
        return this.isCompletionDisabled(this.interruptionStore.summaries);
    }

    get taskCompletionTitle(): string {
        return this.getCompletionTitle(this.taskStore.summaries);
    }

    get taskCompletion(): number {
        return this.getCompletionRate(this.taskStore.summaries);
    }

    get isTaskCompletionDisabled(): boolean {
        return this.isCompletionDisabled(this.taskStore.summaries);
    }

    public async created(): Promise<void> {
        await Promise.all([
            this.eventStore.loadOngoingEventSummary(),
            this.interruptionStore.loadSummaries(),
            this.taskStore.loadSummaries()
        ]);
    }

    private getCompletionTitle<T>({ resolved, unresolved }: ItemSummariesDto<T>): string {
        return `Completed - ${resolved.length} of ${resolved.length + unresolved.length}`;
    }

    private getCompletionRate<T>({ resolved, unresolved }: ItemSummariesDto<T>): number {
        const total = resolved.length + unresolved.length;

        return total ? resolved.length / total : 0;
    }

    private isCompletionDisabled<T>({ resolved, unresolved }: ItemSummariesDto<T>): boolean {
        return resolved.length + unresolved.length === 0;
    }
}
</script>

<style lang="scss" scoped>
.items-view-selector-container {
    @import '../../../styles/presets.scss';
    @import '../../../styles/animations.scss';

    @include flex-column(center, flex-start);
    position: relative;
    overflow: hidden;
    color: var(--font-colors-1-00);

    &:hover {
        cursor: pointer;

        .daily-target {
            height: 37.5%;
        }

        .view-button, .background .glare {
            display: initial;
        }

        .label {
            display: none;
        }
    }

    .background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        color: var(--font-colors-0-01);
        font-size: var(--font-sizes-2000);

        .glare {
            display: none;
            position: absolute;
            border-radius: 200px;
            @include animate-property(opacity, 0, 1, 0.6s, 0.1s);

            &.top-right {
                left: -5%;
                right: -90%;
                top: -60%;
                bottom: 20%;
                transform: rotate(-45deg);

                background: radial-gradient(
                    50% 50% at 50% 50%,
                    var(--item-type-colors-interruption-0-05) 0%,
                    transparent 100%
                );
            }

            &.bottom-left {
                left: -55%;
                right: 30%;
                top: -25%;
                bottom: -60%;
                transform: rotate(-15deg);

                background: radial-gradient(
                    50% 50% at 50% 50%,
                    var(--item-type-colors-task-0-05) 0%,
                    transparent 100%
                );
            }
        }
    }

    .daily-target {
        width: 100%;
        height: calc(45% - var(--font-sizes-400));
        transition: height 0.3s;
        @include animate-property(opacity, 0, 1, 0.3s, 0.1s);
    }

    .active-item {
        @include flex-row(center, center);
        color: var(--font-colors-3-00);
        @include animate-property(opacity, 0, 1, 0.3s, 0.5s);

        &.active {
            color: var(--font-colors-0-00);

            .icon {
                color: var(--context-colors-suggestion-0-00);
            }

            span {
                margin-top: 0.4rem;
            }
        }

        .icon {
            margin-right: 1vh;
            font-size: var(--font-sizes-700);
        }

        span {
            width: 80%;
            @include line-overflow();
        }
    }

    .view-button {
        display: none;
        margin-top: 2vh;
        padding-left: 3.75vh;
        padding-right: 3.75vh;
        border-radius: 25px;
        box-shadow: 0 0 10px 3px var(--context-colors-info-6-03);
        background-color: var(--context-colors-info-6-00);
        @include animate-property(opacity, 0, 1, 0.4s, 0.2s);
    }

    .completions {
        position: absolute;
        bottom: 12.5%;
        width: 62.5%;
        @include animate-property(opacity, 0, 1, 0.3s, 0.2s);

        .summary {
            width: 100%;

            &:not(:first-of-type) {
                margin-top: 2.5vh;
            }

            ::v-deep(.content) {
                font-size: var(--font-sizes-400);

                .title {
                    margin-bottom: 0;
                }
            }
        }

        .completion-indicator {
            width: 90%;
            font-size: var(--font-sizes-200);

            ::v-deep(.description) {
                margin-bottom: 3px;
            }
        }
    }

    .label {
        @include flex-row(center, center);
        position: absolute;
        right: 0;
        bottom: 0;
        padding: 0.5vh 1.75vh;
        border-top-left-radius: 10px;
        box-shadow: 0 0 5px 2px var(--context-colors-info-6-03);
        background-color: var(--context-colors-info-7-00);
        font-size: var(--font-sizes-300);
        @include animate-property(opacity, 0, 1, 0.4s, 1s);
    }

    &.hovered .label {
        animation-delay: 0.3s;
    }
}
</style>
