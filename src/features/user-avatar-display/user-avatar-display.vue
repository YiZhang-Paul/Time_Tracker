<template>
    <div v-if="user" class="user-avatar-display-container">
        <div class="avatar" :style="{ 'background-image': `url(${avatarUrl})` }"></div>

        <div class="information">
            <div class="name">
                <span>{{ displayName }}</span>

                <icon-button class="logout-button"
                    :tooltip="'logout'"
                    :tooltipPosition="'right'"
                    @click="$emit('logout')">

                    <logout-variant />
                </icon-button>
            </div>

            <span class="email">{{ email }}</span>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { LogoutVariant } from 'mdue';

import { UserProfile } from '../../core/models/authentication/user-profile';
import IconButton from '../../shared/buttons/icon-button/icon-button.vue';

class UserAvatarDisplayProp {
    public user = prop<UserProfile>({ default: null });
}

@Options({
    components: {
        LogoutVariant,
        IconButton
    },
    emits: [
        'logout'
    ]
})
export default class UserAvatarDisplay extends Vue.with(UserAvatarDisplayProp) {
    get avatarUrl(): string {
        return this.user.avatarUrl ?? require('../../assets/images/avatar_placeholder.png');
    }

    get displayName(): string {
        return this.user.displayName;
    }

    get email(): string {
        return this.user.email;
    }
}
</script>

<style lang="scss" scoped>
.user-avatar-display-container {
    @import '../../styles/presets.scss';
    @import '../../styles/animations.scss';

    @include flex-row(center, center);
    color: var(--font-colors-1-00);

    .avatar {
        min-width: 6vh;
        min-height: 6vh;
        background-repeat: no-repeat;
        background-position: center center;
        background-size: contain;
        @include animate-property(opacity, 0, 1, 0.6s, 0.2s);
    }

    .information {
        @include flex-column();
        margin-left: 1vh;
        @include animate-property(opacity, 0, 1, 0.4s, 0.4s);

        .name {
            @include flex-row(center);
            margin-bottom: 0.25vh;
            font-size: var(--font-sizes-400);

            span {
                max-width: 15vh;
                @include line-overflow();
            }

            .logout-button {
                margin-left: 0.75vh;
                transition: background-color 0.3s;

                &:hover {
                    background-color: var(--primary-colors-4-00);
                }
            }
        }

        .email {
            color: var(--font-colors-3-00);
            font-size: var(--font-sizes-200);
        }
    }
}
</style>
