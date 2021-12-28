<template>
    <div class="creation-button-container">
        <plus class="icon" />
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { Plus } from 'mdue';

@Options({
    components: { Plus }
})
export default class CreationButton extends Vue { }
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
