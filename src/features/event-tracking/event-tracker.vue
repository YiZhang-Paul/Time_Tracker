<template>
    <div class="event-tracker-container">
        <div class="working-duration" :class="{ active: isWorking }">
            <briefcase class="icon" />
            <span>{{ workingDuration }}</span>
        </div>

        <div class="not-working-duration" :class="{ active: isNotWorking }">
            <palm-tree class="icon" />
            <span>{{ notWorkingDuration }}</span>
        </div>
    </div>
</template>

<script lang="ts">
import { markRaw } from '@vue/reactivity';
import { Options, Vue } from 'vue-class-component';
import { Briefcase, PalmTree } from 'mdue';

import store from '../../store';
import { ConfirmationDialogOption } from '../../core/models/options/confirmation-dialog-option';
import { DialogConfig } from '../../core/models/generic/dialog-config';
import { ButtonType } from '../../core/enums/button-type.enum';
import { TimeUtility } from '../../core/utilities/time-utility/time-utility';
import ConfirmationDialog from '../../shared/dialogs/confirmation-dialog/confirmation-dialog.vue';

@Options({
    components: {
        Briefcase,
        PalmTree
    }
})
export default class EventTracker extends Vue {
    public isBreakPromptActive = false;
    public workingDuration = '';
    public notWorkingDuration = '';
    private updateTimeout!: number;
    /* istanbul ignore next */
    get isWorking(): boolean {
        return store.event.getters(store.event.getter.IsWorking);
    }

    /* istanbul ignore next */
    get isNotWorking(): boolean {
        return store.event.getters(store.event.getter.IsNotWorking);
    }

    public created(): void {
        this.updateProgress();
    }

    public unmounted(): void {
        clearTimeout(this.updateTimeout);
    }

    private updateProgress(): void {
        this.updateDurations();
        this.updateBreakCheck();
        this.updateTimeout = setTimeout(() => this.updateProgress(), 1000);
    }

    private updateDurations(): void {
        const workingDuration = store.event.getters(store.event.getter.WorkingDuration);
        const notWorkingDuration = store.event.getters(store.event.getter.NotWorkingDuration);
        this.workingDuration = TimeUtility.getDurationString(workingDuration);
        this.notWorkingDuration = TimeUtility.getDurationString(notWorkingDuration);
    }

    private updateBreakCheck(): void {
        const key = store.event.getter.IsScheduledBreakNeeded;

        if (this.isBreakPromptActive || !store.event.getters(key)) {
            return;
        }

        const limit = store.event.getters(store.event.getter.WorkingDurationLimit);
        const title = `You have worked more than ${limit / 60 / 1000} minutes. Time to take a break.`;
        const data = new ConfirmationDialogOption(title, 'Take a break', 'Skip', ButtonType.Confirm);
        const preCancel = this.skipBreakSession.bind(this);
        const preConfirm = this.startBreakSession.bind(this);
        const config = new DialogConfig(markRaw(ConfirmationDialog), data, { width: '35vw', preCancel, preConfirm });
        setTimeout(() => store.dialog.dispatch(store.dialog.action.OpenDialog, config), 1500);
        this.isBreakPromptActive = true;
    }

    private async startBreakSession(): Promise<void> {
        await store.event.dispatch(store.event.action.StartBreakSession);
        this.isBreakPromptActive = false;
    }

    private async skipBreakSession(): Promise<void> {
        await store.event.dispatch(store.event.action.SkipBreakSession);
        this.isBreakPromptActive = false;
    }
}
</script>

<style lang="scss" scoped>
.event-tracker-container {
    @import '../../styles/presets.scss';

    @include flex-row(center, center);
    color: var(--font-colors-3-00);
    font-size: var(--font-sizes-500);

    .working-duration, .not-working-duration {
        @include flex-row(center);
        transition: color 0.5s;
        width: 40%;

        &.active {
            color: var(--font-colors-1-00);
        }

        .icon {
            margin-right: 0.75vh;
            font-size: var(--font-sizes-700);
        }
    }

    .working-duration .icon {
        color: var(--event-type-colors-working-0-00);
    }

    .not-working-duration .icon {
        color: var(--event-type-colors-not-working-0-00);
    }
}
</style>
