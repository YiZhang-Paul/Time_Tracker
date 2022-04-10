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
            <avatar-upload class="avatar-upload"
                :avatarUrl="profile.avatarUrl"
                @change="onAvatarChange($event)">
            </avatar-upload>

            <div class="entry">
                <span class="type">Nick Name</span>

                <form-input class="form-input"
                    ref="nameInput"
                    :modelValue="profile.displayName"
                    :icon="nameIcon"
                    :maxLength="25"
                    :placeholder="'choose a nick name...'"
                    :validator="_ => _?.trim() ? '' : 'name must not be empty'"
                    @update:modelValue="onNameChange($event)">
                </form-input>
            </div>

            <div class="entry">
                <span class="type">Daily Goal <span class="label">(hours)</span></span>

                <form-input class="form-input"
                    ref="dailyGoalInput"
                    :modelValue="dailyWorkDuration"
                    :icon="goalIcon"
                    :type="'number'"
                    :placeholder="'how many hours per day?'"
                    :validator="_ => validateRange(_, 0, 24)"
                    @update:modelValue="onDailyWorkDurationChange($event)">
                </form-input>
            </div>

            <div class="entry">
                <span class="type">Work Session <span class="label">(minutes)</span></span>

                <form-input class="form-input"
                    ref="workSessionDurationInput"
                    :modelValue="workSessionDuration"
                    :icon="workIcon"
                    :type="'number'"
                    :placeholder="'how long per session?'"
                    :validator="_ => validateRange(_, 0, 24 * 60)"
                    @update:modelValue="onWorkSessionDurationChange($event)">
                </form-input>
            </div>

            <div class="entry">
                <span class="type">Break Session <span class="label">(minutes)</span></span>

                <form-input class="form-input"
                    ref="breakSessionDurationInput"
                    :modelValue="breakSessionDuration"
                    :icon="breakIcon"
                    :type="'number'"
                    :placeholder="'how long per session?'"
                    :validator="_ => validateRange(_, 0, 24 * 60)"
                    @update:modelValue="onBreakSessionDurationChange($event)">
                </form-input>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { markRaw } from '@vue/reactivity';
import { Options, Vue } from 'vue-class-component';
import { mapStores } from 'pinia';
import { Account, CloudUpload, Cog, FlagCheckered } from 'mdue';

import { useUserStore } from '../../stores/user/user.store';
import { IconConfig } from '../../core/models/generic/icon-config';
import { UserProfile } from '../../core/models/user/user-profile';
import { TimeUtility } from '../../core/utilities/time-utility/time-utility';
import { IconUtility } from '../../core/utilities/icon-utility/icon-utility';
import FlatButton from '../../shared/buttons/flat-button/flat-button.vue';
import FormInput from '../../shared/inputs/form-input/form-input.vue';

import AvatarUpload from './avatar-upload/avatar-upload.vue';

@Options({
    components: {
        CloudUpload,
        Cog,
        FlatButton,
        FormInput,
        AvatarUpload
    },
    computed: {
        ...mapStores(useUserStore)
    }
})
export default class Settings extends Vue {
    public readonly nameIcon = new IconConfig(markRaw(Account), 'var(--font-colors-7-00)');
    public readonly goalIcon = new IconConfig(markRaw(FlagCheckered), 'var(--font-colors-7-00)');
    public readonly workIcon = IconUtility.getWorkingTypeIcon('var(--font-colors-7-00)');
    public readonly breakIcon = IconUtility.getNotWorkingTypeIcon('var(--font-colors-7-00)');
    public profile!: UserProfile;
    public isSaved = true;
    public canSave = false;
    private avatar: Blob | null = null;
    private userStore!: ReturnType<typeof useUserStore>;

    get dailyWorkDuration(): number {
        const { dailyWorkDuration } = this.profile.timeSessionOptions;

        return TimeUtility.convertTime(dailyWorkDuration, 'millisecond', 'hour');
    }

    get workSessionDuration(): number {
        const { workSessionDuration } = this.profile.timeSessionOptions;

        return TimeUtility.convertTime(workSessionDuration, 'millisecond', 'minute');
    }

    get breakSessionDuration(): number {
        const { breakSessionDuration } = this.profile.timeSessionOptions;

        return TimeUtility.convertTime(breakSessionDuration, 'millisecond', 'minute');
    }

    public created(): void {
        if (this.userStore.profile) {
            this.profile = JSON.parse(JSON.stringify(this.userStore.profile));
        }
    }

    public validateRange(value: number, min: number, max: number): string {
        if (!value.toString()) {
            return 'value must be a number';
        }

        return value >= min && value <= max ? '' : `value must be between ${min} and ${max}`;
    }

    public onAvatarChange(avatar: Blob): void {
        this.avatar = avatar;
        this.isSaved = false;
        this.validateSettings();
    }

    public onNameChange(name: string): void {
        this.profile.displayName = name.trim();
        this.isSaved = false;
        this.validateSettings();
    }

    public onDailyWorkDurationChange(hours: number): void {
        const duration = TimeUtility.convertTime(hours, 'hour', 'millisecond');
        this.profile.timeSessionOptions.dailyWorkDuration = duration;
        this.isSaved = false;
        this.validateSettings();
    }

    public onWorkSessionDurationChange(minutes: number): void {
        const duration = TimeUtility.convertTime(minutes, 'minute', 'millisecond');
        this.profile.timeSessionOptions.workSessionDuration = duration;
        this.isSaved = false;
        this.validateSettings();
    }

    public onBreakSessionDurationChange(minutes: number): void {
        const duration = TimeUtility.convertTime(minutes, 'minute', 'millisecond');
        this.profile.timeSessionOptions.breakSessionDuration = duration;
        this.isSaved = false;
        this.validateSettings();
    }

    public async onSave(): Promise<void> {
        this.isSaved = await this.userStore.updateProfile(this.profile, this.avatar);
        this.canSave = !this.isSaved;

        if (this.isSaved) {
            this.profile = JSON.parse(JSON.stringify(this.userStore.profile));
        }
    }

    private validateSettings(): void {
        const inputs = [
            this.$refs.nameInput,
            this.$refs.dailyGoalInput,
            this.$refs.workSessionDurationInput,
            this.$refs.breakSessionDurationInput
        ] as FormInput[];

        if (this.isSaved || inputs.some(_ => _ && _.isInvalid)) {
            this.canSave = false;
        }
        else {
            this.canSave = Boolean(this.profile.displayName.trim());
        }
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

        .avatar-upload {
            margin-top: 3.5vh;
            width: 30%;
            height: 20%;
        }

        .entry {
            @include flex-row(center);
            margin-top: 1.5vh;

            &:first-of-type {
                margin-top: 3.5vh;
            }

            .type {
                margin-right: 2.5vw;
                margin-bottom: 1vh;
                min-width: 10vw;
                align-self: flex-end;
                text-align: right;

                .label {
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
