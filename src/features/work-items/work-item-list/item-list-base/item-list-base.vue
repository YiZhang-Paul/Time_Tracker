<template>
    <div v-if="summaries && type" class="item-list-base-container" :class="{ 'right-to-left': isRightToLeft }">
        <div v-if="totalUnresolved || totalResolved" class="list-tabs">
            <tab-button class="unresolved-tab-button"
                :isActive="showUnresolved"
                :badgeCount="totalUnresolved"
                @click="selectUnresolved()">

                Unresolved
            </tab-button>

            <tab-button class="resolved-tab-button"
                :isActive="!showUnresolved"
                :isDisabled="!totalResolved"
                :badgeCount="totalResolved"
                @click="selectResolved()">

                Done
            </tab-button>
        </div>

        <div class="card-wrapper" v-if="activeSummary">
            <interruption-item-card v-if="type === eventType.Interruption"
                class="item-card"
                :class="getItemCardClasses(activeSummary)"
                :item="activeSummary"
                :isSelected="selectedId === activeSummary.id"
                :isActive="true"
                @click="$emit('select', activeSummary)">
            </interruption-item-card>

            <task-item-card v-if="type === eventType.Task"
                class="item-card"
                :class="getItemCardClasses(activeSummary)"
                :item="activeSummary"
                :isSelected="selectedId === activeSummary.id"
                :isActive="true"
                @click="$emit('select', activeSummary)">
            </task-item-card>
        </div>

        <overlay-scrollbar-panel class="card-wrappers">
            <div class="card-wrapper" v-for="(item, index) in items" :key="index">
                <interruption-item-card v-if="type === eventType.Interruption"
                    class="item-card"
                    :class="getItemCardClasses(item)"
                    :item="item"
                    :isSelected="selectedId === item.id"
                    :isResolved="!showUnresolved"
                    :isActive="false"
                    @click="$emit('select', item)">
                </interruption-item-card>

                <task-item-card v-if="type === eventType.Task"
                    class="item-card"
                    :class="getItemCardClasses(item)"
                    :item="item"
                    :isSelected="selectedId === item.id"
                    :isResolved="!showUnresolved"
                    :isActive="false"
                    @click="$emit('select', item)">
                </task-item-card>
            </div>
        </overlay-scrollbar-panel>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';

import { ItemSummariesDto } from '../../../../core/dtos/item-summaries-dto';
import { InterruptionItemSummaryDto } from '../../../../core/dtos/interruption-item-summary-dto';
import { TaskItemSummaryDto } from '../../../../core/dtos/task-item-summary-dto';
import { ClassConfigs } from '../../../../core/models/generic/class-configs';
import { EventType } from '../../../../core/enums/event-type.enum';
import TabButton from '../../../../shared/buttons/tab-button/tab-button.vue';
import OverlayScrollbarPanel from '../../../../shared/panels/overlay-scrollbar-panel/overlay-scrollbar-panel.vue';

import InterruptionItemCard from './interruption-item-card/interruption-item-card.vue';
import TaskItemCard from './task-item-card/task-item-card.vue';

type ItemSummary = InterruptionItemSummaryDto & TaskItemSummaryDto;

class ItemListBaseProp {
    public summaries = prop<ItemSummariesDto<ItemSummary>>({ default: null });
    public activeSummary = prop<ItemSummary>({ default: null });
    public selectedId = prop<number>({ default: -1 });
    public type = prop<EventType>({ default: null });
    public isRightToLeft = prop<boolean>({ default: false });
}

@Options({
    components: {
        TabButton,
        OverlayScrollbarPanel,
        InterruptionItemCard,
        TaskItemCard
    },
    watch: {
        items(): void {
            if (!this.showUnresolved && !this.totalResolved) {
                this.showUnresolved = true;
            }

            setTimeout(() => this.animateItemCards());
        }
    },
    emits: [
        'select'
    ]
})
export default class ItemListBase extends Vue.with(ItemListBaseProp) {
    public readonly eventType = EventType;
    public showUnresolved = true;
    private animateTimeouts: number[] = [];
    private animated = new Set<number>();

    get totalUnresolved(): number {
        return this.summaries.unresolved.length;
    }

    get totalResolved(): number {
        return this.summaries.resolved.length;
    }

    get items(): ItemSummary[] {
        if (!this.summaries) {
            return [];
        }

        if (!this.showUnresolved) {
            return this.summaries.resolved;
        }

        const { unresolved } = this.summaries;
        const active = this.activeSummary;

        return active ? unresolved.filter(_ => _.id !== active.id) : unresolved;
    }

    public mounted(): void {
        this.animateItemCards();
    }

    public selectUnresolved(): void {
        if (!this.showUnresolved) {
            this.resetAnimation();
            setTimeout(() => this.showUnresolved = true, 150);
        }
    }

    public selectResolved(): void {
        if (this.showUnresolved) {
            this.resetAnimation();
            setTimeout(() => this.showUnresolved = false, 150);
        }
    }

    public getItemCardClasses(item: ItemSummary): ClassConfigs {
        return {
            animated: this.animated.has(item.id),
            selected: this.selectedId === item.id
        };
    }

    private resetAnimation(): void {
        this.animated.clear();

        if (this.activeSummary) {
            this.animated.add(this.activeSummary.id);
        }

        while (this.animateTimeouts.length) {
            clearTimeout(this.animateTimeouts.pop());
        }
    }

    private animateItemCards(): void {
        let total = 0;

        if (this.activeSummary && !this.animated.has(this.activeSummary.id)) {
            setTimeout(() => this.animated.add(this.activeSummary.id));
        }

        for (const { id } of this.items) {
            if (!this.animated.has(id)) {
                const timeout = setTimeout(() => this.animated.add(id), 200 + total++ * 25);
                this.animateTimeouts.push(timeout);
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.item-list-base-container {
    @import '../../../../styles/presets.scss';
    @import '../../../../styles/animations.scss';

    $tabs-height: 5vh;

    @include flex-column(flex-end);

    &:not(.right-to-left) .card-wrapper {
        padding: 0.5vh 0 0.5vh 1vh;

        .item-card {
            margin-left: 110%;
            transition: margin-left 0.3s, color 0.3s;

            &.animated {
                margin-left: 17.5%;
            }

            &.animated.selected {
                margin-left: 5%;
            }
        }
    }

    &.right-to-left {
        align-items: initial;

        .card-wrappers {
            direction: rtl;
        }

        .card-wrapper {
            padding: 0.5vh 1vh 0.5vh 0;
            direction: rtl;

            .item-card {
                margin-right: 110%;
                transition: margin-right 0.3s, color 0.3s;
                direction: ltr;

                &.animated {
                    margin-right: 17.5%;
                }

                &.animated.selected {
                    margin-right: 5%;
                }
            }
        }
    }

    .list-tabs {
        @include flex-row(center);
        min-height: $tabs-height;
        height: $tabs-height;

        .unresolved-tab-button {
            margin-right: 0.75vh;
        }

        .unresolved-tab-button.active:not(.disabled) ::v-deep(.content) {
            color: var(--font-colors-9-00);
            background-color: var(--context-colors-suggestion-0-00);
            box-shadow: 0 0 6px 2px var(--context-colors-suggestion-1-03);
        }

        .resolved-tab-button.active:not(.disabled) ::v-deep(.content) {
            color: var(--font-colors-9-00);
            background-color: var(--context-colors-success-0-00);
            box-shadow: 0 0 6px 2px var(--context-colors-success-1-03);
        }
    }

    .card-wrappers {
        @include flex-column();
        width: 100%;
        height: calc(100% - #{$tabs-height});
    }

    .card-wrapper {
        @include flex-row(center);
        box-sizing: border-box;
        width: 100%;
        min-height: 6rem;
        height: 6rem;
        overflow-x: hidden;
        scroll-snap-align: start;

        .item-card {
            @include animate-property(opacity, 0, 1, 0.3s);
        }
    }
}
</style>
