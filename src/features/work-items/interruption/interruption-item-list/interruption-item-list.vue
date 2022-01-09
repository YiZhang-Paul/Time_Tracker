<template>
    <div class="interruption-item-list-container">
        <div class="card-wrapper" v-for="(item, index) of items" :key="index">
            <interruption-item-card class="interruption-item-card"
                :class="getItemCardClasses(item)"
                :item="item"
                :isSelected="selectedItemId === item.id"
                :isActive="isActive(item)"
                @click="$emit('select', item)">
            </interruption-item-card>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';

import { getStore } from '../../../../store';
import { InterruptionItemSummaryDto } from '../../../../core/dtos/interruption-item-summary-dto';
import { ClassConfigs } from '../../../../core/models/generic/class-configs';
import { EventType } from '../../../../core/enums/event-type.enum';

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
    public store = getStore();
    private animated = new Set<number>();

    get items(): InterruptionItemSummaryDto[] {
        const text = this.searchText?.toLowerCase()?.trim() ?? '';
        const items = this.store.interruption.getters(this.store.interruption.getter.Summaries)(text);
        const active = this.store.interruption.getters(this.store.interruption.getter.ActiveSummary);

        if (!active) {
            return items;
        }

        return [active, ...items.filter(_ => _.id !== active.id)];
    }

    get selectedItemId(): number {
        return this.store.interruption.getters(this.store.interruption.getter.EditingItem)?.id ?? -1;
    }

    public mounted(): void {
        this.animateItemCards();
    }

    public getItemCardClasses(item: InterruptionItemSummaryDto): ClassConfigs {
        return {
            animated: this.animated.has(item.id),
            selected: this.selectedItemId === item.id
        };
    }

    public isActive(item: InterruptionItemSummaryDto): boolean {
        const key = this.store.event.getter.IsActiveWorkItem;

        return this.store.event.getters(key)(EventType.Interruption, item.id);
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
        transition: margin-right 0.3s, color 0.3s;
        direction: ltr;

        &.animated {
            margin-right: 20%;
        }

        &.animated.selected {
            margin-right: 0;
        }
    }
}
</style>
