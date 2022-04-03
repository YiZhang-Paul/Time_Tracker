<template>
    <div class="settings-container">
        <div class="header">
            <div class="title">
                <cog class="icon" />
                <span>Settings & Personalization</span>
            </div>
        </div>

        <div class="separator"></div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { Cog } from 'mdue';

import { UserProfile } from '../../core/models/authentication/user-profile';
import FlatButton from '../../shared/buttons/flat-button/flat-button.vue';

@Options({
    components: {
        Cog,
        FlatButton
    }
})
export default class Settings extends Vue { }
</script>

<style lang="scss" scoped>
.settings-container {
    @import '../../styles/presets.scss';
    @import '../../styles/animations.scss';

    $content-width: 65%;

    @include flex-column(center);
    color: var(--font-colors-1-00);
    font-size: var(--font-sizes-500);

    .header {
        @include flex-row(flex-start, center);
        width: $content-width;
        height: 15%;
        @include animate-property(opacity, 0, 1, 0.3s, 0.3s);

        .title {
            @include flex-row(center);
            height: 60%;
            font-size: var(--font-sizes-700);

            .icon {
                margin-right: 1vh;
                font-size: var(--font-sizes-750);
            }
        }
    }

    .separator {
        width: $content-width;
        height: 1px;
        @include animate-property(opacity, 0, 1, 0.3s, 0.2s);

        background: linear-gradient(
            90deg,
            var(--font-colors-0-01) 0%,
            var(--font-colors-0-03) 50%,
            var(--font-colors-0-01) 100%
        );
    }
}
</style>
