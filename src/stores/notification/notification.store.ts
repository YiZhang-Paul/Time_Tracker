import { defineStore } from 'pinia';

import { useEventStore } from '../event/event.store';
import { TimeUtility } from '../../core/utilities/time-utility/time-utility';

const defaultTitle = document.title;
let tabWorkTimerTimeout: number | null = null;
let tabBreakTimerTimeout: number | null = null;

export const useNotificationStore = defineStore('notification', {
    actions: {
        startTabWorkTimer(): void {
            const duration = useEventStore().getWorkingDuration();
            document.title = `${defaultTitle} - ${TimeUtility.getDurationString(duration)} Focus`;
            tabWorkTimerTimeout = setTimeout(() => this.startTabWorkTimer(), 1000);
        },
        stopTabWorkTimer(): void {
            if (tabWorkTimerTimeout) {
                clearTimeout(tabWorkTimerTimeout);
                tabWorkTimerTimeout = null;
            }

            document.title = defaultTitle;
        },
        startTabBreakTimer(): void {
            const duration = useEventStore().getRemainingBreak();
            document.title = `${defaultTitle} - ${TimeUtility.getDurationString(duration)} Break`;
            tabBreakTimerTimeout = setTimeout(() => this.startTabBreakTimer(), 1000);
        },
        stopTabBreakTimer(): void {
            if (tabBreakTimerTimeout) {
                clearTimeout(tabBreakTimerTimeout);
                tabBreakTimerTimeout = null;
            }

            document.title = defaultTitle;
        }
    }
});
