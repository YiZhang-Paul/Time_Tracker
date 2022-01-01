<template>
    <div class="event-tracker-container">
        <div class="working-duration">
            <briefcase class="icon" />
            <span>00:00:00</span>
        </div>

        <div class="idling-duration">
            <palm-tree class="icon" />
            <span>00:00:00</span>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { Briefcase, PalmTree } from 'mdue';

import store from '../../store';

@Options({
    components: {
        Briefcase,
        PalmTree
    }
})
export default class EventTracker extends Vue {
    public created(): void {
        store.eventHistory.dispatch(store.eventHistory.action.LoadLastHistory);
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
        @include flex-row(center, center);

        .icon {
            margin-right: 0.75vh;
            color: var(--event-type-colors-idling-0-00);
            font-size: var(--font-sizes-700);
        }
    }

    .working-duration {
        margin-right: 2.5vh;

        .icon {
            color: var(--event-type-colors-working-0-00);
        }
    }
}
</style>
