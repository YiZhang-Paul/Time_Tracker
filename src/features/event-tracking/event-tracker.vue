<template>
    <div class="event-tracker-container">
        <div class="working-duration" :class="{ active: isWorking }">
            <briefcase class="icon" />
            <span>{{ unrecordedWorkingDuration }}</span>
        </div>

        <div class="idling-duration" :class="{ active: isIdling }">
            <palm-tree class="icon" />
            <span>{{ unrecordedIdlingDuration }}</span>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { Briefcase, PalmTree } from 'mdue';

import store from '../../store';
import { TimeUtility } from '../../core/utilities/time-utility/time-utility';

@Options({
    components: {
        Briefcase,
        PalmTree
    }
})
export default class EventTracker extends Vue {
    public unrecordedWorkingDuration = '--:--:--';
    public unrecordedIdlingDuration = '--:--:--';

    get isWorking(): boolean {
        return store.eventHistory.getters(store.eventHistory.getter.IsWorking);
    }

    get isIdling(): boolean {
        return store.eventHistory.getters(store.eventHistory.getter.IsIdling);
    }

    public created(): void {
        this.updateUnrecordedWorkingDuration();
        this.updateUnrecordedIdlingDuration();
    }

    private updateUnrecordedWorkingDuration(): void {
        const duration = store.eventHistory.getters(store.eventHistory.getter.UnrecordedWorkingDuration);
        this.unrecordedWorkingDuration = TimeUtility.getDurationString(duration);
        setTimeout(() => this.updateUnrecordedWorkingDuration(), 1000);
    }

    private updateUnrecordedIdlingDuration(): void {
        const duration = store.eventHistory.getters(store.eventHistory.getter.UnrecordedIdlingDuration);
        this.unrecordedIdlingDuration = TimeUtility.getDurationString(duration);
        setTimeout(() => this.updateUnrecordedIdlingDuration(), 1000);
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
