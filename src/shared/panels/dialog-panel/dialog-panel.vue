<template>
    <div class="dialog-panel-container">
        <component v-if="dialog"
            :style="{ width, height }"
            :is="dialog"
            :data="data"
            @cancel="$emit('cancel')"
            @confirm="$emit('confirm', $event)">
        </component>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';

class DialogPanelProp {
    public dialog = prop<unknown>({ default: null });
    public data = prop<unknown>({ default: null });
    public width = prop<string>({ default: '30vw' });
    public height = prop<string>({ default: '15vh' });
}

@Options({
    emits: [
        'cancel',
        'confirm'
    ]
})
export default class DialogPanel extends Vue.with(DialogPanelProp) { }
</script>

<style lang="scss" scoped>
.dialog-panel-container {
    @import '../../../styles/presets.scss';
    @import '../../../styles/animations.scss';

    @include flex-row(center, center);
    z-index: 99999;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: var(--primary-colors-10-00);
    @include animate-property(opacity, 0, 1, 0.2s);
}
</style>
