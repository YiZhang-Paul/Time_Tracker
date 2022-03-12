<template>
    <div class="event-history-container">
        <div class="header">
            <div class="date-wrapper">
                <date-selector v-model="day" @update:modelValue="onDaySelect()"></date-selector>
            </div>

            <div class="actions-wrapper">
                <div class="actions-left">
                    <tab-group v-model="tabOptions" class="tab-group"></tab-group>
                    <filter-group v-if="showRankViewActions" class="filter-group" v-model="filterOptions"></filter-group>
                </div>

                <span v-if="!showTimeline" class="item-count">
                    {{ workingDurations.length }} item{{ workingDurations.length > 1 ? 's' : '' }}
                </span>

                <div class="actions-right">
                    <icon-button v-if="showRankViewActions"
                        class="action-button"
                        :tooltip="'export'"
                        @click="downloadTimesheets()">

                        <export-variant />
                    </icon-button>

                    <icon-button class="action-button" @click="onDaySelect()" :tooltip="'refresh'">
                        <refresh />
                    </icon-button>
                </div>
            </div>
        </div>

        <div class="separator"></div>

        <div class="content">
            <div class="working-time-breakdown">
                <working-time-summary class="time-summary" :summaries="summaries"></working-time-summary>
            </div>

            <template v-if="showTimeline">
                <div v-if="!summaries.timeline.length" class="event-summaries-placeholder">no data available.</div>

                <overlay-scrollbar-panel v-if="summaries.timeline.length" class="event-summaries">
                    <event-timeline-summary-card v-for="(timeline, index) in summaries.timeline"
                        class="event-summary-card"
                        :style="{ 'z-index': summaries.timeline.length - index }"
                        :current="timeline"
                        :next="index === summaries.timeline.length - 1 ? null : summaries.timeline[index + 1]"
                        :key="index"
                        @update="onTimeRangeUpdate($event)">
                    </event-timeline-summary-card>
                </overlay-scrollbar-panel>
            </template>

            <template v-if="!showTimeline">
                <div v-if="!workingDurations.length" class="event-summaries-placeholder">no data available.</div>

                <overlay-scrollbar-panel v-if="workingDurations.length" class="event-summaries">
                    <event-duration-summary-card v-for="(duration, index) in workingDurations"
                        class="event-summary-card"
                        :style="{ 'z-index': workingDurations.length - index }"
                        :summary="duration"
                        :rank="index + 1"
                        :key="index">
                    </event-duration-summary-card>
                </overlay-scrollbar-panel>
            </template>

            <div class="not-working-time-breakdown">
                <not-working-time-summary class="time-summary" :summaries="summaries"></not-working-time-summary>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { markRaw } from '@vue/reactivity';
import { Options, Vue } from 'vue-class-component';
import { mapStores } from 'pinia';
import { ChartTimelineVariant, ExportVariant, Refresh, TrophyAward } from 'mdue';

import { useEventStore } from '../../../stores/event/event.store';
import { types } from '../../../core/ioc/types';
import { container } from '../../../core/ioc/container';
import { EventDurationDto } from '../../../core/dtos/event-duration-dto';
import { EventSummariesDto } from '../../../core/dtos/event-summaries-dto';
import { IconConfig } from '../../../core/models/generic/icon-config';
import { ActionGroupOption } from '../../../core/models/options/action-group-option';
import { EventTimelineEditorOption } from '../../../core/models/options/event-timeline-editor-option';
import { EventType } from '../../../core/enums/event-type.enum';
import { EventHttpService } from '../../../core/services/http/event-http/event-http.service';
import { IconUtility } from '../../../core/utilities/icon-utility/icon-utility';
import IconButton from '../../../shared/buttons/icon-button/icon-button.vue';
import DateSelector from '../../../shared/inputs/date-selector/date-selector.vue';
import TabGroup from '../../../shared/inputs/tab-group/tab-group.vue';
import FilterGroup from '../../../shared/inputs/filter-group/filter-group.vue';
import OverlayScrollbarPanel from '../../../shared/panels/overlay-scrollbar-panel/overlay-scrollbar-panel.vue';

import EventTimelineSummaryCard from './event-timeline-summary-card/event-timeline-summary-card.vue';
import EventDurationSummaryCard from './event-duration-summary-card/event-duration-summary-card.vue';
import WorkingTimeSummary from './working-time-summary/working-time-summary.vue';
import NotWorkingTimeSummary from './not-working-time-summary/not-working-time-summary.vue';

@Options({
    components: {
        ExportVariant,
        Refresh,
        EventTimelineSummaryCard,
        EventDurationSummaryCard,
        WorkingTimeSummary,
        NotWorkingTimeSummary,
        IconButton,
        DateSelector,
        TabGroup,
        FilterGroup,
        OverlayScrollbarPanel
    },
    computed: {
        ...mapStores(useEventStore)
    }
})
export default class EventHistory extends Vue {
    public tabOptions: ActionGroupOption[] = [];
    public filterOptions: ActionGroupOption<EventType>[] = [];
    public day = new Date(new Date().setHours(0, 0, 0, 0));
    public summaries = new EventSummariesDto();
    public eventStore!: ReturnType<typeof useEventStore>;
    private readonly eventHttpService = container.get<EventHttpService>(types.EventHttpService);

    get showTimeline(): boolean {
        return this.tabOptions[0].isActive;
    }

    get showRankViewActions(): boolean {
        if (this.showTimeline) {
            return false;
        }

        const types = [EventType.Interruption, EventType.Task];

        return this.summaries.duration.some(_ => types.includes(_.eventType));
    }

    get workingDurations(): EventDurationDto[] {
        const options = this.filterOptions.filter(_ => _.isActive);
        const types = (options.length ? options : this.filterOptions).map(_ => _.data);

        return this.summaries.duration.filter(_ => types.includes(_.eventType));
    }

    public created(): void {
        this.tabOptions = [
            new ActionGroupOption('timeline', new IconConfig(markRaw(ChartTimelineVariant)), null, true),
            new ActionGroupOption('ranked', new IconConfig(markRaw(TrophyAward)))
        ];

        this.filterOptions = [
            new ActionGroupOption('interruption', IconUtility.getInterruptionTypeIcon(), EventType.Interruption),
            new ActionGroupOption('task', IconUtility.getTaskTypeIcon(), EventType.Task)
        ];

        this.eventStore.loadOngoingEventSummary();
        this.onDaySelect();
    }

    public async onDaySelect(): Promise<void> {
        this.summaries = await this.eventHttpService.getEventSummariesByDay(this.day);
    }

    public async onTimeRangeUpdate(updated: EventTimelineEditorOption): Promise<void> {
        if (await this.eventHttpService.updateTimeRange(updated)) {
            this.onDaySelect();
        }
    }

    public downloadTimesheets(): void {
        this.eventHttpService.downloadTimesheetsByDay(this.day);
    }
}
</script>

<style lang="scss" scoped>
.event-history-container {
    @import '../../../styles/presets.scss';
    @import '../../../styles/animations.scss';

    $summaries-width: 57.5%;
    $summaries-height: 82.5%;

    @include flex-column(center);
    color: var(--font-colors-1-00);
    font-size: var(--font-sizes-500);

    .header {
        @include flex-column(center, center);
        z-index: 1;
        width: $summaries-width;
        height: 15%;
        color: var(--font-colors-1-00);
        @include animate-property(opacity, 0, 1, 0.3s, 0.3s);

        .date-wrapper {
            @include flex-row(center);
            position: relative;
            height: 60%;

            &::before {
                position: absolute;
                right: calc(100% + 1.25vh);
                content: 'What you did on';
                white-space: nowrap;
                font-size: var(--font-sizes-700);
            }
        }

        .actions-wrapper {
            @include flex-row(center, center);
            box-sizing: border-box;
            padding-bottom: 1.5vh;
            position: relative;
            width: 100%;
            height: 40%;

            .actions-left {
                @include flex-row(center, center);
                position: absolute;
                left: 0;

                .filter-group {
                    margin-left: 1.5vh;
                    @include animate-property(opacity, 0, 1, 0.3s, 0.1s);
                }
            }

            .item-count {
                color: var(--font-colors-4-00);
                font-size: var(--font-sizes-400);
            }

            .actions-right {
                @include flex-row(center, center);
                position: absolute;
                right: 0;

                .action-button {
                    margin-left: 1vh;
                    transition: all 0.3s;
                    @include animate-property(opacity, 0, 1, 0.3s, 0.1s);

                    &:hover {
                        background-color: var(--primary-colors-4-00);
                        color: var(--font-colors-0-00);
                    }
                }
            }
        }
    }

    .separator {
        width: calc(#{$summaries-width} * 0.975);
        height: 1px;
        @include animate-property(opacity, 0, 1, 0.3s, 0.2s);

        background: linear-gradient(
            90deg,
            var(--font-colors-0-01) 0%,
            var(--font-colors-0-03) 50%,
            var(--font-colors-0-01) 100%
        );
    }

    .content {
        @include flex-row(flex-start, space-between);
        width: 100%;
        height: 85%;
        @include animate-property(opacity, 0, 1, 0.3s, 0.5s);

        .working-time-breakdown, .not-working-time-breakdown {
            @include flex-column(center);
            width: calc(50% - #{$summaries-width} / 2);
            height: 100%;
            @include animate-property(opacity, 0, 1, 0.4s, 0.5s);

            .time-summary {
                margin-top: 3.5vh;
                width: 60%;
                height: 80%;
            }
        }

        .event-summaries-placeholder, .event-summaries {
            @include flex-column(center, center);
            margin-top: 3.5vh;
            width: $summaries-width;
            height: $summaries-height;
            @include animate-property(opacity, 0, 1, 0.3s, 0.3s);
        }

        .event-summaries {
            box-sizing: border-box;
            padding: 0 3.5%;

            .event-summary-card {
                position: relative;
                margin-bottom: 1.25vh;
                scroll-snap-align: start;
                @include animate-property(opacity, 0, 1, 0.3s);
            }
        }
    }
}
</style>
