<template>
    <div class="time-display-container">
        <span>{{ time }}</span>

        <div class="date" :style="{ 'background-color': environmentColor }">
            <span>{{ month }} {{ current.getDate() }}</span>
            <sup>{{ dateSuffix }}</sup>
            <span>, {{ current.getFullYear() }}</span>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';

import { TimeUtility } from '../../core/utilities/time-utility/time-utility';

export default class TimeDisplay extends Vue {
    private current = new Date();

    get time(): string {
        return TimeUtility.getTimeString(this.current);
    }

    get month(): string {
        return TimeUtility.getShortMonthString(this.current);
    }

    get dateSuffix(): string {
        return TimeUtility.getDateSuffix(this.current.getDate());
    }

    get environmentColor(): string {
        return process.env.VUE_APP_ENV_COLOR;
    }

    public created(): void {
        this.updateDateTime();
    }

    private updateDateTime(): void {
        this.current = new Date();
        setTimeout(() => this.updateDateTime(), 1000);
    }
}
</script>

<style lang="scss" scoped>
.time-display-container {
    @import '../../styles/presets.scss';

    @include flex-row(center, center);
    color: var(--font-colors-0-00);

    .date {
        @include flex-row(center, center);
        box-sizing: border-box;
        margin-left: 8px;
        padding: 4px 12px;
        border-radius: 15px;
        background-color: var(--primary-colors-8-00);
        box-shadow: 0 0 6px 1px rgba(0, 0, 0, 0.35);
        font-size: var(--font-sizes-200);
    }
}
</style>
