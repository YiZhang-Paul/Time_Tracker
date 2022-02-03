import { defineStore } from 'pinia';

import { useEventStore } from '../event/event.store';
import { TimeUtility } from '../../core/utilities/time-utility/time-utility';

const defaultTitle = document.title;
let tabWorkTimerTimeout: number | null = null;

export const useNotificationStore = defineStore('notification', {
    actions: {
        startTabWorkTimer(): void {
            const duration = useEventStore().getWorkingDuration();
            document.title = `${defaultTitle} - ${TimeUtility.getDurationString(duration)} Focusing`;
            tabWorkTimerTimeout = setTimeout(() => this.startTabWorkTimer(), 1000);
        },
        stopTabWorkTimer(): void {
            if (tabWorkTimerTimeout) {
                clearTimeout(tabWorkTimerTimeout);
                tabWorkTimerTimeout = null;
            }

            document.title = defaultTitle;
        }
    }
});
