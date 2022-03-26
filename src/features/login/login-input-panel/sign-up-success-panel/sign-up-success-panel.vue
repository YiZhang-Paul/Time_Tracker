<template>
    <div class="sign-up-success-panel-container">
        <div class="success-icon"><check /></div>

        <div class="actions">
            <span class="confirmation">We've just sent a message to your email.</span>

            <div class="sign-in-message">
                <span>Hit the verification link and</span>
                <a @click="$emit('select:signIn')">sign in</a>
                <span>!</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { Check } from 'mdue';

@Options({
    components: {
        Check
    },
    emits: [
        'select:signIn'
    ]
})
export default class SignUpSuccessPanel extends Vue { }
</script>

<style lang="scss" scoped>
.sign-up-success-panel-container {
    @import '../../../../styles/presets.scss';
    @import '../../../../styles/animations.scss';

    @include flex-column(center, center);
    @include animate-property(opacity, 0, 1, 0.4s, 0.4s);

    .success-icon {
        @include flex-column(center, center);
        min-width: 5vh;
        min-height: 5vh;
        border-radius: 50%;
        background-color: var(--context-colors-success-2-00);
        color: var(--font-colors-1-00);
        font-size: var(--font-sizes-700);
        @include animate-property(opacity, 0, 1, 0.3s, 0.6s);
    }

    .actions {
        @include flex-column(center);
        margin-top: 2.5vh;
        width: 100%;
        color: var(--font-colors-1-00);

        .sign-in-message {
            @include flex-row(center);

            a {
                margin-left: 0.5vh;
                text-decoration: underline;
                color: var(--context-colors-success-1-00);
                transition: color 0.3s;

                &:hover {
                    cursor: pointer;
                    color: var(--context-colors-success-0-00);
                }
            }
        }
    }
}
</style>
