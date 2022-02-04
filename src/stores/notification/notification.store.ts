import { defineStore } from 'pinia';

import { useEventStore } from '../event/event.store';
import { TimeUtility } from '../../core/utilities/time-utility/time-utility';

const defaultTitle = document.title;

const tabTimeouts = {
    working: null as number | null,
    breaking: null as number | null,
    breakPrompt: null as number | null
};

export const useNotificationStore = defineStore('notification', {
    actions: {
        showTabNotificationForWork(): void {
            const duration = useEventStore().getWorkingDuration();
            document.title = `${defaultTitle} - ${TimeUtility.getDurationString(duration)} Focus`;
            tabTimeouts.working = setTimeout(() => this.showTabNotificationForWork(), 1000);
        },
        showTabNotificationForBreak(): void {
            const duration = useEventStore().getRemainingBreak();
            document.title = `${defaultTitle} - ${TimeUtility.getDurationString(duration)} Break`;
            tabTimeouts.breaking = setTimeout(() => this.showTabNotificationForBreak(), 1000);
        },
        showTabNotificationForBreakPrompt(isVisible = true): void {
            document.title = `${defaultTitle} - ${isVisible ? 'Time for a break!' : ''}`;
            tabTimeouts.breakPrompt = setTimeout(() => this.showTabNotificationForBreakPrompt(!isVisible), 1000);
        },
        clearTabNotification(key: keyof typeof tabTimeouts): void {
            if (tabTimeouts[key]) {
                clearTimeout(tabTimeouts[key]!);
                tabTimeouts[key] = null;
            }

            document.title = defaultTitle;
        }
    }
});
