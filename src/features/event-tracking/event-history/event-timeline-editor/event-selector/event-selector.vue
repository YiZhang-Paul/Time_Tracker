<template>
    <div class="event-selector-container" ref="container">
        <div v-if="!showSelector" class="selected" :class="{ active: canOpenSelector }" @click="openSelector()">
            <component v-if="name"
                class="icon"
                :is="icon.component"
                :style="{ color: icon.color }">
            </component>

            <crosshairs-question v-if="!name" class="icon" :style="{ color: icon.color }" />
            <span>{{ name ? name : 'nothing selected' }}</span>
            <menu-down v-if="!isReadonly" class="dropdown-arrow" />
        </div>

        <div v-if="showSelector" class="selector">
            <search-box class="search-box"
                :autoFocus="true"
                :useCustomStyle="true"
                @search="onSearch($event)">
            </search-box>

            <overlay-scrollbar-panel v-if="isSearchCompleted || searchResult.length" class="results">
                <div v-for="(result, index) in searchResult"
                    class="result"
                    :key="index"
                    @click="onResultSelect(result)">

                    <div class="status" :class="{ resolved: result.isResolved, deleted: result.isDeleted }">
                        <span v-if="result.isDeleted">deleted</span>
                        <span v-if="!result.isDeleted">{{ result.isResolved ? 'done' : 'ongoing' }}</span>
                    </div>

                    <span class="name">{{ result.name }}</span>
                </div>

                <div v-if="!searchResult.length" class="result placeholder">no results.</div>
            </overlay-scrollbar-panel>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { CrosshairsQuestion, MenuDown } from 'mdue';

import { types } from '../../../../../core/ioc/types';
import { container } from '../../../../../core/ioc/container';
import { InterruptionItemSummaryDto } from '../../../../../core/dtos/interruption-item-summary-dto';
import { TaskItemSummaryDto } from '../../../../../core/dtos/task-item-summary-dto';
import { IconConfig } from '../../../../../core/models/generic/icon-config';
import { EventSelection } from '../../../../../core/models/event/event-selection';
import { EventSearchResult } from '../../../../../core/models/event/event-search-result';
import { EventType } from '../../../../../core/enums/event-type.enum';
import { DomUtility } from '../../../../../core/utilities/dom-utility/dom-utility';
import { IconUtility } from '../../../../../core/utilities/icon-utility/icon-utility';
import { InterruptionItemHttpService } from '../../../../../core/services/http/interruption-item-http/interruption-item-http.service';
import { TaskItemHttpService } from '../../../../../core/services/http/task-item-http/task-item-http.service';
import SearchBox from '../../../../../shared/inputs/search-box/search-box.vue';
import OverlayScrollbarPanel from '../../../../../shared/panels/overlay-scrollbar-panel/overlay-scrollbar-panel.vue';

class EventSelectorProp {
    public selected = prop<EventSelection>({ default: null });
}

@Options({
    components: {
        CrosshairsQuestion,
        MenuDown,
        SearchBox,
        OverlayScrollbarPanel
    },
    watch: {
        selected(): void {
            if (this.searchResult.length && this.searchResult[0].eventType !== this.selected.eventType) {
                this.searchResult = [];
            }
        }
    },
    emits: [
        'select'
    ]
})
export default class EventSelector extends Vue.with(EventSelectorProp) {
    public showSelector = false;
    public isSearchCompleted = false;
    public searchResult: EventSearchResult[] = [];
    private readonly interruptionItemHttpService = container.get<InterruptionItemHttpService>(types.InterruptionItemHttpService);
    private readonly taskItemHttpService = container.get<TaskItemHttpService>(types.TaskItemHttpService);

    private readonly icons = {
        [EventType.Idling]: IconUtility.getIdlingTypeIcon(),
        [EventType.Break]: IconUtility.getBreakTypeIcon(),
        [EventType.Interruption]: IconUtility.getInterruptionTypeIcon(),
        [EventType.Task]: IconUtility.getTaskTypeIcon()
    };

    get icon(): IconConfig {
        return this.icons[this.selected.eventType];
    }

    get canOpenSelector(): boolean {
        return !this.isReadonly && !this.showSelector;
    }

    get isReadonly(): boolean {
        const { eventType } = this.selected;

        return eventType === EventType.Idling || eventType === EventType.Break;
    }

    get name(): string {
        if (!this.isReadonly) {
            return this.selected.name;
        }

        return this.selected.eventType === EventType.Idling ? 'Untracked' : 'Sleep & Break';
    }

    public mounted(): void {
        document.addEventListener('click', this.checkClickOutside);
    }

    public beforeUnmount(): void {
        document.removeEventListener('click', this.checkClickOutside);
    }

    public openSelector(): void {
        if (this.canOpenSelector) {
            this.showSelector = true;
        }
    }

    public async onSearch(searchText: string): Promise<void> {
        if (!searchText?.trim()) {
            return;
        }

        const { eventType } = this.selected;
        let result: (InterruptionItemSummaryDto | TaskItemSummaryDto)[] = [];

        if (eventType === EventType.Interruption) {
            result = await this.interruptionItemHttpService.searchSummaries(searchText);
        }
        else if (eventType === EventType.Task) {
            result = await this.taskItemHttpService.searchSummaries(searchText);
        }

        this.searchResult = result.map(_ => new EventSearchResult(_.id, eventType, _.name, _.isDeleted, _.isResolved));
        this.isSearchCompleted = true;
    }

    public onResultSelect(event: EventSelection): void {
        this.$emit('select', event);
        this.closeSelector();
    }

    private checkClickOutside(event: Event): void {
        if (DomUtility.isClickOutside(event, this.$refs.container as HTMLElement)) {
            this.closeSelector();
        }
    }

    private closeSelector(): void {
        this.showSelector = false;
        this.isSearchCompleted = false;
    }
}
</script>

<style lang="scss" scoped>
.event-selector-container {
    @import '../../../../../styles/presets.scss';
    @import '../../../../../styles/animations.scss';

    $selector-width: 15vw;

    @include flex-row(center);

    .selected, .selector {
        padding: 3px 10px;
    }

    .selected {
        @include flex-row(center);
        transition: color 0.3s;

        &.active:hover {
            cursor: pointer;
            color: var(--context-colors-info-0-00);
        }

        .icon {
            margin-right: 0.5vh;
            font-size: var(--font-sizes-400);
            transition: color 0.3s;
        }

        span {
            max-width: $selector-width;
            @include line-overflow();
        }

        .dropdown-arrow {
            margin-left: 0.75vh;
            font-size: var(--font-sizes-400);
        }
    }

    .selector {
        $font-size: var(--font-sizes-300);

        @include flex-column(center);
        position: relative;
        @include animate-property(width, 7.5vw, $selector-width, 0.3s);

        .search-box {
            align-self: flex-start;
            font-size: $font-size;

            &::v-deep(input) {
                font-size: $font-size;
            }
        }

        .results {
            $border-radius: 4px;

            position: absolute;
            top: calc(100% + 0.75vh);
            width: 95%;
            max-height: 30vh;
            border-radius: $border-radius;
            box-shadow: 0 0 4px 1px rgba(0, 0, 0, 0.2);
            background-color: var(--primary-colors-6-00);
            font-size: $font-size;
            @include animate-property(opacity, 0, 1, 0.2s, 0.4s);

            .result {
                $gap: 8px;

                @include flex-row(center);
                padding: 0.75vh;
                scroll-snap-align: start;
                transition: background-color 0.3s;
                @include animate-property(opacity, 0, 1, 0.15s);

                &:not(.placeholder):hover {
                    cursor: pointer;
                    background-color: var(--context-colors-info-4-00);
                }

                &:first-of-type {
                    border-top-left-radius: $border-radius;
                    border-top-right-radius: $border-radius;
                }

                &:last-of-type {
                    border-bottom-left-radius: $border-radius;
                    border-bottom-right-radius: $border-radius;
                }

                .status {
                    @include flex-row(center, center);
                    margin-right: $gap;
                    padding: 1px 0;
                    width: calc(#{$selector-width} / 5);
                    border-radius: 3px;
                    box-shadow: 0 0 4px 1px var(--context-colors-suggestion-1-03);
                    background-color: var(--context-colors-suggestion-1-00);
                    color: var(--font-colors-0-00);
                    font-size: var(--font-sizes-200);

                    &.resolved {
                        box-shadow: 0 0 4px 1px var(--context-colors-success-1-03);
                        background-color: var(--context-colors-success-1-00);
                    }

                    &.deleted {
                        box-shadow: 0 0 4px 1px var(--context-colors-disabled-1-03);
                        background-color: var(--context-colors-disabled-0-00);
                    }
                }

                .name {
                    width: calc(#{$selector-width} * 0.8 - #{$gap});
                    @include line-overflow();
                }
            }
        }
    }
}
</style>
