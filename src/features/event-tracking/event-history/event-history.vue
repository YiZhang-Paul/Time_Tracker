<template>
    <div class="event-history-container">
        <div class="header">
            <div class="date-wrapper">
                <date-selector v-model="day" @update:modelValue="onDaySelect()"></date-selector>
            </div>

            <div class="actions">
                <toggle-selector v-model="showTimeline" class="view-toggle">timeline</toggle-selector>
                <icon-button class="action-button" @click="onDaySelect()"><refresh /></icon-button>

                <icon-button v-if="!showTimeline && workingDurations.length"
                    class="action-button"
                    @click="downloadTimesheets()">

                    <export-variant />
                </icon-button>
            </div>
        </div>

        <div class="separator"></div>

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
                        :rank="index + 1"
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
import { ExportVariant, Refresh, ShieldCross, SwordCross } from 'mdue';

import { useEventStore } from '../../../stores/event/event.store';
import { types } from '../../../core/ioc/types';
import { container } from '../../../core/ioc/container';
import { EventDurationDto } from '../../../core/dtos/event-duration-dto';
import { EventSummariesDto } from '../../../core/dtos/event-summaries-dto';
import { EventType } from '../../../core/enums/event-type.enum';
import { EventHttpService } from '../../../core/services/http/event-http/event-http.service';
import { TimeUtility } from '../../../core/utilities/time-utility/time-utility';
import IconButton from '../../../shared/buttons/icon-button/icon-button.vue';
import ToggleSelector from '../../../shared/inputs/toggle-selector/toggle-selector.vue';
import DateSelector from '../../../shared/inputs/date-selector/date-selector.vue';
import OverlayScrollbarPanel from '../../../shared/panels/overlay-scrollbar-panel/overlay-scrollbar-panel.vue';

import EventTimelineSummaryCard from './event-timeline-summary-card/event-timeline-summary-card.vue';
import EventDurationSummaryCard from './event-duration-summary-card/event-duration-summary-card.vue';

@Options({
    components: {
        ExportVariant,
        Refresh,
        ShieldCross,
        SwordCross,
        EventTimelineSummaryCard,
        EventDurationSummaryCard,
        IconButton,
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

        return TimeUtility.getDurationString(duration, 'short');
    }
}
</script>

<style lang="scss" scoped>
.event-history-container {
    @import '../../../styles/presets.scss';
    @import '../../../styles/animations.scss';

    $summaries-width: 57.5%;
    $summaries-height: 75%;

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

        .actions {
            @include flex-row(center, center);
            align-self: flex-start;
            height: 40%;

            .view-toggle {
                font-size: var(--font-sizes-400);
            }

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

    .separator {
        width: 55vw;
        height: 1px;

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
            margin-top: 3.5vh;
            width: $summaries-width;
            @include animate-opacity(0, 1, 0.3s, 0.3s);
        }

        .event-summaries-placeholder {
            height: $summaries-height;
        }

        .event-summaries {
            box-sizing: border-box;
            padding: 0 3.5%;
            max-height: $summaries-height;

            .event-summary-card {
                margin-bottom: 1.25vh;
                scroll-snap-align: start;
                @include animate-opacity(0, 1, 0.3s);
            }
        }
    }
}
</style>
