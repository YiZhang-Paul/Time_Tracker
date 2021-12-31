<template>
    <div class="interruption-item-list-container">
        <div class="card-wrapper" v-for="(item, index) of items" :key="index">
            <interruption-item-card class="interruption-item-card"
                :class="getItemCardClasses(item)"
                :item="item"
                :isActive="activeId === item.id"
                @click="$emit('select', item)">
            </interruption-item-card>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';

import store from '../../../../store';
import { InterruptionItemSummaryDto } from '../../../../core/dtos/interruption-item-summary-dto';
import { ClassConfigs } from '../../../../core/models/generic/class-configs';

import InterruptionItemCard from './interruption-item-card/interruption-item-card.vue';

class InterruptionItemListProp {
    public searchText = prop<string>({ default: '' });
}

@Options({
    components: {
        InterruptionItemCard
    },
    watch: {
        items(): void {
            setTimeout(() => this.animateItemCards());
        }
    },
    emits: [
        'select'
    ]
})
export default class InterruptionItemList extends Vue.with(InterruptionItemListProp) {
    private animated = new Set<number>();

    get items(): InterruptionItemSummaryDto[] {
        const text = this.searchText?.toLowerCase()?.trim() ?? '';

        return store.interruption.getters(store.interruption.getter.Summaries)(text);
    }

    get activeId(): number {
        return store.interruption.getters(store.interruption.getter.EditingItem)?.id ?? -1;
    }

    public mounted(): void {
        this.animateItemCards();
    }

    public getItemCardClasses(item: InterruptionItemSummaryDto): ClassConfigs {
        return {
            animated: this.animated.has(item.id),
            active: this.activeId === item.id
        };
    }

    private animateItemCards(): void {
        const elements = document.querySelectorAll('.interruption-item-card');

        for (let i = 0, j = 0; i < elements.length; ++i) {
            const { id } = this.items[i];

            if (!this.animated.has(id)) {
                setTimeout(() => this.animated.add(id), 200 + j++ * 25);
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.interruption-item-list-container {
    @import '../../../../styles/presets.scss';
    @import '../../../../styles/animations.scss';

    @include flex-column();

    .card-wrapper {
        margin-bottom: 2vh;
        padding: 0.5vh 1vh 0.5vh 0;
        overflow-x: hidden;
        @include animate-opacity(0, 1, 0.3s);
        direction: rtl;
    }

    .interruption-item-card {
        margin-right: 110%;
        transition: margin-right 0.3s;
        direction: ltr;

        &.animated {
            margin-right: 20%;
        }

        &.animated.active {
            margin-right: 0;
        }
    }
}
</style>
