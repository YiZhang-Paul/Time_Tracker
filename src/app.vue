<template>
    <time-display class="time-display"></time-display>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

import store from './store';
import TimeDisplay from './features/time-display/time-display.vue';

@Options({
    components: {
        TimeDisplay
    }
})
export default class App extends Vue {
    public created(): void {
        store.task.dispatch(store.task.action.LoadTaskItems);
    }
}
</script>

<style lang="scss">
@import './styles/presets.scss';

html, body, #app {
    box-sizing: border-box;
    position: relative;
    margin: 0;
    padding: 0;
    width: 100vw;
    height: 100vh;
    user-select: none;
}

#app {
    background-color: var(--primary-colors-10-00);
}

.time-display {
    position: absolute;
    top: 1.5vh;
    right: 1.5vh;
}
</style>
