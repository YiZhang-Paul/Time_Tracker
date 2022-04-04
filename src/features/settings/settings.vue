<template>
    <div v-if="profile" class="settings-container">
        <div class="header">
            <div class="title">
                <cog class="icon" />
                <span>Settings & Personalization</span>
            </div>

            <div class="actions-wrapper">
                <flat-button class="save-button" :isDisabled="!canSave" @click="onSave()">
                    <cloud-upload v-if="!isSaved" class="icon" />
                    <span v-if="isSaved">Saved</span>
                    <span v-if="!isSaved">Save</span>
                </flat-button>
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
import { Account, At, CloudUpload, Cog } from 'mdue';

import { useUserStore } from '../../stores/user/user.store';
import { IconConfig } from '../../core/models/generic/icon-config';
import { UserProfile } from '../../core/models/user/user-profile';
import FlatButton from '../../shared/buttons/flat-button/flat-button.vue';
import FormInput from '../../shared/inputs/form-input/form-input.vue';

@Options({
    components: {
        CloudUpload,
        Cog,
        FlatButton,
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

    get canSave(): boolean {
        return !this.isSaved && Boolean(this.profile.displayName.trim());
    }

    public created(): void {
        if (this.userStore.profile) {
            this.profile = JSON.parse(JSON.stringify(this.userStore.profile));
        }
    }

    public onNameChange(name: string): void {
        this.profile.displayName = name.trim();
        this.isSaved = false;
    }

    public async onSave(): Promise<void> {
        this.isSaved = await this.userStore.updateProfile(this.profile);
    }
}
</script>

<style lang="scss" scoped>
.settings-container {
    @import '../../styles/presets.scss';
    @import '../../styles/animations.scss';

    $content-width: 56.5%;

    @include flex-column(center);
    color: var(--font-colors-1-00);
    font-size: var(--font-sizes-500);

    .header {
        @include flex-column(center, center);
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

        .actions-wrapper {
            @include flex-row(center, flex-end);
            box-sizing: border-box;
            padding-bottom: 1.5vh;
            width: 100%;
            height: 40%;

            .save-button {
                margin-right: 1vh;
                height: 3vh;
                color: var(--font-colors-3-00);
                font-size: var(--font-sizes-200);
                transition: all 0.3s;

                &:not(.disabled) {
                    background-color: var(--context-colors-info-1-00);
                    box-shadow: 0 0 6px 1px var(--context-colors-info-1-03);
                    color: var(--font-colors-0-00);

                    &:hover {
                        background-color: var(--context-colors-info-0-00);
                        box-shadow: 0 0 6px 2px var(--context-colors-info-0-03);
                    }
                }

                &.disabled {
                    background-color: transparent;
                }

                .icon, span {
                    @include animate-property(opacity, 0, 1, 0.3s);
                }

                .icon {
                    margin-right: 0.75vh;
                    font-size: var(--font-sizes-400);
                }
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

            &:first-of-type {
                margin-top: 3.5vh;
            }

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
