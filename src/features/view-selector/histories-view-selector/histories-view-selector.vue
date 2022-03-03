<template>
    <div class="histories-view-selector-container" :class="{ hovered: isHovered }" @mouseover="isHovered = true">
        <div class="background">
            <component class="icon top-right" :is="notWorkingTypeIcon.component"></component>
            <component class="icon bottom-left" :is="workingTypeIcon.component"></component>
            <div class="glare top-right"></div>
            <div class="glare bottom-left"></div>
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

            <div class="main-icon left">
                <component :is="workingTypeIcon.component" :style="{ color: workingTypeIcon.color }"></component>
            </div>

            <div class="main-icon right">
                <component :is="notWorkingTypeIcon.component" :style="{ color: notWorkingTypeIcon.color }"></component>
            </div>
        </div>

        <div class="date">
            <history class="icon" />
            <span>{{ date }}</span>
        </div>

        <flat-button class="view-button">View Histories</flat-button>
        <div class="label">histories</div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { History } from 'mdue';

import { IconUtility } from '../../../core/utilities/icon-utility/icon-utility';
import { TimeUtility } from '../../../core/utilities/time-utility/time-utility';
import FlatButton from '../../../shared/buttons/flat-button/flat-button.vue';

@Options({
    components: {
        History,
        FlatButton
    }
})
export default class HistoriesViewSelector extends Vue {
    public readonly taskTypeIcon = IconUtility.getTaskTypeIcon();
    public readonly interruptionTypeIcon = IconUtility.getInterruptionTypeIcon();
    public readonly idlingTypeIcon = IconUtility.getIdlingTypeIcon();
    public readonly breakTypeIcon = IconUtility.getBreakTypeIcon();
    public readonly workingTypeIcon = IconUtility.getWorkingTypeIcon();
    public readonly notWorkingTypeIcon = IconUtility.getNotWorkingTypeIcon();
    public isHovered = false;

    get date(): string {
        return TimeUtility.getDateString(new Date()).split(',').slice(1).join();
    }
}
</script>

<style lang="scss" scoped>
.histories-view-selector-container {
    @import '../../../styles/presets.scss';
    @import '../../../styles/animations.scss';

    @include flex-column(center, center);
    position: relative;
    overflow: hidden;
    color: var(--font-colors-1-00);

    &:hover {
        cursor: pointer;

        .icons {
            margin-bottom: 0;
            height: 1.5vh;

            .main-icon, .sub-icon {
                display: none;
            }
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
                left: -10%;
                right: -45%;
                top: -160%;
                bottom: 5%;
                transform: rotate(-55deg);

                background: radial-gradient(
                    50% 50% at 50% 50%,
                    var(--item-type-colors-interruption-0-05) 0%,
                    transparent 100%
                );
            }

            &.bottom-left {
                left: -75%;
                right: 35%;
                top: -60%;
                bottom: -165%;
                transform: rotate(-10deg);

                background: radial-gradient(
                    50% 50% at 50% 50%,
                    var(--item-type-colors-task-0-05) 0%,
                    transparent 100%
                );
            }
        }

        .icon.top-right {
            position: absolute;
            top: -15%;
            right: -10%;
        }

        .icon.bottom-left {
            position: absolute;
            bottom: -7.5%;
            left: -22.5%;
        }
    }

    .icons {
        $height: 6.5vh;

        @include flex-row(flex-start, space-between);
        position: relative;
        margin-bottom: 2vh;
        width: 42.5%;
        height: $height;
        transition: height 0.3s, margin-bottom 0.3s;

        .main-icon, .sub-icon {
            @include flex-row(center, center);
            border-radius: 50%;
            @include animate-property(opacity, 0, 1, 0.4s);
        }

        .main-icon {
            width: $height;
            height: $height;
            box-shadow: 0 0 7px 2px var(--misc-colors-a-03);
            background-color: var(--misc-colors-a-00);
            font-size: var(--font-sizes-750);

            &.left {
                animation-delay: 0.15s;
            }

            &.right {
                animation-delay: 0.15s;
            }
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
                right: 102%;
                animation-delay: 0.35s;
            }

            &.left {
                bottom: 0;
                right: 107.5%;
                animation-delay: 0.35s;
            }

            &.top-right {
                top: -37.5%;
                left: 102%;
                animation-delay: 0.35s;
            }

            &.right {
                bottom: 0;
                left: 107.5%;
                animation-delay: 0.35s;
            }
        }
    }

    .date {
        @include flex-row(center, center);
        font-size: var(--font-sizes-600);
        @include animate-property(opacity, 0, 1, 0.3s, 0.1s);

        .icon {
            margin-right: 0.75vh;
            font-size: var(--font-sizes-750);
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

    &.hovered {

        .main-icon, .sub-icon {

            &.left, &.right, &.top-left, &.top-right {
                animation-delay: 0s;
            }
        }

        .label {
            animation-delay: 0.3s;
        }
    }
}
</style>
