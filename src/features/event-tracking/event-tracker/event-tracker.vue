<template>
    <div class="event-tracker-container">
        <div v-if="eventStore.isBreaking && remainingBreak" class="remaining-break">
            <span>break left: {{ remainingBreak }}</span>
        </div>

        <template v-if="!eventStore.isBreaking">
            <div class="working-duration" :class="{ active: eventStore.isWorking }">
                <sword-cross class="icon" />
                <span>{{ workingDuration }}</span>
            </div>

            <div class="non-working-duration" :class="{ active: eventStore.isNotWorking }">
                <shield-cross class="icon" />
                <span>{{ nonWorkingDuration }}</span>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import { markRaw } from '@vue/reactivity';
import { Options, Vue } from 'vue-class-component';
import { mapStores } from 'pinia';
import { ShieldCross, SwordCross } from 'mdue';

import { useDialogStore } from '../../../stores/dialog/dialog.store';
import { useNotificationStore } from '../../../stores/notification/notification.store';
import { useEventStore } from '../../../stores/event/event.store';
import { ConfirmationDialogOption } from '../../../core/models/options/confirmation-dialog-option';
import { DialogConfig } from '../../../core/models/generic/dialog-config';
import { ButtonType } from '../../../core/enums/button-type.enum';
import { TimeUtility } from '../../../core/utilities/time-utility/time-utility';
import ConfirmationDialog from '../../../shared/dialogs/confirmation-dialog/confirmation-dialog.vue';

@Options({
    components: {
        ShieldCross,
        SwordCross
    },
    computed: {
        ...mapStores(useDialogStore, useNotificationStore, useEventStore)
    }
})
export default class EventTracker extends Vue {
    public remainingBreak = '';
    public workingDuration = '';
    public nonWorkingDuration = '';
    public eventStore!: ReturnType<typeof useEventStore>;
    private dialogStore!: ReturnType<typeof useDialogStore>;
    private notificationStore!: ReturnType<typeof useNotificationStore>;
    private isBreakStartPromptActive = false;
    private isBreakEndPromptActive = false;
    private updateTimeout!: number;

    public created(): void {
        this.updateProgress();
    }

    public unmounted(): void {
        clearTimeout(this.updateTimeout);
    }

    private updateProgress(): void {
        if (!this.eventStore.isBreaking) {
            this.updateDurations();
            this.checkBreakStart();
        }
        else {
            this.checkBreakEnd();
        }

        this.updateTimeout = setTimeout(() => this.updateProgress(), 1000);
    }

    private updateDurations(): void {
        const workingDuration = this.eventStore.getWorkingDuration();
        const nonWorkingDuration = this.eventStore.getNonWorkingDuration();
        this.workingDuration = TimeUtility.getDurationString(workingDuration);
        this.nonWorkingDuration = TimeUtility.getDurationString(nonWorkingDuration);
    }

    private checkBreakStart(): void {
        if (this.isBreakStartPromptActive || !this.eventStore.hasScheduledBreak()) {
            return;
        }

        const limit = this.eventStore.workDurationLimit / 60 / 1000;
        const title = `You have worked more than ${limit} minutes. Time to take a break.`;
        const data = new ConfirmationDialogOption(title, 'Take a break', 'Skip', ButtonType.Confirm);
        const preCancel = this.skipBreak.bind(this);
        const preConfirm = this.startBreak.bind(this);
        const config = new DialogConfig(markRaw(ConfirmationDialog), data, { width: '35vw', preCancel, preConfirm });
        this.isBreakStartPromptActive = true;

        setTimeout(() => {
            this.notificationStore.clearTabNotification('working');
            this.notificationStore.showTabNotificationForBreakPrompt();
            this.dialogStore.open(config);
        }, 1500);
    }

    private async checkBreakEnd(): Promise<void> {
        const remainingBreak = this.eventStore.getRemainingBreak();
        this.remainingBreak = TimeUtility.getDurationString(remainingBreak);

        if (remainingBreak || this.isBreakEndPromptActive) {
            return;
        }

        const title = 'The break has ended. Time to get back to work.';
        const data = new ConfirmationDialogOption(title, 'Alright', '', ButtonType.Confirm);
        const postConfirm = () => this.isBreakEndPromptActive = false;
        const config = new DialogConfig(markRaw(ConfirmationDialog), data, { width: '35vw', postConfirm });
        this.dialogStore.open(config);
        this.isBreakEndPromptActive = true;
        await this.eventStore.startIdling();
    }

    private async startBreak(): Promise<void> {
        await this.eventStore.startBreak();
        this.notificationStore.clearTabNotification('breakPrompt');
        this.isBreakStartPromptActive = false;
    }

    private async skipBreak(): Promise<void> {
        await this.eventStore.skipBreak();
        this.notificationStore.clearTabNotification('breakPrompt');
        this.notificationStore.showTabNotificationForWork();
        this.isBreakStartPromptActive = false;
    }
}
</script>

<style lang="scss" scoped>
.event-tracker-container {
    @import '../../../styles/presets.scss';
    @import '../../../styles/animations.scss';

    @include flex-row(center, center);
    color: var(--font-colors-3-00);
    font-size: var(--font-sizes-500);

    .remaining-break {
        @include flex-row(center);
        width: 50%;
        color: var(--event-type-colors-not-working-0-00);
        @include animate-opacity(0, 1, 0.4s);
    }

    .working-duration, .non-working-duration {
        @include flex-row(center);
        width: 40%;
        transition: color 0.5s;

        &.active {
            color: var(--font-colors-1-00);
        }

        .icon {
            margin-right: 0.75vh;
            font-size: var(--font-sizes-700);
            transition: color 0.5s;
        }
    }

    .working-duration.active .icon {
        color: var(--event-type-colors-working-0-00);
    }

    .non-working-duration.active .icon {
        color: var(--event-type-colors-not-working-0-00);
    }
}
</style>
