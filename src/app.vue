<template>
    <router-view class="main-view"></router-view>
    <time-display class="time-display"></time-display>
    <event-tracker class="event-tracker"></event-tracker>
    <menu-selector class="menu-selector" :options="menuOptions"></menu-selector>
    <dialogs-base></dialogs-base>

    <div class="build-versions">
        <span>{{ uiBuildVersion }}</span>
        <span>{{ apiBuildVersion }}</span>
    </div>
</template>

<script lang="ts">
import { markRaw } from '@vue/reactivity';
import { Options, Vue } from 'vue-class-component';
import { mapStores } from 'pinia';
import { History, Sword } from 'mdue';

import { useNotificationStore } from './stores/notification/notification.store';
import { useEventStore } from './stores/event/event.store';
import { MenuSelectionOption } from './core/models/options/menu-selection-option';
import TimeDisplay from './features/time-display/time-display.vue';
import EventTracker from './features/event-tracking/event-tracker/event-tracker.vue';
import MenuSelector from './shared/inputs/menu-selector/menu-selector.vue';
import DialogsBase from './shared/dialogs/dialogs-base/dialogs-base.vue';

@Options({
    components: {
        TimeDisplay,
        EventTracker,
        MenuSelector,
        DialogsBase
    },
    watch: {
        isWorking(current: boolean): void {
            if (current) {
                this.notificationStore.startTabWorkTimer();
            }
            else {
                this.notificationStore.stopTabWorkTimer();
            }
        },
        isBreaking(current: boolean): void {
            if (current) {
                this.notificationStore.startTabBreakTimer();
            }
            else {
                this.notificationStore.stopTabBreakTimer();
            }
        }
    },
    computed: {
        ...mapStores(useNotificationStore, useEventStore)
    }
})
export default class App extends Vue {
    public notificationStore!: ReturnType<typeof useNotificationStore>;
    private eventStore!: ReturnType<typeof useEventStore>;

    public readonly menuOptions = [
        new MenuSelectionOption('Work', 'works', markRaw(Sword)),
        new MenuSelectionOption('History', 'histories', markRaw(History))
    ];

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
    top: $content-top;
    right: $border-gap;
    width: 20vw;
    height: 10vh;
    @include animate-opacity(0, 1, 0.4s, 1.5s);
}

.time-display {
    position: absolute;
    top: $border-gap;
    right: $border-gap;
}

.menu-selector {
    position: absolute;
    bottom: $border-gap;
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
