<template>
    <div class="work-item-type-selection-dialog-container">
        <div class="title">
            <lightbulb-on class="icon" />
            <span>What's the problem?</span>
        </div>

        <div class="options">
            <raised-button class="option" @click="$emit('confirm', true)">
                <div class="option-content">
                    <span>Interruption</span>
                    <car-brake-alert class="icon" />
                </div>
            </raised-button>

            <raised-button class="option" @click="$emit('confirm', false)">
                <div class="option-content">
                    <span>Task</span>
                    <calendar-check class="icon" />
                </div>
            </raised-button>
        </div>

        <flat-button class="cancel-button" @click="$emit('cancel')">I changed my mind</flat-button>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { CarBrakeAlert, CalendarCheck, LightbulbOn } from 'mdue';

import FlatButton from '../../../shared/buttons/flat-button/flat-button.vue';
import RaisedButton from '../../../shared/buttons/raised-button/raised-button.vue';

@Options({
    components: {
        CarBrakeAlert,
        CalendarCheck,
        LightbulbOn,
        FlatButton,
        RaisedButton
    },
    emits: [
        'cancel',
        'confirm'
    ]
})
export default class WorkItemTypeSelectionDialog extends Vue { }
</script>

<style lang="scss" scoped>
.work-item-type-selection-dialog-container {
    @import '../../../styles/presets.scss';
    @import '../../../styles/animations.scss';

    @include flex-column(center, center);
    color: var(--font-colors-0-00);
    font-size: var(--font-sizes-600);

    .title {
        @include flex-row(center, center);
        @include animate-opacity(0, 1, 0.3s, 0.2s);

        .icon {
            margin-right: 12px;
            color: var(--context-colors-suggestion-0-00);
            font-size: var(--font-sizes-700);
        }
    }

    .options {
        @include flex-row(center, space-between);
        margin-top: 5vh;
        margin-bottom: 2.5vh;
        width: 70%;
        font-size: var(--font-sizes-500);

        .option {
            width: 45%;
            height: 20vh;

            &:hover ::v-deep(.content-wrapper) {
                background-color: var(--primary-colors-8-00);
                color: var(--context-colors-suggestion-0-00);
            }

            .option-content {
                @include flex-column(center, center);
                width: 100%;
                height: 100%;

                .icon {
                    margin-top: 2.5vh;
                    font-size: var(--font-sizes-900);
                }
            }
        }
    }

    .cancel-button {
        align-self: flex-end;
        margin-right: 12.5%;
        color: var(--font-colors-3-00);
        font-size: var(--font-sizes-400);
        @include animate-opacity(0, 1, 0.3s, 1.5s);

        &:hover ::v-deep(.content-wrapper) {
            color: var(--font-colors-0-00);
        }
    }
}
</style>
