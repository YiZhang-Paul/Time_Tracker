<template>
    <div class="interruption-item-list-container">
        <span v-if="totalUnresolved || totalResolved" class="list-counter">
            <span>{{ totalUnresolved }} unresolved</span>
            <span> / </span>
            <span>{{ totalResolved }} resolved</span>
        </span>

        <div class="card-wrapper" v-if="interruptionStore.activeSummary">
            <interruption-item-card class="interruption-item-card"
                :class="getItemCardClasses(interruptionStore.activeSummary)"
                :item="interruptionStore.activeSummary"
                :isSelected="selectedItemId === interruptionStore.activeSummary.id"
                :isActive="true"
                @click="$emit('select', interruptionStore.activeSummary)">
            </interruption-item-card>
        </div>

        <overlay-scrollbar-panel class="card-wrappers">
            <div class="card-wrapper" v-for="(item, index) of items" :key="index">
                <interruption-item-card class="interruption-item-card"
                    :class="getItemCardClasses(item)"
                    :item="item"
                    :isSelected="selectedItemId === item.id"
                    :isResolved="!showUnresolved"
                    :isActive="isActive(item)"
                    @click="$emit('select', item)">
                </interruption-item-card>
            </div>
        </overlay-scrollbar-panel>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { mapStores } from 'pinia';

import { useEventStore } from '../../../../stores/event/event.store';
import { useInterruptionStore } from '../../../../stores/interruption/interruption.store';
import { ItemSummariesDto } from '../../../../core/dtos/item-summaries-dto';
import { InterruptionItemSummaryDto } from '../../../../core/dtos/interruption-item-summary-dto';
import { ClassConfigs } from '../../../../core/models/generic/class-configs';
import { EventType } from '../../../../core/enums/event-type.enum';
import OverlayScrollbarPanel from '../../../../shared/panels/overlay-scrollbar-panel/overlay-scrollbar-panel.vue';

import InterruptionItemCard from './interruption-item-card/interruption-item-card.vue';

class InterruptionItemListProp {
    public searchText = prop<string>({ default: '' });
}

@Options({
    components: {
        OverlayScrollbarPanel,
        InterruptionItemCard
    },
    watch: {
        items(): void {
            setTimeout(() => this.animateItemCards());
        }
    },
    emits: [
        'select'
    ],
    computed: {
        ...mapStores(useEventStore, useInterruptionStore)
    }
})
/* istanbul ignore next */
export default class InterruptionItemList extends Vue.with(InterruptionItemListProp) {
    public showUnresolved = true;
    private eventStore!: ReturnType<typeof useEventStore>;
    private interruptionStore!: ReturnType<typeof useInterruptionStore>;
    private animated = new Set<number>();

    get totalUnresolved(): number {
        return this.filteredSummaries.unresolved.length;
    }

    get totalResolved(): number {
        return this.filteredSummaries.resolved.length;
    }

    get items(): InterruptionItemSummaryDto[] {
        if (!this.showUnresolved) {
            return this.filteredSummaries.resolved;
        }

        const { unresolved } = this.filteredSummaries;
        const active = this.interruptionStore.activeSummary;

        return active ? unresolved.filter(_ => _.id !== active.id) : unresolved;
    }

    get filteredSummaries(): ItemSummariesDto<InterruptionItemSummaryDto> {
        return this.interruptionStore.filteredSummaries(this.searchText);
    }

    get selectedItemId(): number {
        return this.interruptionStore.editingItem?.id ?? -1;
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
        return this.eventStore.isActiveWorkItem(EventType.Interruption, item.id);
    }

    private animateItemCards(): void {
        let total = 0;

        if (this.interruptionStore.activeSummary) {
            const { id } = this.interruptionStore.activeSummary;
            this.animated.delete(id);
            setTimeout(() => this.animated.add(id));
        }

        for (const { id } of this.items) {
            if (!this.animated.has(id)) {
                setTimeout(() => this.animated.add(id), 200 + total++ * 25);
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

    .list-counter {
        margin-bottom: 0.25rem;
        color: var(--font-colors-4-00);

        & > span:first-of-type {
            color: var(--context-colors-suggestion-0-00);
        }

        & > span:last-of-type {
            color: var(--context-colors-success-0-00);
        }
    }

    .card-wrappers {
        @include flex-column();
        width: 100%;
        height: 100%;
        direction: rtl;
    }

    .card-wrapper {
        box-sizing: border-box;
        margin-bottom: 1rem;
        padding: 0.5vh 1vh 0.5vh 0;
        width: 100%;
        min-height: 5.25rem;
        overflow-x: hidden;
        scroll-snap-align: start;
        direction: rtl;

        .interruption-item-card {
            margin-right: 110%;
            transition: margin-right 0.3s, color 0.3s;
            @include animate-opacity(0, 1, 0.3s);
            direction: ltr;

            &.animated {
                margin-right: 17.5%;
            }

            &.animated.selected {
                margin-right: 0;
            }
        }
    }
}
</style>
