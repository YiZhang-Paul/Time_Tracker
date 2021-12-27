<template>
    <div class="time-display-container">
        <span>{{ time }}</span>

        <div class="date">
            <span>{{ date }}</span>
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

    get date(): string {
        return TimeUtility.getDateString(this.current);
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
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--font-colors-0-00);

    .date {
        box-sizing: border-box;
        margin-left: 8px;
        padding: 5px 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 15px;
        background-color: var(--primary-colors-9-00);
        box-shadow: 0 0 6px 1px rgba(0, 0, 0, 0.35);
        font-size: var(--font-sizes-200);
    }
}
</style>
