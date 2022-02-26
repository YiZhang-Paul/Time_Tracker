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
                <template v-if="summaries.timeline.length">
                    <event-time-summary-card :title="'You worked'"
                        :duration="workingDuration"
                        :icon="workingTimeIcon">
                    </event-time-summary-card>

                    <event-time-summary-card :title="'Interruptions'"
                        :duration="interruptionDuration"
                        :icon="interruptionIcon">
                    </event-time-summary-card>

                    <event-time-summary-card :title="'Tasks'"
                        :duration="taskDuration"
                        :icon="taskIcon">
                    </event-time-summary-card>
                </template>

                <span v-if="!summaries.timeline.length">time information not available.</span>
            </div>

            <template v-if="showTimeline">
                <div v-if="!summaries.timeline.length" class="event-summaries-placeholder">no data available.</div>

                <overlay-scrollbar-panel v-if="summaries.timeline.length" class="event-summaries">
                    <event-timeline-summary-card v-for="(timeline, index) in summaries.timeline"
                        class="event-summary-card"
                        :current="timeline"
                        :next="index === summaries.timeline.length - 1 ? null : summaries.timeline[index + 1]"
                        :key="index">
                    </event-timeline-summary-card>
                </overlay-scrollbar-panel>
            </template>

            <template v-if="!showTimeline">
                <div v-if="!workingDurations.length" class="event-summaries-placeholder">no data available.</div>

                <overlay-scrollbar-panel v-if="workingDurations.length" class="event-summaries">
                    <event-duration-summary-card v-for="(duration, index) in workingDurations"
                        class="event-summary-card"
                        :summary="duration"
                        :rank="index + 1"
                        :key="index">
                    </event-duration-summary-card>
                </overlay-scrollbar-panel>
            </template>

            <div class="not-working-time-breakdown">
                <template v-if="summaries.timeline.length">
                    <event-time-summary-card :title="'Time didn\'t work'"
                        :duration="notWorkingDuration"
                        :icon="notWorkingTimeIcon">
                    </event-time-summary-card>

                    <event-time-summary-card :title="'Untracked'"
                        :duration="idlingDuration"
                        :icon="idlingIcon">
                    </event-time-summary-card>

                    <event-time-summary-card :title="'Sleeps & Breaks'"
                        :duration="breakDuration"
                        :icon="breakIcon">
                    </event-time-summary-card>
                </template>

                <span v-if="!summaries.timeline.length">time information not available.</span>
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
import { FilterGroupOption } from '../../../core/models/options/filter-group-option';
import { EventType } from '../../../core/enums/event-type.enum';
import { EventHttpService } from '../../../core/services/http/event-http/event-http.service';
import { IconUtility } from '../../../core/utilities/icon-utility/icon-utility';
import IconButton from '../../../shared/buttons/icon-button/icon-button.vue';
import DateSelector from '../../../shared/inputs/date-selector/date-selector.vue';
import TabGroup from '../../../shared/inputs/tab-group/tab-group.vue';
import FilterGroup from '../../../shared/inputs/filter-group/filter-group.vue';
import OverlayScrollbarPanel from '../../../shared/panels/overlay-scrollbar-panel/overlay-scrollbar-panel.vue';

import EventTimeSummaryCard from './event-time-summary-card/event-time-summary-card.vue';
import EventTimelineSummaryCard from './event-timeline-summary-card/event-timeline-summary-card.vue';
import EventDurationSummaryCard from './event-duration-summary-card/event-duration-summary-card.vue';

@Options({
    components: {
        ExportVariant,
        Refresh,
        EventTimeSummaryCard,
        EventTimelineSummaryCard,
        EventDurationSummaryCard,
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
    public readonly interruptionIcon = IconUtility.getInterruptionTypeIcon();
    public readonly taskIcon = IconUtility.getTaskTypeIcon();
    public readonly idlingIcon = IconUtility.getIdlingTypeIcon();
    public readonly breakIcon = IconUtility.getBreakTypeIcon();
    public readonly workingTimeIcon = IconUtility.getWorkingTypeIcon();
    public readonly notWorkingTimeIcon = IconUtility.getNotWorkingTypeIcon();
    public tabOptions: FilterGroupOption[] = [];
    public filterOptions: FilterGroupOption<EventType>[] = [];
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

    get workingDuration(): number {
        return this.getDuration([EventType.Interruption, EventType.Task]);
    }

    get notWorkingDuration(): number {
        return this.getDuration([EventType.Idling, EventType.Break]);
    }

    get interruptionDuration(): number {
        return this.getDuration([EventType.Interruption]);
    }

    get taskDuration(): number {
        return this.getDuration([EventType.Task]);
    }

    get idlingDuration(): number {
        return this.getDuration([EventType.Idling]);
    }

    get breakDuration(): number {
        return this.getDuration([EventType.Break]);
    }

    get workingDurations(): EventDurationDto[] {
        const options = this.filterOptions.filter(_ => _.isActive);
        const types = (options.length ? options : this.filterOptions).map(_ => _.data);

        return this.summaries.duration.filter(_ => types.includes(_.eventType));
    }

    public created(): void {
        this.tabOptions = [
            new FilterGroupOption('timeline', new IconConfig(markRaw(ChartTimelineVariant))),
            new FilterGroupOption('ranked', new IconConfig(markRaw(TrophyAward)), null, false)
        ];

        this.filterOptions = [
            new FilterGroupOption('interruption', this.interruptionIcon, EventType.Interruption),
            new FilterGroupOption('task', this.taskIcon, EventType.Task)
        ];

        this.eventStore.loadOngoingEventSummary();
        this.onDaySelect();
    }

    public async onDaySelect(): Promise<void> {
        this.summaries = await this.eventHttpService.getEventSummariesByDay(this.day);
    }

    public downloadTimesheets(): void {
        this.eventHttpService.downloadTimesheetsByDay(this.day);
    }

    private getDuration(types: EventType[]): number {
        const events = this.summaries.duration.filter(_ => types.includes(_.eventType));

        return events.map(_ => _.duration).reduce((total, _) => total + _, 0);
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
        @include animate-opacity(0, 1, 0.3s, 0.3s);

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
                    @include animate-opacity(0, 1, 0.3s, 0.1s);
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
                    @include animate-opacity(0, 1, 0.3s, 0.1s);

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
        @include animate-opacity(0, 1, 0.3s, 0.2s);

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
        @include animate-opacity(0, 1, 0.3s, 0.5s);

        .working-time-breakdown, .not-working-time-breakdown {
            @include flex-column(center, center);
            width: calc(50% - #{$summaries-width} / 2);
            height: 80%;
            @include animate-opacity(0, 1, 0.4s, 0.5s);

            & > span {
                @include animate-opacity(0, 1, 0.4s);
            }
        }

        .event-summaries-placeholder, .event-summaries {
            @include flex-column(center, center);
            margin-top: 3.5vh;
            width: $summaries-width;
            height: $summaries-height;
            @include animate-opacity(0, 1, 0.3s, 0.3s);
        }

        .event-summaries {
            box-sizing: border-box;
            padding: 0 3.5%;

            .event-summary-card {
                margin-bottom: 1.25vh;
                scroll-snap-align: start;
                @include animate-opacity(0, 1, 0.3s);
            }
        }
    }
}
</style>
