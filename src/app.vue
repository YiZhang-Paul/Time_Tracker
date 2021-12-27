<template>
    <div class="container"></div>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';

export default class App extends Vue { }
</script>

<style lang="scss">
@import './styles/presets.scss';

html, body, #app {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    width: 100vw;
    height: 100vh;
    user-select: none;
}

#app {
    background-color: var(--primary-colors-10-00);
}

.container {
    width: 100%;
    height: 100%;
}
</style>
