<template>
    <work-items class="work-items"></work-items>
    <event-tracker class="event-tracker"></event-tracker>
    <time-display class="time-display"></time-display>
    <dialogs-base></dialogs-base>

    <div class="build-versions">
        <span>{{ uiBuildVersion }}</span>
        <span>{{ apiBuildVersion }}</span>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

import WorkItems from './features/work-items/work-items.vue';
import EventTracker from './features/event-tracking/event-tracker.vue';
import TimeDisplay from './features/time-display/time-display.vue';
import DialogsBase from './shared/dialogs/dialogs-base/dialogs-base.vue';

@Options({
    components: {
        WorkItems,
        EventTracker,
        TimeDisplay,
        DialogsBase
    }
})
export default class App extends Vue {
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
    background-color: var(--primary-colors-10-00);
}

.work-items {
    z-index: 1;
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

.build-versions {
    @include flex-column(flex-end, center);
    position: absolute;
    bottom: 0.5vh;
    right: 0.5vh;
    color: var(--font-colors-4-00);
    font-size: var(--font-sizes-100);
}
</style>
