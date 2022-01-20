import { defineStore } from 'pinia';

import { types } from '../../core/ioc/types';
import { container } from '../../core/ioc/container';
import { OngoingEventTimeSummary } from '../../core/models/event/ongoing-event-time-summary';
import { EventType } from '../../core/enums/event-type.enum';
import { EventHttpService } from '../../core/services/http/event-http/event-http.service';

const oneMinute = 1000 * 60;
let eventHttpService = container.get<EventHttpService>(types.EventHttpService);

export const setServices = (eventHttp: EventHttpService): void => {
    eventHttpService = eventHttp;
};

export const useEventStore = defineStore('event', {
    state: () => ({
        ongoingEventSummary: null as OngoingEventTimeSummary | null,
        workDurationLimit: oneMinute * 50
    }),
    getters: {
        isWorking(): boolean {
            const type = this.ongoingEventSummary?.unconcludedSinceStart.eventType;

            return type === EventType.Interruption || type === EventType.Task;
        },
        isNotWorking(): boolean {
            const type = this.ongoingEventSummary?.unconcludedSinceStart.eventType;

            return type === EventType.Idling || type === EventType.Break;
        },
        isActiveWorkItem() {
            return (type: EventType, id: number) => {
                if (!this.isWorking) {
                    return false;
                }

                const { eventType, resourceId } = this.ongoingEventSummary!.unconcludedSinceStart;

                return eventType === type && resourceId === id;
            };
        },
        hasScheduledBreak(): boolean {
            if (!this.isWorking) {
                return false;
            }

            const limit = this.workDurationLimit;
            const { concludedSinceLastBreakPrompt, unconcludedSinceLastBreakPrompt } = this.ongoingEventSummary!;
            const unconcluded = Date.now() - new Date(unconcludedSinceLastBreakPrompt.timestamp).getTime();

            return concludedSinceLastBreakPrompt.working + unconcluded >= limit;
        },
        workingDuration(): number {
            if (!this.ongoingEventSummary) {
                return 0;
            }

            const { concludedSinceStart, unconcludedSinceStart } = this.ongoingEventSummary;
            const unconcluded = this.isWorking ? Date.now() - new Date(unconcludedSinceStart.timestamp).getTime() : 0;

            return concludedSinceStart.working + unconcluded;
        },
        nonWorkingDuration(): number {
            if (!this.ongoingEventSummary) {
                return 0;
            }

            const { concludedSinceStart, unconcludedSinceStart } = this.ongoingEventSummary;
            const unconcluded = this.isWorking ? 0 : Date.now() - new Date(unconcludedSinceStart.timestamp).getTime();

            return concludedSinceStart.notWorking + unconcluded;
        }
    },
    actions: {
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
            const isStarted = await eventHttpService.startBreak();

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
