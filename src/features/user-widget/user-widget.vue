<template>
    <div v-if="user" class="user-widget-container">
        <div class="avatar" :style="{ 'background-image': `url(${avatarUrl})` }"></div>

        <div class="content">
            <span class="name">{{ displayName }}</span>

            <div class="actions">
                <icon-button class="action-button" :tooltip="'settings'" @click="$emit('select:settings')">
                    <cog />
                </icon-button>

                <icon-button class="action-button" :tooltip="'logout'" @click="$emit('select:logout')">
                    <logout-variant />
                </icon-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { Cog, LogoutVariant } from 'mdue';

import { UserProfile } from '../../core/models/user/user-profile';
import IconButton from '../../shared/buttons/icon-button/icon-button.vue';

class UserWidgetProp {
    public user = prop<UserProfile>({ default: null });
}

@Options({
    components: {
        Cog,
        LogoutVariant,
        IconButton
    },
    emits: [
        'select:settings',
        'select:logout'
    ]
})
export default class UserWidget extends Vue.with(UserWidgetProp) {
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
.user-widget-container {
    @import '../../styles/presets.scss';
    @import '../../styles/animations.scss';

    @include flex-row(center, center);
    color: var(--font-colors-1-00);

    .avatar {
        min-width: 6vh;
        min-height: 6vh;
        border-radius: 50%;
        background-repeat: no-repeat;
        background-position: center center;
        background-size: contain;
        @include animate-property(opacity, 0, 1, 0.6s, 0.2s);
    }

    .content {
        @include flex-column();
        margin-left: 1vh;
        @include animate-property(opacity, 0, 1, 0.4s, 0.4s);

        .name {
            margin-bottom: 0.5vh;
            max-width: 15vh;
            @include line-overflow();
            font-size: var(--font-sizes-300);
        }

        .actions {
            @include flex-row(center);

            .action-button {
                transition: background-color 0.3s;

                &:hover {
                    background-color: var(--primary-colors-4-00);
                }

                &:first-of-type {
                    margin-right: 0.75vh;
                    @include animate-property(opacity, 0, 1, 0.2s, 0.8s);
                }

                &:last-of-type {
                    @include animate-property(opacity, 0, 1, 0.2s, 0.9s);
                }
            }
        }
    }
}
</style>
