<template>
    <div v-if="profile" class="settings-container">
        <div class="header">
            <div class="title">
                <cog class="icon" />
                <span>Settings & Personalization</span>
            </div>
        </div>

        <div class="separator"></div>

        <div class="content">
            <div class="entry">
                <span class="type">Email <span class="readonly">(readonly)</span></span>

                <form-input class="form-input"
                    :modelValue="profile.email"
                    :icon="emailIcon"
                    :isReadonly="true">
                </form-input>
            </div>

            <div class="entry">
                <span class="type">Nick Name</span>

                <form-input class="form-input"
                    :modelValue="profile.displayName"
                    :icon="nameIcon"
                    :maxLength="25"
                    :placeholder="'type here...'"
                    :validator="_ => _?.trim() ? '' : 'name must not be empty'"
                    @update:modelValue="onNameChange($event)">
                </form-input>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { markRaw } from '@vue/reactivity';
import { Options, Vue } from 'vue-class-component';
import { mapStores } from 'pinia';
import { Account, At, Cog } from 'mdue';

import { useUserStore } from '../../stores/user/user.store';
import { IconConfig } from '../../core/models/generic/icon-config';
import { UserProfile } from '../../core/models/authentication/user-profile';
import FormInput from '../../shared/inputs/form-input/form-input.vue';

@Options({
    components: {
        Cog,
        FormInput
    },
    computed: {
        ...mapStores(useUserStore)
    }
})
export default class Settings extends Vue {
    public readonly nameIcon = new IconConfig(markRaw(Account), 'var(--font-colors-7-00)');
    public readonly emailIcon = new IconConfig(markRaw(At), 'var(--font-colors-7-00)');
    public profile!: UserProfile;
    public isSaved = true;
    private userStore!: ReturnType<typeof useUserStore>;

    public created(): void {
        if (this.userStore.profile) {
            this.profile = JSON.parse(JSON.stringify(this.userStore.profile));
        }
    }

    public onNameChange(name: string): void {
        this.profile.displayName = name.trim();
        this.isSaved = false;
    }
}
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

    .content {
        @include flex-column(center);
        width: 100%;
        height: 85%;
        @include animate-property(opacity, 0, 1, 0.3s, 0.5s);

        .entry {
            @include flex-row(center);
            margin-top: 1.5vh;

            .type {
                margin-right: 2.5vw;
                margin-bottom: 1vh;
                width: 7.5vw;
                align-self: flex-end;
                text-align: right;

                .readonly {
                    color: var(--font-colors-3-00);
                    font-size: var(--font-sizes-400);
                }
            }

            .form-input {
                width: 17.5vw;
            }
        }
    }
}
</style>
