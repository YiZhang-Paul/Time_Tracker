<template>
    <div class="not-working-time-summary-container">
        <div class="summaries">
            <event-time-summary-card :title="'Time didn\'t work'"
                :duration="totalDuration"
                :icon="notWorkingTypeIcon">
            </event-time-summary-card>
        </div>

        <div class="summaries">
            <event-time-summary-card :title="'Untracked'"
                :duration="idlingDuration"
                :icon="idlingIcon">
            </event-time-summary-card>
        </div>

        <div class="summaries">
            <event-time-summary-card :title="'Sleeps & Breaks'"
                :duration="breakDuration"
                :icon="breakIcon">
            </event-time-summary-card>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';

import { EventSummariesDto } from '../../../../core/dtos/event-summaries-dto';
import { EventType } from '../../../../core/enums/event-type.enum';
import { IconUtility } from '../../../../core/utilities/icon-utility/icon-utility';
import EventTimeSummaryCard from '../event-time-summary-card/event-time-summary-card.vue';

class NotWorkingTimeSummaryProp {
    public summaries = prop<EventSummariesDto>({ default: new EventSummariesDto() });
}

@Options({
    components: {
        EventTimeSummaryCard
    }
})
export default class NotWorkingTimeSummary extends Vue.with(NotWorkingTimeSummaryProp) {
    public readonly idlingIcon = IconUtility.getIdlingTypeIcon();
    public readonly breakIcon = IconUtility.getBreakTypeIcon();
    public readonly notWorkingTypeIcon = IconUtility.getNotWorkingTypeIcon();

    get totalDuration(): number {
        return this.getDuration([EventType.Idling, EventType.Break]);
    }

    get idlingDuration(): number {
        return this.getDuration([EventType.Idling]);
    }

    get breakDuration(): number {
        return this.getDuration([EventType.Break]);
    }

    private getDuration(types: EventType[]): number {
        const events = this.summaries.duration.filter(_ => types.includes(_.eventType));

        return events.map(_ => _.duration).reduce((total, _) => total + _, 0);
    }
}
</script>

<style lang="scss" scoped>
.not-working-time-summary-container {
    @import '../../../../styles/presets.scss';

    @include flex-column(flex-start, space-between);

    .summaries {
        width: 100%;
        height: 33%;
    }
}
</style>
