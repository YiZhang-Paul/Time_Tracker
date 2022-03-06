<template>
    <div class="event-selector-container" :class="{ trigger: canOpenSelector }" @click="openSelector()">
        <div v-if="!showSelector" class="selected">
            <component v-if="name"
                class="icon"
                :is="icon.component"
                :style="{ color: icon.color }">
            </component>

            <span>{{ name ?? '?' }}</span>
        </div>

        <div v-if="showSelector" class="selector">
            <search-box class="search-box" :useCustomStyle="true"></search-box>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';

import { IconConfig } from '../../../../../core/models/generic/icon-config';
import { EventSelection } from '../../../../../core/models/event/event-selection';
import { EventType } from '../../../../../core/enums/event-type.enum';
import { IconUtility } from '../../../../../core/utilities/icon-utility/icon-utility';
import SearchBox from '../../../../../shared/inputs/search-box/search-box.vue';

class EventSelectorProp {
    public selected = prop<EventSelection>({ default: null });
}

@Options({
    components: {
        SearchBox
    },
    emits: [
        'select'
    ]
})
export default class EventSelector extends Vue.with(EventSelectorProp) {
    public showSelector = false;

    private readonly icons = {
        [EventType.Idling]: IconUtility.getIdlingTypeIcon(),
        [EventType.Break]: IconUtility.getBreakTypeIcon(),
        [EventType.Interruption]: IconUtility.getInterruptionTypeIcon(),
        [EventType.Task]: IconUtility.getTaskTypeIcon()
    };

    get icon(): IconConfig {
        return this.icons[this.selected.eventType];
    }

    get canOpenSelector(): boolean {
        return !this.isReadonly && !this.showSelector;
    }

    get isReadonly(): boolean {
        const { eventType } = this.selected;

        return eventType === EventType.Idling || eventType === EventType.Break;
    }

    get name(): string {
        if (!this.isReadonly) {
            return this.selected.name;
        }

        return this.selected.eventType === EventType.Idling ? 'Untracked' : 'Sleep & Break';
    }

    public openSelector(): void {
        if (this.canOpenSelector) {
            this.showSelector = true;
        }
    }
}
</script>

<style lang="scss" scoped>
.event-selector-container {
    @import '../../../../../styles/presets.scss';
    @import '../../../../../styles/animations.scss';

    $selector-width: 15vw;

    &.trigger:hover {
        cursor: pointer;

        .selected {
            color: var(--context-colors-info-0-00);
        }
    }

    .selected {
        @include flex-row(center);
        transition: color 0.3s;

        .icon {
            margin-right: 0.5vh;
            font-size: var(--font-sizes-400);
        }

        span {
            max-width: $selector-width;
            @include line-overflow();
        }
    }

    .selector {
        @include animate-property(width, 5px, $selector-width, 0.5s);

        .search-box {
            font-size: var(--font-sizes-300);

            &::v-deep(input) {
                font-size: var(--font-sizes-300);
            }
        }
    }
}
</style>
