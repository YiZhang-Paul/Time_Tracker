<template>
    <div class="search-box-container" :class="{ active: isFocused, custom: useCustomStyle }">
        <div class="inner-wrapper">
            <magnify v-if="!searchText" class="icon" />
            <close v-if="searchText" class="icon reset-button" @click="onReset()" />

            <input type="text"
                v-model="searchText"
                ref="input"
                placeholder="search items here..."
                @keyup="onSearch()"
                @focus="isFocused = true"
                @blur="isFocused = false" />
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { Close, Magnify } from 'mdue';

class SearchBoxProp {
    public autoFocus = prop<boolean>({ default: false });
    public useCustomStyle = prop<boolean>({ default: false });
}

@Options({
    components: {
        Close,
        Magnify
    },
    emits: [
        'search'
    ]
})
export default class SearchBox extends Vue.with(SearchBoxProp) {
    public isFocused = false;
    public searchText = '';
    private debounce: number | null = null;
    private previous = '';

    public mounted(): void {
        if (this.autoFocus) {
            (this.$refs.input as HTMLElement).focus();
        }
    }

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

    &:not(.custom) {
        transition: background-color 0.3s;

        @include raise(
            var(--primary-colors-10-00),
            var(--primary-colors-9-00),
            0 0 0 0 rgba(0, 0, 0, 0.35),
            $box-shadow,
            0.2s,
            0.6s
        );

        .inner-wrapper {
            $padding: 1.25vh;

            padding: 0.75vh 0.5vh;
            width: calc(100% - #{$padding});
            height: calc(100% - #{$padding});
            border: 1px solid var(--primary-colors-7-00);
            @include animate-property(opacity, 0, 1, 0.3s, 0.85s);
        }

        &.active {
            background-color: var(--primary-colors-8-00);
            box-shadow: $box-shadow;
            animation-fill-mode: initial;

            .inner-wrapper {
                border-color: var(--primary-colors-5-00);
                color: var(--font-colors-2-00);
            }
        }
    }

    .inner-wrapper {
        @include flex-row(center, center);
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        border-radius: $border-radius;
        border-color: var(--primary-colors-5-00);
        transition: border-color 0.3s;
        @include animate-property(opacity, 0, 1, 0.3s, 0.4s);

        .icon, input {
            transition: color 0.3s;
        }

        .icon {
            margin-top: 1px;
            @include animate-property(opacity, 0, 1, 0.15s, 0.15s);
        }

        .reset-button {
            color: var(--context-colors-warning-0-06);

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
