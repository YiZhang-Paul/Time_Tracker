<template>
    <div class="view-selector-container">
        <div class="column">
            <items-view-selector class="selector" @click="openWorkItems()"></items-view-selector>
        </div>

        <div class="column">
            <div class="selector placeholder"></div>
            <histories-view-selector class="selector histories" @click="openHistories()"></histories-view-selector>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

import ItemsViewSelector from './items-view-selector/items-view-selector.vue';
import HistoriesViewSelector from './histories-view-selector/histories-view-selector.vue';

@Options({
    components: {
        ItemsViewSelector,
        HistoriesViewSelector
    }
})
export default class ViewSelector extends Vue {
    public openWorkItems(): void {
        this.$router.push('/works');
    }

    public openHistories(): void {
        this.$router.push('/histories');
    }
}
</script>

<style lang="scss" scoped>
.view-selector-container {
    @import '../../styles/presets.scss';

    $gap: 3.5vh;

    @include flex-row(flex-start, center);
    box-sizing: border-box;
    z-index: 999;
    padding-top: $gap;
    background-color: var(--primary-colors-10-00);

    .column {
        @include flex-column(center, space-between);
        width: 20%;
        height: 75%;

        &:not(:first-of-type) {
            margin-left: $gap;
        }

        .selector {
            width: 100%;
            height: 100%;
            border-radius: 10px;
            background-color: var(--primary-colors-9-00);
            box-shadow: 0 0 5px 2px rgba(0, 0, 0, 0.3);
        }

        .placeholder, .histories {
            height: calc(50% - #{$gap} / 2);
        }
    }
}
</style>
