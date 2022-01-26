<template>
    <div :id="id"><slot></slot></div>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';
import OverlayScrollbars from 'overlayscrollbars';

export default class OverlayScrollbarPanel extends Vue {
    public readonly id = `overlay-scrollbar-panel-container-${Date.now()}`;

    public mounted(): void {
        OverlayScrollbars(document.getElementById(this.id)!, {
            scrollbars: {
                autoHide: 'leave',
                autoHideDelay: 100
            }
        });
    }
}
</script>
