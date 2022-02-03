<template>
    <div class="event-history-container">
        <div class="date">
            <span>History of</span>
            <date-selector v-model="day" @update:modelValue="onDaySelect()"></date-selector>

            <div class="actions">
                <export-variant v-if="workingDurations.length" class="timesheets-button" @click="downloadTimesheets()" />
                <toggle-selector v-model="showTimeline" class="view-toggle">timeline</toggle-selector>
            </div>
        </div>

        <div class="content">
            <div class="working-time-breakdown">
                <sword-cross class="icon" />

                <template v-if="summaries.timeline.length">
                    <span>Working: {{ workingTime }}</span>
                    <span>Interruptions: {{ interruptionTime }}</span>
                    <span>Tasks: {{ taskTime }}</span>
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
                        :key="index">
                    </event-duration-summary-card>
                </overlay-scrollbar-panel>
            </template>

            <div class="not-working-time-breakdown">
                <shield-cross class="icon" />

                <template v-if="summaries.timeline.length">
                    <span>Not Working: {{ notWorkingTime }}</span>
                    <span>Idling: {{ idlingTime }}</span>
                    <span>Breaks: {{ breakTime }}</span>
                </template>

                <span v-if="!summaries.timeline.length">time information not available.</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { mapStores } from 'pinia';
import { ExportVariant, ShieldCross, SwordCross } from 'mdue';

import { useEventStore } from '../../../stores/event/event.store';
import { types } from '../../../core/ioc/types';
import { container } from '../../../core/ioc/container';
import { EventDurationDto } from '../../../core/dtos/event-duration-dto';
import { EventSummariesDto } from '../../../core/dtos/event-summaries-dto';
import { EventType } from '../../../core/enums/event-type.enum';
import { EventHttpService } from '../../../core/services/http/event-http/event-http.service';
import { TimeUtility } from '../../../core/utilities/time-utility/time-utility';
import ToggleSelector from '../../../shared/inputs/toggle-selector/toggle-selector.vue';
import DateSelector from '../../../shared/inputs/date-selector/date-selector.vue';
import OverlayScrollbarPanel from '../../../shared/panels/overlay-scrollbar-panel/overlay-scrollbar-panel.vue';

import EventTimelineSummaryCard from './event-timeline-summary-card/event-timeline-summary-card.vue';
import EventDurationSummaryCard from './event-duration-summary-card/event-duration-summary-card.vue';

@Options({
    components: {
        ExportVariant,
        ShieldCross,
        SwordCross,
        EventTimelineSummaryCard,
        EventDurationSummaryCard,
        ToggleSelector,
        DateSelector,
        OverlayScrollbarPanel
    },
    computed: {
        ...mapStores(useEventStore)
    }
})
export default class EventHistory extends Vue {
    public day = new Date(new Date().setHours(0, 0, 0, 0));
    public showTimeline = true;
    public summaries = new EventSummariesDto();
    public eventStore!: ReturnType<typeof useEventStore>;
    private readonly eventHttpService = container.get<EventHttpService>(types.EventHttpService);

    get workingTime(): string {
        return this.getDurationString([EventType.Interruption, EventType.Task]);
    }

    get notWorkingTime(): string {
        return this.getDurationString([EventType.Idling, EventType.Break]);
    }

    get interruptionTime(): string {
        return this.getDurationString([EventType.Interruption]);
    }

    get taskTime(): string {
        return this.getDurationString([EventType.Task]);
    }

    get idlingTime(): string {
        return this.getDurationString([EventType.Idling]);
    }

    get breakTime(): string {
        return this.getDurationString([EventType.Break]);
    }

    get workingDurations(): EventDurationDto[] {
        const types = [EventType.Interruption, EventType.Task];

        return this.summaries.duration.filter(_ => types.includes(_.eventType));
    }

    public created(): void {
        this.eventStore.loadOngoingEventSummary();
        this.onDaySelect();
    }

    public async onDaySelect(): Promise<void> {
        this.summaries = await this.eventHttpService.getEventSummariesByDay(this.day);
    }

    public downloadTimesheets(): void {
        this.eventHttpService.downloadTimesheetsByDay(this.day);
    }

    private getDurationString(types: EventType[]): string {
        const events = this.summaries.duration.filter(_ => types.includes(_.eventType));
        const duration = events.map(_ => _.duration).reduce((total, _) => total + _, 0);

        return TimeUtility.getDurationString(duration, false);
    }
}
</script>

<style lang="scss" scoped>
.event-history-container {
    @import '../../../styles/presets.scss';
    @import '../../../styles/animations.scss';

    $summaries-width: 45%;
    $summaries-height: 75%;

    @include flex-column(center);
    color: var(--font-colors-3-00);
    font-size: var(--font-sizes-500);

    .date {
        @include flex-row(center, center);
        z-index: 1;
        position: relative;
        width: 100%;
        height: 7.5%;
        color: var(--font-colors-1-00);
        @include animate-opacity(0, 1, 0.3s, 0.3s);

        & > span {
            margin-right: 1.5vh;
            font-size: var(--font-sizes-700);
        }

        .actions {
            @include flex-row(center, center);
            position: absolute;
            right: 30%;
            bottom: 0.75vh;

            .timesheets-button {
                color: var(--font-colors-1-00);
                transition: color 0.3s;
                @include animate-opacity(0, 1, 0.3s);

                &:hover {
                    cursor: pointer;
                    color: var(--context-colors-info-0-00);
                }
            }

            .view-toggle {
                margin-left: 1.25vh;
                font-size: var(--font-sizes-400);
            }
        }
    }

    .content {
        @include flex-row(flex-start, space-between);
        width: 100%;
        height: 92.5%;
        @include animate-opacity(0, 1, 0.3s, 0.5s);

        .working-time-breakdown, .not-working-time-breakdown {
            @include flex-column(center, center);
            width: calc(50% - #{$summaries-width} / 2);
            height: 80%;
            @include animate-opacity(0, 1, 0.4s, 0.5s);

            & > span {
                margin-bottom: 0.75vh;
                @include animate-opacity(0, 1, 0.4s);
            }

            .icon {
                margin-bottom: 1.5vh;
                font-size: var(--font-sizes-1000);
            }
        }

        .event-summaries-placeholder, .event-summaries {
            @include flex-column(center, center);
            margin-top: 5vh;
            @include animate-opacity(0, 1, 0.3s, 0.3s);
        }

        .event-summaries-placeholder {
            width: $summaries-width;
            height: $summaries-height;
        }

        .event-summaries {
            box-sizing: border-box;
            padding: 0 3.5vh;
            max-width: $summaries-width;
            max-height: $summaries-height;

            .event-summary-card {
                margin: 1vh 0;
                scroll-snap-align: start;
            }
        }
    }
}
</style>
