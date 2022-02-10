<template>
    <icon-button class="expand-menu-container"
        :class="{ active: showMenu }"
        ref="container"
        @click="showMenu = !showMenu">

        <dots-vertical />

        <div v-if="showMenu" class="menu">
            <div v-for="(option, index) in options"
                class="option"
                :key="index"
                @click="$emit('select', option)">

                {{ option }}
            </div>
        </div>
    </icon-button>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { DotsVertical } from 'mdue';

import { DomUtility } from '../../../core/utilities/dom-utility/dom-utility';
import IconButton from '../../buttons/icon-button/icon-button.vue';

class ExpandMenuProp {
    public options = prop<string[]>({ default: [] });
}

@Options({
    components: {
        DotsVertical,
        IconButton
    },
    emits: [
        'select'
    ]
})
export default class ExpandMenu extends Vue.with(ExpandMenuProp) {
    public showMenu = false;

    public mounted(): void {
        document.addEventListener('click', this.checkClickOutside);
    }

    public beforeUnmount(): void {
        document.removeEventListener('click', this.checkClickOutside);
    }

    private checkClickOutside(event: Event): void {
        const container = this.$refs.container as Vue;

        if (DomUtility.isClickOutside(event, container.$el)) {
            this.showMenu = false;
        }
    }
}
</script>

<style lang="scss" scoped>
.expand-menu-container {
    @import '../../../styles/presets.scss';
    @import '../../../styles/animations.scss';

    position: relative;

    .menu {
        @include flex-column();
        padding: 0.5vh 0;
        position: absolute;
        top: calc(100% + 0.75vh);
        background-color: var(--primary-colors-6-00);
        border-radius: 5px;
        @include animate-opacity(0, 1, 0.3s, 0.1s);

        .option {
            padding: 0.75vh 2vh;
            color: var(--font-colors-2-00);
            font-size: var(--font-sizes-200);
            transition: background-color 0.3s, color 0.3s;

            &:hover {
                background-color: var(--primary-colors-4-00);
                color: var(--font-colors-0-00);
            }
        }
    }
}
</style>
