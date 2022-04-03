<template>
    <router-view class="main-view"></router-view>

    <template v-if="isLoggedIn">
        <user-widget class="user-widget"
            :user="user"
            @select:settings="openSettings()"
            @select:logout="signOut()">
        </user-widget>

        <time-display class="time-display"></time-display>
        <event-tracker class="event-tracker"></event-tracker>

        <icon-button class="views-button" :tooltip="'main menu'" @click="openViewsSelector()">
            <apps />
        </icon-button>
    </template>

    <dialogs-base></dialogs-base>

    <div class="build-versions">
        <span>{{ uiBuildVersion }}</span>
        <span>{{ apiBuildVersion }}</span>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { mapStores } from 'pinia';
import { Apps } from 'mdue';

import { useUserStore } from './stores/user/user.store';
import { useNotificationStore } from './stores/notification/notification.store';
import { useEventStore } from './stores/event/event.store';
import { UserProfile } from './core/models/authentication/user-profile';
import UserWidget from './features/user-widget/user-widget.vue';
import TimeDisplay from './features/time-display/time-display.vue';
import EventTracker from './features/event-tracking/event-tracker/event-tracker.vue';
import IconButton from './shared/buttons/icon-button/icon-button.vue';
import DialogsBase from './shared/dialogs/dialogs-base/dialogs-base.vue';

@Options({
    components: {
        Apps,
        UserWidget,
        TimeDisplay,
        EventTracker,
        IconButton,
        DialogsBase
    },
    watch: {
        isWorking(current: boolean): void {
            const store = this.notificationStore as ReturnType<typeof useNotificationStore>;

            if (current) {
                store.showTabNotificationForWork();
            }
            else {
                store.clearTabNotification('working');
            }
        },
        isBreaking(current: boolean): void {
            const store = this.notificationStore as ReturnType<typeof useNotificationStore>;

            if (current) {
                store.showTabNotificationForBreak();
            }
            else {
                store.clearTabNotification('breaking');
            }
        }
    },
    computed: {
        ...mapStores(useUserStore, useNotificationStore, useEventStore)
    }
})
export default class App extends Vue {
    public notificationStore!: ReturnType<typeof useNotificationStore>;
    private userStore!: ReturnType<typeof useUserStore>;
    private eventStore!: ReturnType<typeof useEventStore>;

    get isLoggedIn(): boolean {
        return this.userStore.isLoggedIn && this.$route.name !== 'login';
    }

    get user(): UserProfile | null {
        return this.userStore.profile;
    }

    get isWorking(): boolean {
        return this.eventStore.isWorking;
    }

    get isBreaking(): boolean {
        return this.eventStore.isBreaking;
    }

    /* istanbul ignore next */
    get uiBuildVersion(): string {
        return `UI_BUILD ${process.env.VUE_APP_UI_BUILD_VERSION}`;
    }

    /* istanbul ignore next */
    get apiBuildVersion(): string {
        return `API_BUILD ${process.env.VUE_APP_API_BUILD_VERSION}`;
    }

    public openViewsSelector(): void {
        this.$router.push('/views');
    }

    public openSettings(): void {
        this.$router.push('/settings');
    }

    public signOut(): void {
        this.userStore.signOut();
    }
}
</script>

<style lang="scss">
@import './styles/presets.scss';
@import './styles/animations.scss';

@font-face {
    font-family: 'Jost';
    src: url('./assets/fonts/Jost-Regular.ttf');
}

$border-gap: 1.5vh;
$content-top: 15vh;

html, body, #app {
    box-sizing: border-box;
    position: relative;
    margin: 0;
    padding: 0;
    width: 100vw;
    height: 100vh;
    font-family: 'Jost';
    user-select: none;
}

#app {
    @include flex-column(center);
    background-color: var(--primary-colors-10-00);
}

.main-view {
    position: absolute;
    top: $content-top;
    left: 0;
    width: 100vw;
    height: calc(100vh - #{$content-top});
}

.event-tracker {
    position: absolute;
    top: calc(#{$content-top} + 1.5vh);
    right: 20vw;
    height: 5vh;
    @include animate-property(opacity, 0, 1, 0.4s, 1.5s);
}

.user-widget {
    position: absolute;
    top: $border-gap;
    left: $border-gap;
}

.time-display {
    position: absolute;
    top: $border-gap;
    right: $border-gap;
}

.views-button.icon-button-container {
    position: absolute;
    bottom: $border-gap;
    width: 5vh;
    height: 5vh;
    background-color: var(--context-colors-info-7-00);
    font-size: var(--font-sizes-600);
    transition: box-shadow 0.3s, background-color 0.3s, color 0.3s;

    &:hover {
        box-shadow: 0 0 7px 2px var(--context-colors-info-6-03);
        background-color: var(--context-colors-info-6-00);
        color: var(--font-colors-0-00);
    }
}

.build-versions {
    @include flex-column(flex-end, center);
    z-index: 9999;
    position: absolute;
    bottom: 0.5vh;
    right: 0.5vh;
    color: var(--font-colors-4-00);
    font-size: var(--font-sizes-100);
}
</style>
