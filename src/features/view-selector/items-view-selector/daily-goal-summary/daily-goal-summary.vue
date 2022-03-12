<template>
    <div class="daily-goal-summary-container">
        <emoticon-cool v-if="workingDuration >= targetHours" class="emoticon-icon" />
        <emoticon-sad v-if="workingDuration < targetHours" class="emoticon-icon" />

        <div class="summary">
            <span class="title">Work done today</span>

            <div class="duration">
                <span :style="{ color: durationColor }">{{ workingDurationText }}</span>
            </div>

            <div class="delta-wrapper">
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

        return `${Math.round(delta * 10) / 10} hour${delta > 1 ? 's' : ''} till goal`;
    }
}
</script>

<style lang="scss" scoped>
.daily-goal-summary-container {
    @import '../../../../styles/presets.scss';
    @import '../../../../styles/animations.scss';

    @include flex-row(flex-start, center);

    .emoticon-icon {
        margin-top: 7.5%;
        margin-right: 2vh;
        color: var(--misc-colors-b-00);
        font-size: var(--font-sizes-1300);
    }

    .summary {
        @include flex-column();
        margin-top: 15%;

        .title {
            font-size: var(--font-sizes-500);
        }

        .duration {
            $font-size: var(--font-sizes-750);

            position: relative;
            margin-top: 0.25vh;
            height: calc(#{$font-size} * 1.35);
            font-size: $font-size;
            @include animate-property(opacity, 0, 1, 0.45s, 0.5s);

            span {
                position: absolute;
                left: 50%;
                @include line-overflow();
                @include animate-property(left, 40%, 10%, 0.45s, 0.5s);
            }
        }

        .delta-wrapper {
            $font-size: var(--font-sizes-200);

            @include flex-row(center);
            position: relative;
            height: calc(#{$font-size} * 1.5);
            color: var(--font-colors-2-00);
            font-size: $font-size;
            @include animate-property(opacity, 0, 1, 0.4s, 0.9s);

            .delta {
                @include flex-row(center);
                position: absolute;
                @include animate-property(left, -10%, 10%, 0.4s, 0.9s);

                &.completed {
                    color: var(--font-colors-1-00);

                    .icon {
                        color: var(--context-colors-info-0-00);
                    }
                }

                .icon {
                    margin-right: 3px;
                    color: var(--context-colors-warning-0-00);
                    font-size: var(--font-sizes-400);
                }
            }
        }
    }
}
</style>
