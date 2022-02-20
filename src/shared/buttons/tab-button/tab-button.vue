<template>
    <button class="tab-button-container" :class="{ active: isActive, disabled: isDisabled }">
        <div class="content"><slot></slot></div>

        <div v-if="badgeCount >= 0" class="badge">
            <span>{{ badgeCount }}</span>
        </div>
    </button>
</template>

<script lang="ts">
import { Vue, prop } from 'vue-class-component';

class TabButtonProp {
    public badgeCount = prop<number>({ default: -1 });
    public isActive = prop<boolean>({ default: false });
    public isDisabled = prop<boolean>({ default: false });
}

export default class TabButton extends Vue.with(TabButtonProp) { }
</script>

<style lang="scss" scoped>
.tab-button-container {
    @import '../../../styles/presets.scss';

    $content-dimension: 2.75vh;

    @include flex-row(center, center);
    padding: 0.75vh 1vh;
    border: none;
    outline: none;
    border-radius: 5px;
    box-shadow: 0 0 6px 1px rgba(0, 0, 0, 0.35);
    background-color: var(--primary-colors-8-00);
    transition: all 0.2s;

    &:hover, &.active {
        cursor: pointer;
        background-color: var(--primary-colors-7-00);
    }

    &.disabled {
        pointer-events: none;
        background-color: var(--context-colors-disabled-2-00);

        .content, .badge {
            background-color: var(--primary-colors-7-00);
            color: var(--font-colors-5-00);
        }
    }

    .content, .badge {
        @include flex-row(center, center);
        height: $content-dimension;
        background-color: var(--primary-colors-4-00);
        color: var(--font-colors-2-00);
        transition: all 0.3s;
    }

    .content {
        padding: 0 0.75vh;
        border-radius: 3px;
    }

    .badge {
        margin-left: 8px;
        width: $content-dimension;
        border-radius: 50%;
    }
}
</style>
