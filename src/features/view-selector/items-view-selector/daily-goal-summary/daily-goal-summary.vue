<template>
    <div class="daily-goal-summary-container">
        <emoticon-cool v-if="workingDuration >= targetHours" class="emoticon-icon" />
        <emoticon-sad v-if="workingDuration < targetHours" class="emoticon-icon" />

        <div class="summary">
            <span class="title">Work done today</span>
            <span class="duration" :style="{ color: durationColor }">{{ workingDurationText }}</span>

            <div v-if="workingDuration >= targetHours" class="delta completed">
                <medal class="icon" />
                <span>target completed!</span>
            </div>

            <div v-if="workingDuration < targetHours" class="delta">
                <menu-down class="icon" />
                <span>{{ dailyTargetStatusText }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { EmoticonCool, EmoticonSad, Medal, MenuDown } from 'mdue';

class DailyGoalSummaryProp {
    public workingDuration = prop<number>({ default: 0 });
}

@Options({
    components: {
        EmoticonCool,
        EmoticonSad,
        Medal,
        MenuDown
    }
})
export default class DailyGoalSummary extends Vue.with(DailyGoalSummaryProp) {
    public readonly targetHours = 8;

    get durationColor(): string {
        const percentage = this.workingDuration / this.targetHours;

        if (percentage < 0.25) {
            return 'var(--context-colors-warning-0-00)';
        }

        return percentage < 0.75 ? 'var(--context-colors-suggestion-0-00)' : 'var(--context-colors-success-0-00)';
    }

    get workingDurationText(): string {
        return `${this.workingDuration} hour${this.workingDuration > 1 ? 's' : ''}`;
    }

    get dailyTargetStatusText(): string {
        const delta = this.targetHours - this.workingDuration;

        return `${delta} hour${delta > 1 ? 's' : ''} till goal`;
    }
}
</script>

<style lang="scss" scoped>
.daily-goal-summary-container {
    @import '../../../../styles/presets.scss';

    @include flex-row(flex-start, center);

    .emoticon-icon {
        margin-top: 7.5%;
        margin-right: 2vh;
        color: var(--misc-colors-b-00);
        font-size: var(--font-sizes-1300);
    }

    .summary {
        @include flex-column();
        margin-top: 17.5%;

        .title {
            font-size: var(--font-sizes-500);
        }

        .duration {
            margin-top: 0.5vh;
            font-size: var(--font-sizes-700);
        }

        .delta {
            @include flex-row(center);
            color: var(--font-colors-2-00);
            font-size: var(--font-sizes-200);

            &.completed {
                color: var(--font-colors-1-00);

                .icon {
                    color: var(--context-colors-info-0-00);
                }
            }

            .icon {
                margin: 0 3px 0 1px;
                color: var(--context-colors-warning-0-00);
                font-size: var(--font-sizes-400);
            }
        }
    }
}
</style>
