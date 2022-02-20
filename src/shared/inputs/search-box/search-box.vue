<template>
    <div class="search-box-container" :class="{ active: isFocused }">
        <div class="inner-wrapper">
            <target v-if="!searchText" class="icon" />

            <close-circle-outline v-if="searchText"
                class="icon reset-button"
                @click="onReset()" />

            <input type="text"
                placeholder="search items here..."
                v-model="searchText"
                @keyup="onSearch()"
                @focus="isFocused = true"
                @blur="isFocused = false" />
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { CloseCircleOutline, Target } from 'mdue';

@Options({
    components: {
        CloseCircleOutline,
        Target
    },
    emits: [
        'search'
    ]
})
export default class SearchBox extends Vue {
    public isFocused = false;
    public searchText = '';
    private debounce: number | null = null;
    private previous = '';

    public onReset(): void {
        this.searchText = '';
        this.onSearch();
    }

    public onSearch(): void {
        if (this.searchText === this.previous) {
            return;
        }

        if (this.debounce) {
            clearTimeout(this.debounce);
        }

        this.debounce = setTimeout(() => {
            this.$emit('search', this.searchText);
            this.previous = this.searchText;
        }, 200);
    }
}
</script>

<style lang="scss" scoped>
.search-box-container {
    @import '../../../styles/presets.scss';
    @import '../../../styles/animations.scss';

    $box-shadow: 0 0 6px 1px rgba(0, 0, 0, 0.35);
    $border-radius: 5px;

    @include flex-row(center, center);
    border-radius: $border-radius;
    color: var(--font-colors-4-00);
    font-size: var(--font-sizes-500);
    transition: background-color 0.3s;

    @include raise(
        var(--primary-colors-10-00),
        var(--primary-colors-9-00),
        0 0 0 0 rgba(0, 0, 0, 0.35),
        $box-shadow,
        0.2s,
        0.6s
    );

    &.active {
        background-color: var(--primary-colors-8-00);
        box-shadow: $box-shadow;
        animation-fill-mode: initial;

        .inner-wrapper {
            border-color: var(--primary-colors-5-00);
            color: var(--font-colors-2-00);
        }
    }

    .inner-wrapper {
        $padding: 1.25vh;

        @include flex-row(center, center);
        box-sizing: border-box;
        padding: 0.75vh 0.5vh;
        width: calc(100% - #{$padding});
        height: calc(100% - #{$padding});
        border-radius: $border-radius;
        border: 1px solid var(--primary-colors-7-00);
        transition: border-color 0.3s;
        @include animate-opacity(0, 1, 0.3s, 0.85s);

        .icon, input {
            transition: color 0.3s;
        }

        .icon {
            margin-right: 3px;
            @include animate-opacity(0, 1, 0.15s, 0.15s);
        }

        .reset-button {
            color: var(--context-colors-warning-1-00);

            &:hover {
                cursor: pointer;
                color: var(--context-colors-warning-0-00);
            }
        }

        input {
            flex-grow: 1;
            border: none;
            outline: none;
            background-color: inherit;
            color: inherit;
            font-size: var(--font-sizes-400);
            font-family: inherit;
        }
    }
}
</style>
