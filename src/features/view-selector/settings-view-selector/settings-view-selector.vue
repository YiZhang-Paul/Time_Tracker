<template>
    <div class="settings-view-selector-container" :class="{ hovered: isHovered }" @mouseover="isHovered = true">
        <div class="background">
            <cog-outline class="icon" />
            <div class="glare top-right"></div>
            <div class="glare bottom-left"></div>
        </div>

        <div class="user-profile">
            <div class="avatar" :style="{ 'background-image': `url(${avatarUrl})` }"></div>

            <div class="information">
                <span>{{ displayName }}</span>
                <span>{{ email }}</span>
            </div>
        </div>

        <flat-button class="edit-button">Edit Settings</flat-button>
        <div class="label">settings</div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { mapStores } from 'pinia';
import { CogOutline } from 'mdue';

import { useUserStore } from '../../../stores/user/user.store';
import FlatButton from '../../../shared/buttons/flat-button/flat-button.vue';

@Options({
    components: {
        CogOutline,
        FlatButton
    },
    computed: {
        ...mapStores(useUserStore)
    }
})
export default class SettingsViewSelector extends Vue {
    public isHovered = false;
    private userStore!: ReturnType<typeof useUserStore>;

    get avatarUrl(): string {
        return this.userStore.profile?.avatarUrl ?? require('../../../assets/images/avatar_placeholder.png');
    }

    get displayName(): string {
        return this.userStore.profile?.displayName ?? '';
    }

    get email(): string {
        return this.userStore.profile?.email ?? '';
    }
}
</script>

<style lang="scss" scoped>
.settings-view-selector-container {
    @import '../../../styles/presets.scss';
    @import '../../../styles/animations.scss';

    @include flex-column(center, center);
    position: relative;
    overflow: hidden;
    color: var(--font-colors-1-00);

    &:hover {
        cursor: pointer;

        .edit-button, .background .glare {
            display: initial;
        }

        .label {
            display: none;
        }
    }

    .background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        color: var(--font-colors-0-01);
        font-size: var(--font-sizes-2000);

        .glare {
            display: none;
            position: absolute;
            border-radius: 200px;
            @include animate-property(opacity, 0, 1, 0.6s, 0.1s);

            &.top-right {
                left: -10%;
                right: -30%;
                top: -160%;
                bottom: 15%;
                transform: rotate(-55deg);

                background: radial-gradient(
                    50% 50% at 50% 50%,
                    var(--item-type-colors-interruption-0-05) 0%,
                    transparent 100%
                );
            }

            &.bottom-left {
                left: -75%;
                right: 35%;
                top: -60%;
                bottom: -165%;
                transform: rotate(-10deg);

                background: radial-gradient(
                    50% 50% at 50% 50%,
                    var(--item-type-colors-task-0-05) 0%,
                    transparent 100%
                );
            }
        }

        .icon {
            position: absolute;
            top: -15%;
            right: -10%;
        }
    }

    .user-profile {
        @include flex-row(center, center);

        .avatar {
            width: 7.5vh;
            height: 7.5vh;
            background-repeat: no-repeat;
            background-position: center center;
            background-size: contain;
            @include animate-property(opacity, 0, 1, 0.6s, 0.2s);
        }

        .information {
            @include flex-column();
            margin-left: 1.5vh;
            @include animate-property(opacity, 0, 1, 0.4s, 0.4s);

            span:first-of-type {
                margin-bottom: 0.5vh;
                font-size: var(--font-sizes-500);
            }

            span:last-of-type {
                color: var(--font-colors-3-00);
                font-size: var(--font-sizes-300);
            }
        }
    }

    .edit-button {
        display: none;
        margin-top: 2vh;
        padding-left: 3.75vh;
        padding-right: 3.75vh;
        border-radius: 25px;
        box-shadow: 0 0 10px 3px var(--context-colors-info-6-03);
        background-color: var(--context-colors-info-6-00);
        @include animate-property(opacity, 0, 1, 0.4s, 0.2s);
    }

    .label {
        @include flex-row(center, center);
        position: absolute;
        right: 0;
        bottom: 0;
        padding: 0.5vh 1.75vh;
        border-top-left-radius: 10px;
        box-shadow: 0 0 5px 2px var(--context-colors-info-6-03);
        background-color: var(--context-colors-info-7-00);
        font-size: var(--font-sizes-300);
        @include animate-property(opacity, 0, 1, 0.4s, 1s);
    }
}
</style>
