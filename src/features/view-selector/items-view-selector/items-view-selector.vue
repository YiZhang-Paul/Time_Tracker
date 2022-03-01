<template>
    <div class="items-view-selector-container" :class="{ hovered: isHovered }" @mouseover="isHovered = true">
        <div class="label">items</div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

import FlatButton from '../../../shared/buttons/flat-button/flat-button.vue';

@Options({
    components: {
        FlatButton
    }
})
export default class ItemsViewSelector extends Vue {
    public isHovered = false;
}
</script>

<style lang="scss" scoped>
.items-view-selector-container {
    @import '../../../styles/presets.scss';
    @import '../../../styles/animations.scss';

    @include flex-column(center, center);
    position: relative;
    overflow: hidden;
    color: var(--font-colors-1-00);

    &:hover {
        cursor: pointer;

        .label {
            display: none;
        }
    }

    .label {
        @include flex-row(center, center);
        position: absolute;
        right: 0;
        bottom: 0;
        padding: 0.5vh 1.75vh;
        border-top-left-radius: 10px;
        box-shadow: 0 0 5px 2px var(--context-colors-info-6-03);
        background-color: var(--context-colors-info-7-00);
        font-size: var(--font-sizes-300);
        @include animate-opacity(0, 1, 0.4s, 1s);
    }

    &.hovered {

        .label {
            animation-delay: 0.3s;
        }
    }
}
</style>
