<template>
    <div class="event-tracker-container">
        <div class="working-duration" :class="{ active: eventState.isWorking }">
            <briefcase class="icon" />
            <span>{{ workingDuration }}</span>
        </div>

        <div class="not-working-duration" :class="{ active: eventState.isNotWorking }">
            <palm-tree class="icon" />
            <span>{{ nonWorkingDuration }}</span>
        </div>
    </div>
</template>

<script lang="ts">
import { markRaw } from '@vue/reactivity';
import { Options, Vue } from 'vue-class-component';
import { mapStores } from 'pinia';
import { Briefcase, PalmTree } from 'mdue';

import { useDialogStore } from '../../stores/dialog/dialog.store';
import { types } from '../../core/ioc/types';
import { container } from '../../core/ioc/container';
import { ConfirmationDialogOption } from '../../core/models/options/confirmation-dialog-option';
import { DialogConfig } from '../../core/models/generic/dialog-config';
import { ButtonType } from '../../core/enums/button-type.enum';
import { EventStateService } from '../../core/services/states/event-state/event-state.service';
import { TimeUtility } from '../../core/utilities/time-utility/time-utility';
import ConfirmationDialog from '../../shared/dialogs/confirmation-dialog/confirmation-dialog.vue';

@Options({
    components: {
        Briefcase,
        PalmTree
    },
    computed: {
        ...mapStores(useDialogStore)
    }
})
export default class EventTracker extends Vue {
    public eventState = container.get<EventStateService>(types.EventStateService);
    public isBreakPromptActive = false;
    public workingDuration = '';
    public nonWorkingDuration = '';
    private dialogStore!: ReturnType<typeof useDialogStore>;
    private updateTimeout!: number;

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
        const { workingDuration, nonWorkingDuration } = this.eventState;
        this.workingDuration = TimeUtility.getDurationString(workingDuration);
        this.nonWorkingDuration = TimeUtility.getDurationString(nonWorkingDuration);
    }

    private updateBreakCheck(): void {
        if (this.isBreakPromptActive || !this.eventState.hasScheduledBreak) {
            return;
        }

        const limit = this.eventState.workDurationLimit / 60 / 1000;
        const title = `You have worked more than ${limit} minutes. Time to take a break.`;
        const data = new ConfirmationDialogOption(title, 'Take a break', 'Skip', ButtonType.Confirm);
        const preCancel = this.skipBreak.bind(this);
        const preConfirm = this.startBreak.bind(this);
        const config = new DialogConfig(markRaw(ConfirmationDialog), data, { width: '35vw', preCancel, preConfirm });
        setTimeout(() => this.dialogStore.open(config), 1500);
        this.isBreakPromptActive = true;
    }

    private async startBreak(): Promise<void> {
        await this.eventState.startBreak();
        this.isBreakPromptActive = false;
    }

    private async skipBreak(): Promise<void> {
        await this.eventState.skipBreak();
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
