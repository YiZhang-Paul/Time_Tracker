<template>
    <div class="histories-view-selector-container">
        <div class="background">
            <component class="top-right" :is="notWorkingTypeIcon.component"></component>
            <component class="bottom-left" :is="workingTypeIcon.component"></component>
        </div>

        <div class="icons">
            <div class="sub-icon top-left">
                <component :is="taskTypeIcon.component" :style="{ color: taskTypeIcon.color }"></component>
            </div>

            <div class="sub-icon left">
                <component :is="interruptionTypeIcon.component" :style="{ color: interruptionTypeIcon.color }"></component>
            </div>

            <div class="sub-icon top-right">
                <component :is="idlingTypeIcon.component" :style="{ color: idlingTypeIcon.color }"></component>
            </div>

            <div class="sub-icon right">
                <component :is="breakTypeIcon.component" :style="{ color: breakTypeIcon.color }"></component>
            </div>

            <div class="main-icon">
                <component :is="workingTypeIcon.component" :style="{ color: workingTypeIcon.color }"></component>
            </div>

            <div class="main-icon">
                <component :is="notWorkingTypeIcon.component" :style="{ color: notWorkingTypeIcon.color }"></component>
            </div>
        </div>

        <div class="date">
            <history class="icon" />
            <span>{{ date }}</span>
        </div>

        <div class="label">histories</div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { History } from 'mdue';

import { IconUtility } from '../../../core/utilities/icon-utility/icon-utility';
import { TimeUtility } from '../../../core/utilities/time-utility/time-utility';

@Options({
    components: {
        History
    }
})
export default class HistoriesViewSelector extends Vue {
    public readonly taskTypeIcon = IconUtility.getTaskTypeIcon();
    public readonly interruptionTypeIcon = IconUtility.getInterruptionTypeIcon();
    public readonly idlingTypeIcon = IconUtility.getIdlingTypeIcon();
    public readonly breakTypeIcon = IconUtility.getBreakTypeIcon();
    public readonly workingTypeIcon = IconUtility.getWorkingTypeIcon();
    public readonly notWorkingTypeIcon = IconUtility.getNotWorkingTypeIcon();

    get date(): string {
        return TimeUtility.getDateString(new Date()).split(',').slice(1).join();
    }
}
</script>

<style lang="scss" scoped>
.histories-view-selector-container {
    @import '../../../styles/presets.scss';

    @include flex-column(center, center);
    position: relative;
    overflow: hidden;
    color: var(--font-colors-1-00);

    .background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        color: var(--font-colors-0-01);
        font-size: var(--font-sizes-2000);

        .top-right {
            position: absolute;
            top: -15%;
            right: -10%;
        }

        .bottom-left {
            position: absolute;
            bottom: -7.5%;
            left: -22.5%;
        }
    }

    .icons {
        @include flex-row(flex-start, space-between);
        position: relative;
        margin-bottom: 1.5vh;
        width: 42.5%;

        .main-icon, .sub-icon {
            @include flex-row(center, center);
            border-radius: 50%;
        }

        .main-icon {
            width: 6.75vh;
            height: 6.75vh;
            box-shadow: 0 0 7px 2px var(--misc-colors-a-04);
            background-color: var(--misc-colors-a-00);
            font-size: var(--font-sizes-750);
        }

        .sub-icon {
            position: absolute;
            width: 4vh;
            height: 4vh;
            box-shadow: 0 0 7px 2px rgba(0, 0, 0, 0.25);
            background-color: var(--context-colors-info-6-00);
            font-size: var(--font-sizes-550);

            &.top-left {
                top: -37.5%;
                right: 101.5%;
            }

            &.left {
                bottom: 0;
                right: 107.5%;
            }

            &.top-right {
                top: -37.5%;
                left: 101.5%;
            }

            &.right {
                bottom: 0;
                left: 107.5%;
            }
        }
    }

    .date {
        @include flex-row(center, center);
        font-size: var(--font-sizes-600);

        .icon {
            margin-right: 0.75vh;
            font-size: var(--font-sizes-750);
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
    }
}
</style>
