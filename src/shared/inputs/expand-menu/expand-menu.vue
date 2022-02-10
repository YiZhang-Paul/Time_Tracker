<template>
    <div class="expand-menu-container"></div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';

class ExpandMenuProp {
    public options = prop<string[]>({ default: [] });
}

@Options({
    emits: [
        'select'
    ]
})
export default class ExpandMenu extends Vue.with(ExpandMenuProp) { }
</script>

<style lang="scss" scoped>
.expand-menu-container {

}
</style>
