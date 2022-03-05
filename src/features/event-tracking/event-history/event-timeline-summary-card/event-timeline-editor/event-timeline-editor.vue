<template>
    <div v-if="option" class="event-timeline-editor-container">
        <div class="basic-inputs">
            <tab-group v-model="typeOptions" class="type-group"></tab-group>

            <div class="time-range">
                <span>from</span>
                <div>{{ start }}</div>
                <span>to</span>
                <div>{{ end }}</div>
            </div>

            <div class="target">
                <component class="icon" :is="icon.component" :style="{ color: icon.color }"></component>
                <span>{{ name }}</span>
            </div>
        </div>

        <flat-button class="confirm-button" :isDisabled="true">Confirm</flat-button>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';

import { IconConfig } from '../../../../../core/models/generic/icon-config';
import { ActionGroupOption } from '../../../../../core/models/options/action-group-option';
import { EventTimelineEditorOption } from '../../../../../core/models/options/event-timeline-editor-option';
import { EventType } from '../../../../../core/enums/event-type.enum';
import { IconUtility } from '../../../../../core/utilities/icon-utility/icon-utility';
import { TimeUtility } from '../../../../../core/utilities/time-utility/time-utility';
import FlatButton from '../../../../../shared/buttons/flat-button/flat-button.vue';
import TabGroup from '../../../../../shared/inputs/tab-group/tab-group.vue';

class EventTimelineEditorProp {
    public option = prop<EventTimelineEditorOption>({ default: null });
}

@Options({
    components: {
        FlatButton,
        TabGroup
    }
})
export default class EventTimelineEditor extends Vue.with(EventTimelineEditorProp) {
    public editingOption!: EventTimelineEditorOption;
    public typeOptions: ActionGroupOption[] = [];

    private readonly icons = {
        [EventType.Idling]: IconUtility.getIdlingTypeIcon(),
        [EventType.Break]: IconUtility.getBreakTypeIcon(),
        [EventType.Interruption]: IconUtility.getInterruptionTypeIcon(),
        [EventType.Task]: IconUtility.getTaskTypeIcon()
    };

    get start(): string {
        return TimeUtility.getTimeString(this.editingOption.start, false);
    }

    get end(): string {
        return TimeUtility.getTimeString(this.editingOption.end, false);
    }

    get icon(): IconConfig {
        return this.icons[this.editingOption.eventType];
    }

    get name(): string {
        const { name, eventType } = this.editingOption;

        if (eventType !== EventType.Idling && eventType !== EventType.Break) {
            return name;
        }

        return eventType === EventType.Idling ? 'Untracked' : 'Break';
    }

    public created(): void {
        if (!this.option) {
            return;
        }

        this.editingOption = { ...this.option };
        const { eventType } = this.editingOption;

        this.typeOptions = [
            new ActionGroupOption('', IconUtility.getIdlingTypeIcon(), null, eventType === EventType.Idling),
            new ActionGroupOption('', IconUtility.getBreakTypeIcon(), null, eventType === EventType.Break),
            new ActionGroupOption('', IconUtility.getInterruptionTypeIcon(), null, eventType === EventType.Interruption),
            new ActionGroupOption('', IconUtility.getTaskTypeIcon(), null, eventType === EventType.Task)
        ];
    }
}
</script>

<style lang="scss" scoped>
.event-timeline-editor-container {
    @import '../../../../../styles/presets.scss';
    @import '../../../../../styles/animations.scss';

    @include flex-column(center, space-between);
    box-sizing: border-box;
    padding: 1.5vh;
    border-radius: 10px;
    box-shadow: 0 0 4px 2px rgba(0, 0, 0, 0.25);
    background-color: var(--primary-colors-9-00);
    font-size: var(--font-sizes-300);

    .basic-inputs {
        @include flex-row(center);
        margin-left: 1.5%;
        width: 100%;
        @include animate-property(opacity, 0, 1, 0.3s, 0.2s);

        .time-range {
            @include flex-row(center);
            margin-left: 3.5%;

            span:not(:first-of-type) {
                margin-left: 1vh;
            }

            div {
                padding: 3px 10px;
                margin-left: 0.75vh;
                border-radius: 25px;
                background-color: var(--primary-colors-6-00);
            }
        }

        .target {
            @include flex-row(center);
            padding: 3px 10px;
            margin-left: 3.5%;
            border-radius: 25px;
            background-color: var(--primary-colors-6-00);

            .icon {
                font-size: var(--font-sizes-400);
            }

            span {
                margin-left: 0.5vh;
                max-width: 15vw;
                @include line-overflow();
            }
        }
    }

    .confirm-button {
        align-self: flex-end;
        @include animate-property(opacity, 0, 1, 0.3s, 0.2s);

        &:not(.disabled) {
            box-shadow: 0 0 5px 2px var(--context-colors-success-1-03);
            background-color: var(--context-colors-success-1-00);
        }
    }
}
</style>
