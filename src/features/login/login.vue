<template>
    <div class="login-container">
        <div class="login-panel">

        </div>
    </div>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';

export default class Login extends Vue { }
</script>

<style lang="scss" scoped>
.login-container {
    @import '../../styles/presets.scss';
    @import '../../styles/animations.scss';

    @include flex-column(center);
    z-index: 999;

    .login-panel {
        width: 65%;
        height: 87.5%;
        border-radius: 15px;
        box-shadow: 0 0 4px 1px rgba(0, 0, 0, 0.25);
        @include animate-property(opacity, 0, 1, 0.75s);
    }
}
</style>
