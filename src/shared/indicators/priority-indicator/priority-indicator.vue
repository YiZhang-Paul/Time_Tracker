<template>
    <div class="priority-indicator-container">
        <bullet class="icon" v-for="i in icons" :key="i" :style="{ color }" />
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { Bullet } from 'mdue';

import { Priority } from '../../../core/enums/priority.enum';

class PriorityIndicatorProp {
    public priority = prop<Priority>({ default: Priority.Low });
}

@Options({
    components: {
        Bullet
    }
})
export default class PriorityIndicator extends Vue.with(PriorityIndicatorProp) {
    get icons(): number {
        if (this.priority === Priority.Low) {
            return 1;
        }

        return this.priority === Priority.Medium ? 2 : 3;
    }

    get color(): string {
        let priority = 'low';

        if (this.priority !== Priority.Low) {
            priority = this.priority === Priority.Medium ? 'medium' : 'high';
        }

        return `var(--priority-colors-${priority}-0-00)`;
    }
}
</script>

<style lang="scss" scoped>
.priority-indicator-container {
    @import '../../../styles/presets.scss';

    @include flex-row(center, center);

    .icon {
        margin: 0 -0.75vh;
    }
}
</style>
