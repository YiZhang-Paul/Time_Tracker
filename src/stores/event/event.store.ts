import { defineStore } from 'pinia';

import { types } from '../../core/ioc/types';
import { container } from '../../core/ioc/container';
import { OngoingEventTimeSummaryDto } from '../../core/dtos/ongoing-event-time-summary-dto';
import { EventType } from '../../core/enums/event-type.enum';
import { TimeUtility } from '../../core/utilities/time-utility/time-utility';
import { EventHttpService } from '../../core/services/http/event-http/event-http.service';

let eventHttpService = container.get<EventHttpService>(types.EventHttpService);

export const setServices = (eventHttp: EventHttpService): void => {
    eventHttpService = eventHttp;
};

export const useEventStore = defineStore('event', {
    state: () => ({
        ongoingEventSummary: null as OngoingEventTimeSummaryDto | null,
        workDurationLimit: TimeUtility.convertTime(50, 'minute', 'millisecond'),
        breakDuration: TimeUtility.convertTime(10, 'minute', 'millisecond')
    }),
    getters: {
        isWorking(): boolean {
            const type = this.ongoingEventSummary?.unconcludedSinceStart.eventType;

            return type === EventType.Interruption || type === EventType.Task;
        },
        isNotWorking(): boolean {
            return this.isBreaking || this.ongoingEventSummary?.unconcludedSinceStart.eventType === EventType.Idling;
        },
        isBreaking(): boolean {
            return this.ongoingEventSummary?.unconcludedSinceStart.eventType === EventType.Break;
        },
        isActiveWorkItem() {
            return (type: EventType, id: number) => {
                if (!this.isWorking) {
                    return false;
                }

                const { eventType, resourceId } = this.ongoingEventSummary!.unconcludedSinceStart;

                return eventType === type && resourceId === id;
            };
        }
    },
    actions: {
        hasScheduledBreak(): boolean {
            if (!this.isWorking) {
                return false;
            }

            const limit = this.workDurationLimit;
            const { concludedSinceLastBreakPrompt, unconcludedSinceLastBreakPrompt } = this.ongoingEventSummary!;
            const unconcluded = Date.now() - new Date(unconcludedSinceLastBreakPrompt.timestamp).getTime();

            return concludedSinceLastBreakPrompt.working + unconcluded >= limit;
        },
        getWorkingDuration(): number {
            if (!this.ongoingEventSummary) {
                return 0;
            }

            const { concludedSinceStart, unconcludedSinceStart } = this.ongoingEventSummary;
            const unconcluded = this.isWorking ? Date.now() - new Date(unconcludedSinceStart.timestamp).getTime() : 0;

            return concludedSinceStart.working + unconcluded;
        },
        getNonWorkingDuration(): number {
            if (!this.ongoingEventSummary) {
                return 0;
            }

            const { concludedSinceStart, unconcludedSinceStart } = this.ongoingEventSummary;
            const unconcluded = this.isWorking ? 0 : Date.now() - new Date(unconcludedSinceStart.timestamp).getTime();

            return concludedSinceStart.notWorking + unconcluded;
        },
        getRemainingBreak(): number {
            if (!this.isBreaking) {
                return 0;
            }

            const { unconcludedSinceStart } = this.ongoingEventSummary!;
            const elapsed = Date.now() - new Date(unconcludedSinceStart.timestamp).getTime();

            return Math.max(unconcludedSinceStart.targetDuration - elapsed, 0);
        },
        async loadOngoingEventSummary(): Promise<void> {
            const start = new Date(new Date().setHours(0, 0, 0, 0));
            this.ongoingEventSummary = await eventHttpService.getOngoingEventSummary(start);
        },
        async startIdling(): Promise<boolean> {
            const isStarted = await eventHttpService.startIdling();

            if (isStarted) {
                await this.loadOngoingEventSummary();
            }

            return isStarted;
        },
        async startInterruption(id: number): Promise<boolean> {
            const isStarted = await eventHttpService.startInterruption(id);

            if (isStarted) {
                await this.loadOngoingEventSummary();
            }

            return isStarted;
        },
        async startTask(id: number): Promise<boolean> {
            const isStarted = await eventHttpService.startTask(id);

            if (isStarted) {
                await this.loadOngoingEventSummary();
            }

            return isStarted;
        },
        async startBreak(): Promise<boolean> {
            const isStarted = await eventHttpService.startBreak(this.breakDuration);

            if (isStarted) {
                await this.loadOngoingEventSummary();
            }

            return isStarted;
        },
        async skipBreak(): Promise<boolean> {
            const isSkipped = await eventHttpService.skipBreak();

            if (isSkipped) {
                await this.loadOngoingEventSummary();
            }

            return isSkipped;
        }
    }
});
