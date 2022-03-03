<template>
    <router-view class="main-view"></router-view>
    <time-display class="time-display"></time-display>
    <event-tracker class="event-tracker"></event-tracker>
    <dialogs-base></dialogs-base>

    <div class="build-versions">
        <span>{{ uiBuildVersion }}</span>
        <span>{{ apiBuildVersion }}</span>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { mapStores } from 'pinia';

import { useNotificationStore } from './stores/notification/notification.store';
import { useEventStore } from './stores/event/event.store';
import TimeDisplay from './features/time-display/time-display.vue';
import EventTracker from './features/event-tracking/event-tracker/event-tracker.vue';
import DialogsBase from './shared/dialogs/dialogs-base/dialogs-base.vue';

@Options({
    components: {
        TimeDisplay,
        EventTracker,
        DialogsBase
    },
    watch: {
        isWorking(current: boolean): void {
            const store = this.notificationStore as ReturnType<typeof useNotificationStore>;

            if (current) {
                store.showTabNotificationForWork();
            }
            else {
                store.clearTabNotification('working');
            }
        },
        isBreaking(current: boolean): void {
            const store = this.notificationStore as ReturnType<typeof useNotificationStore>;

            if (current) {
                store.showTabNotificationForBreak();
            }
            else {
                store.clearTabNotification('breaking');
            }
        }
    },
    computed: {
        ...mapStores(useNotificationStore, useEventStore)
    }
})
export default class App extends Vue {
    public showViewSelection = false;
    public notificationStore!: ReturnType<typeof useNotificationStore>;
    private eventStore!: ReturnType<typeof useEventStore>;

    get isWorking(): boolean {
        return this.eventStore.isWorking;
    }

    get isBreaking(): boolean {
        return this.eventStore.isBreaking;
    }

    /* istanbul ignore next */
    get uiBuildVersion(): string {
        return `UI_BUILD ${process.env.VUE_APP_UI_BUILD_VERSION}`;
    }

    /* istanbul ignore next */
    get apiBuildVersion(): string {
        return `API_BUILD ${process.env.VUE_APP_API_BUILD_VERSION}`;
    }
}
</script>

<style lang="scss">
@import './styles/presets.scss';
@import './styles/animations.scss';

@font-face {
    font-family: 'Jost';
    src: url('./assets/fonts/Jost-Regular.ttf');
}

$border-gap: 1.5vh;
$content-top: 15vh;

html, body, #app {
    box-sizing: border-box;
    position: relative;
    margin: 0;
    padding: 0;
    width: 100vw;
    height: 100vh;
    font-family: 'Jost';
    user-select: none;
}

#app {
    @include flex-column(center);
    background-color: var(--primary-colors-10-00);
}

.main-view {
    position: absolute;
    top: $content-top;
    left: 0;
    width: 100vw;
    height: calc(100vh - #{$content-top});
}

.event-tracker {
    position: absolute;
    top: calc(#{$content-top} + 1.5vh);
    right: 20vw;
    height: 5vh;
    @include animate-property(opacity, 0, 1, 0.4s, 1.5s);
}

.time-display {
    position: absolute;
    top: $border-gap;
    right: $border-gap;
}

.build-versions {
    @include flex-column(flex-end, center);
    position: absolute;
    bottom: 0.5vh;
    right: 0.5vh;
    color: var(--font-colors-4-00);
    font-size: var(--font-sizes-100);
}
</style>
