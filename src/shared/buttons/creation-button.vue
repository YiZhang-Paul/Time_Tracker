<template>
    <div class="creation-button-container" :class="{ disabled: isDisabled }">
        <plus class="icon" />
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { Plus } from 'mdue';

class CreationButtonProp {
    public isDisabled = prop<boolean>({ default: false });
}

@Options({
    components: { Plus }
})
export default class CreationButton extends Vue.with(CreationButtonProp) { }
</script>

<style lang="scss" scoped>
.creation-button-container {
    @import '../../styles/presets.scss';

    @include flex-row(center, center);
    cursor: pointer;
    border-radius: 50%;
    box-shadow: 0 0 6px 1px var(--creation-button-color-shadow);
    background: linear-gradient(155deg, var(--creation-button-color-start) -12.5%, var(--creation-button-color-end) 105%);
    transition: box-shadow 0.3s;

    &.disabled {
        pointer-events: none;
        background: linear-gradient(155deg, var(--creation-button-color-start) -12.5%, var(--creation-button-color-end) 75%);

        .icon {
            box-shadow: none;
            color: var(--font-colors-3-00);
        }
    }

    &:hover {
        box-shadow: 0 0 20px 5px var(--creation-button-color-shadow);

        .icon {
            color: var(--font-colors-0-00);
        }
    }

    .icon {
        color: var(--font-colors-2-00);
        font-size: var(--font-sizes-700);
        transition: color 0.3s;
    }
}
</style>
