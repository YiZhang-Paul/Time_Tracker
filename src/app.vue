<template>
    <time-display class="time-display"></time-display>
    <task-item-list class="task-item-list"></task-item-list>
    <creation-button class="creation-button"></creation-button>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

import store from './store';
import TimeDisplay from './features/time-display/time-display.vue';
import TaskItemList from './features/task/task-item-list/task-item-list.vue';
import CreationButton from './shared/buttons/creation-button.vue';

@Options({
    components: {
        TimeDisplay,
        TaskItemList,
        CreationButton
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
@import './styles/animations.scss';

$border-gap: 1.5vh;

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
    top: $border-gap;
    right: $border-gap;
}

.task-item-list {
    position: absolute;
    top: 25vh;
    right: $border-gap;
    width: 15vw;
}

.creation-button {
    $dimension: 5.5vh;

    position: absolute;
    left: calc(50vw - #{$dimension} / 2);
    bottom: 3.5vh;
    width: $dimension;
    height: $dimension;
}
</style>
