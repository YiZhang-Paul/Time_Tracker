<template>
    <div class="search-box-container">
        <div class="box-border">
            <target class="icon" />

            <input type="text"
                placeholder="search items here..."
                @keyup="onSearch($event.target.value)" />
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { Target } from 'mdue';

@Options({
    components: {
        Target
    },
    emits: [
        'search'
    ]
})
export default class SearchBox extends Vue {
    private debounce: number | null = null;
    private previous = '';

    public onSearch(text: string): void {
        const current = text?.trim() ?? '';

        if (current === this.previous) {
            return;
        }

        if (this.debounce) {
            clearTimeout(this.debounce);
        }

        this.debounce = setTimeout(() => {
            this.$emit('search', current);
            this.previous = current;
        }, 200);
    }
}
</script>

<style lang="scss" scoped>
.search-box-container {
    @import '../../../styles/presets.scss';
    @import '../../../styles/animations.scss';

    $border-radius: 5px;

    @include flex-row(center, center);
    border-radius: $border-radius;
    color: var(--font-colors-4-00);
    font-size: var(--font-sizes-700);

    @include emerge(
        var(--primary-colors-10-00),
        var(--primary-colors-9-00),
        0 0 0 0 rgba(0, 0, 0, 0.35),
        0 0 6px 1px rgba(0, 0, 0, 0.35),
        0.2s,
        0.6s
    );

    .box-border {
        $padding: 1.5vh;

        @include flex-row(center, center);
        box-sizing: border-box;
        padding: 0.75vh 1.25vh;
        width: calc(100% - #{$padding});
        height: calc(100% - #{$padding});
        border-radius: $border-radius;
        border: 1px solid var(--primary-colors-5-00);
        @include animate-opacity(0, 1, 0.3s, 0.85s);

        .icon {
            margin-right: 4px;
        }

        input {
            flex-grow: 1;
            border: none;
            outline: none;
            background-color: inherit;
            color: inherit;
            font-size: var(--font-sizes-500);
        }
    }
}
</style>
