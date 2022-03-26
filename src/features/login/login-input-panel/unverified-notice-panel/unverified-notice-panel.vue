<template>
    <div class="unverified-notice-panel-container">
        <shield-alert class="alert-icon" />

        <div class="actions">
            <span>A message with verification link was sent to you.</span>

            <div class="resend-verification">
                <span>Didn't get the message?</span>
                <a @click="onResend()">Resend message</a>
            </div>

            <div class="sign-in-message">
                <span>Once verified, you can</span>
                <a @click="$emit('select:signIn')">sign in</a>
                <span>right away!</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { ShieldAlert } from 'mdue';

import { types } from '../../../../core/ioc/types';
import { container } from '../../../../core/ioc/container';
import { AuthenticationService } from '../../../../core/services/authentication/authentication.service';

@Options({
    components: {
        ShieldAlert
    },
    emits: [
        'select:signIn'
    ]
})
export default class UnverifiedNoticePanel extends Vue {
    private readonly authenticationService = container.get<AuthenticationService>(types.AuthenticationService);

    public async onResend(): Promise<void> {
        await this.authenticationService.sendVerification(this.authenticationService.idToken);
    }
}
</script>

<style lang="scss" scoped>
.unverified-notice-panel-container {
    @import '../../../../styles/presets.scss';
    @import '../../../../styles/animations.scss';

    @include flex-column(center, center);
    @include animate-property(opacity, 0, 1, 0.4s, 0.4s);

    a {
        text-decoration: underline;

        &:hover {
            cursor: pointer;
        }
    }

    .alert-icon {
        color: var(--context-colors-suggestion-0-00);
        font-size: var(--font-sizes-750);
        @include animate-property(opacity, 0, 1, 0.3s, 0.6s);
    }

    .actions {
        @include flex-column(center);
        margin-top: 2.5vh;
        width: 100%;
        color: var(--font-colors-1-00);

        .resend-verification {
            @include flex-row(center);

            a {
                margin-left: 0.5vh;
                color: var(--context-colors-suggestion-0-00);
            }
        }

        .sign-in-message {
            @include flex-row(center);
            margin-top: 22.5%;

            a {
                margin: 0 0.5vh;
            }
        }
    }
}
</style>
