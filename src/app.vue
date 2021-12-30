<template>
    <work-items class="work-items"></work-items>
    <time-display class="time-display"></time-display>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

import WorkItems from './features/work-items/work-items.vue';
import TimeDisplay from './features/time-display/time-display.vue';

@Options({
    components: {
        WorkItems,
        TimeDisplay
    }
})
export default class App extends Vue { }
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
    position: absolute;
    top: $content-top;
    left: 0;
    width: 100vw;
    height: calc(100vh - #{$content-top});
}

.time-display {
    position: absolute;
    top: $border-gap;
    right: $border-gap;
}
</style>
