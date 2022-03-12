<template>
    <div class="activity-indicator-container">
        <div v-for="(period, index) in periods"
            class="activity"
            :style="getStyles(period)"
            :key="index">
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, prop } from 'vue-class-component';

import { StyleConfigs } from '../../../core/models/generic/style-configs';
import { Range } from '../../../core/models/generic/range';
import { TimeUtility } from '../../../core/utilities/time-utility/time-utility';

class ActivityIndicatorProp {
    public periods = prop<Range<number>[]>({ default: [] });
    public color = prop<string>({ default: 'var(--primary-colors-1-00)' });
}

export default class ActivityIndicator extends Vue.with(ActivityIndicatorProp) {
    public getStyles({ start, end }: Range<number>): StyleConfigs {
        const dayStart = new Date(start).setHours(0, 0, 0, 0);
        const duration = TimeUtility.convertTime(end - start, 'millisecond', 'day', 4);
        const sinceDayStart = TimeUtility.convertTime(start - dayStart, 'millisecond', 'day', 4);

        return {
            left: `${sinceDayStart * 100}%`,
            width: `${duration * 100}%`,
            'background-color': this.color
        };
    }
}
</script>

<style lang="scss" scoped>
.activity-indicator-container {
    position: relative;
    background-color: var(--primary-colors-10-00);

    .activity {
        position: absolute;
        top: 0;
        min-width: 1px;
        height: 100%;
    }
}
</style>
