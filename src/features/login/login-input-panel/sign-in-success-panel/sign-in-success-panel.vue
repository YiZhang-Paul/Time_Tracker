<template>
    <div class="sign-in-success-panel-container">
        <div class="avatar">
            <img src="../../../../assets/images/avatar_placeholder.png" />
        </div>

        <div class="fill"></div>
        <span>Welcome back,</span>
        <div class="name">{{ name }}</div>
        <loading-spinner class="spinner"></loading-spinner>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

import { types } from '../../../../core/ioc/types';
import { container } from '../../../../core/ioc/container';
import { AuthenticationService } from '../../../../core/services/authentication/authentication.service';
import LoadingSpinner from '../../../../shared/indicators/loading-spinner/loading-spinner.vue';

@Options({
    components: {
        LoadingSpinner
    },
    emits: [
        'finished'
    ]
})
export default class SignInSuccessPanel extends Vue {
    private readonly authenticationService = container.get<AuthenticationService>(types.AuthenticationService);

    get name(): string {
        return this.authenticationService.profile!.displayName;
    }

    public mounted(): void {
        setTimeout(() => this.$emit('finished'), 4000);
    }
}
</script>

<style lang="scss" scoped>
.sign-in-success-panel-container {
    @import '../../../../styles/presets.scss';
    @import '../../../../styles/animations.scss';

    @include flex-column(center, space-between);
    box-sizing: border-box;
    color: var(--font-colors-0-00);
    font-size: var(--font-sizes-700);
    @include animate-property(opacity, 0, 1, 0.5s, 0.5s);

    .avatar {
        $dimension: 22.5vh;

        @include flex-column(center, center);
        margin-top: 10%;
        width: $dimension;
        min-width: $dimension;
        height: $dimension;
        min-height: $dimension;
        border-radius: 50%;
        overflow: hidden;

        img {
            width: 100%;
            height: 100%;
        }
    }

    .fill {
        height: 100%;
    }

    .name {
        @include flex-column(center, center);
        padding: 0.75vh 2vh;
        margin-top: 1.25vh;
        border-radius: 5px;
        box-shadow: 0 0 5px 2px var(--context-colors-suggestion-1-03);
        background-color: var(--context-colors-suggestion-0-00);
        color: var(--font-colors-9-00);
        font-size: var(--font-sizes-500);
    }

    .spinner {
        margin-top: 10%;
        margin-bottom: 22.5%;
        @include animate-property(opacity, 0, 1, 0.4s, 2s);
    }
}
</style>
