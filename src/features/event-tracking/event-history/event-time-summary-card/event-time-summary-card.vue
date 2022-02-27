<template>
    <div v-if="icon && duration >= 0" class="event-time-summary-card-container">
        <div class="icon">
            <component :is="icon.component" :style="{ color: icon.color }"></component>
        </div>

        <div class="content">
            <span class="title">{{ title }}</span>
            <span class="duration">{{ durationText }}</span>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, prop } from 'vue-class-component';

import { IconConfig } from '../../../../core/models/generic/icon-config';
import { TimeUtility } from '../../../../core/utilities/time-utility/time-utility';

class EventTimeSummaryCardProp {
    public title = prop<string>({ default: '' });
    public duration = prop<number>({ default: -1 });
    public icon = prop<IconConfig>({ default: null });
}

export default class EventTimeSummaryCard extends Vue.with(EventTimeSummaryCardProp) {
    get durationText(): string {
        if (this.duration && this.duration < 60 * 1000) {
            return 'less than 1 min';
        }

        return TimeUtility.getDurationString(this.duration, 'standard');
    }
}
</script>

<style lang="scss" scoped>
.event-time-summary-card-container {
    @import '../../../../styles/presets.scss';

    @include flex-row(center);

    .icon {
        @include flex-row(center, center);
        width: 7vh;
        height: 7vh;
        border-radius: 10px;
        box-shadow: 0 0 5px 1px rgba(0, 0, 0, 0.35);
        background-color: var(--context-colors-info-8-00);
        font-size: var(--font-sizes-750);
    }

    .content {
        @include flex-column(flex-start, space-between);
        margin-left: 2vh;
        font-size: var(--font-sizes-500);

        .title {
            color: var(--font-colors-0-00);
        }

        .duration {
            margin-top: 6px;
        }
    }
}
</style>
