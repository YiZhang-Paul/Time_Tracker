<template>
    <category-summary-display v-if="duration >= 0" :title="title" :icon="icon">
        <span>{{ durationText }}</span>
    </category-summary-display>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';

import { IconConfig } from '../../../../core/models/generic/icon-config';
import { TimeUtility } from '../../../../core/utilities/time-utility/time-utility';
import CategorySummaryDisplay from '../../../../shared/displays/category-summary-display/category-summary-display.vue';

class EventTypeSummaryCardProp {
    public title = prop<string>({ default: '' });
    public duration = prop<number>({ default: -1 });
    public icon = prop<IconConfig>({ default: null });
}

@Options({
    components: {
        CategorySummaryDisplay
    }
})
export default class EventTypeSummaryCard extends Vue.with(EventTypeSummaryCardProp) {
    get durationText(): string {
        if (this.duration && this.duration < TimeUtility.convertTime(1, 'minute', 'millisecond')) {
            return 'less than 1 min';
        }

        return TimeUtility.getDurationString(this.duration, 'standard');
    }
}
</script>
