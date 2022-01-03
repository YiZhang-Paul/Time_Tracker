<template>
    <div class="event-tracker-container">
        <dialog-panel v-if="breakPromptDialogOption"
            :dialog="confirmationDialog"
            :data="breakPromptDialogOption"
            :width="'35vw'"
            @cancel="onBreakSkip()"
            @confirm="onBreakStart()">
        </dialog-panel>

        <div class="working-duration" :class="{ active: isWorking }">
            <briefcase class="icon" />
            <span>{{ workingDuration }}</span>
        </div>

        <div class="idling-duration" :class="{ active: isIdling }">
            <palm-tree class="icon" />
            <span>{{ idlingDuration }}</span>
        </div>
    </div>
</template>

<script lang="ts">
import { markRaw } from '@vue/reactivity';
import { Options, Vue } from 'vue-class-component';
import { Briefcase, PalmTree } from 'mdue';

import store from '../../store';
import { ConfirmationDialogOption } from '../../core/models/options/confirmation-dialog-option';
import { ButtonType } from '../../core/enums/button-type.enum';
import { TimeUtility } from '../../core/utilities/time-utility/time-utility';
import DialogPanel from '../../shared/panels/dialog-panel/dialog-panel.vue';
import ConfirmationDialog from '../../shared/dialogs/confirmation-dialog/confirmation-dialog.vue';

@Options({
    components: {
        Briefcase,
        PalmTree,
        DialogPanel
    }
})
export default class EventTracker extends Vue {
    public readonly confirmationDialog = markRaw(ConfirmationDialog);
    public breakPromptDialogOption: ConfirmationDialogOption | null = null;
    public workingDuration = '';
    public idlingDuration = '';

    get isWorking(): boolean {
        return store.eventHistory.getters(store.eventHistory.getter.IsWorking);
    }

    get isIdling(): boolean {
        return store.eventHistory.getters(store.eventHistory.getter.IsIdling);
    }

    public created(): void {
        this.updateProgress();
    }

    private updateProgress(): void {
        this.updateDurations();
        this.updateBreakCheck();
        setTimeout(() => this.updateProgress(), 1000);
    }

    private updateDurations(): void {
        const workingDuration = store.eventHistory.getters(store.eventHistory.getter.WorkingDuration);
        const idlingDuration = store.eventHistory.getters(store.eventHistory.getter.IdlingDuration);
        this.workingDuration = TimeUtility.getDurationString(workingDuration);
        this.idlingDuration = TimeUtility.getDurationString(idlingDuration);
    }

    private updateBreakCheck(): void {
        if (this.breakPromptDialogOption) {
            return;
        }

        const oneMinute = 1000 * 60;
        const limit = oneMinute * 50;
        const duration = store.eventHistory.getters(store.eventHistory.getter.WorkingDuration);

        if (this.isWorking && duration / limit >= 1) {
            const title = `You have worked more than ${limit / oneMinute} minutes. Time to take a break.`;
            this.breakPromptDialogOption = new ConfirmationDialogOption(title, 'Take a break', 'Skip', ButtonType.Confirm);
        }
    }
}
</script>

<style lang="scss" scoped>
.event-tracker-container {
    @import '../../styles/presets.scss';

    @include flex-row(center, center);
    color: var(--font-colors-3-00);
    font-size: var(--font-sizes-500);

    .working-duration, .idling-duration {
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

    .idling-duration .icon {
        color: var(--event-type-colors-idling-0-00);
    }
}
</style>
