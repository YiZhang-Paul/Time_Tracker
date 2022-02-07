<template>
    <div v-if="item && type" class="item-editor-base-container">
        <div class="header">
            <input type="text"
                class="name"
                v-model="item.name"
                maxlength="140"
                placeholder="enter title here..." />

            <span v-if="item.modifiedTime" class="modified-time">Updated {{ modifiedTime }}</span>
        </div>

        <div class="content">
            <textarea class="description"
                v-model="item.description"
                placeholder="no descriptions...">
            </textarea>

            <div class="side-panel"></div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';

import { InterruptionItem } from '../../../../core/models/interruption/interruption-item';
import { TaskItem } from '../../../../core/models/task/task-item';
import { EventType } from '../../../../core/enums/event-type.enum';
import { TimeUtility } from '../../../../core/utilities/time-utility/time-utility';

class ItemEditorBaseProp {
    public item = prop<InterruptionItem & TaskItem>({ default: null });
    public type = prop<EventType>({ default: null });
}

@Options({

})
export default class ItemEditorBase extends Vue.with(ItemEditorBaseProp) {
    get modifiedTime(): string {
        return TimeUtility.getDateTimeString(new Date(this.item.modifiedTime));
    }
}
</script>

<style lang="scss" scoped>
.item-editor-base-container {
    @import '../../../../styles/presets.scss';

    $border-radius: 5px;

    @include flex-column(center, space-between);
    box-sizing: border-box;
    padding: 1.5vh;
    border-radius: $border-radius;
    background-color: var(--primary-colors-9-00);
    box-shadow: 0 0 6px 1px rgba(0, 0, 0, 0.35);

    .header {
        @include flex-column(initial, center);
        width: 100%;
        height: 12.5%;

        .name {
            width: 75%;
            border: none;
            outline: none;
            background-color: transparent;
            color: var(--font-colors-0-00);
            font-size: var(--font-sizes-500);
            font-family: inherit;
        }

        .modified-time {
            margin-top: 0.15rem;
            margin-left: 0.15rem;
            color: var(--font-colors-4-00);
            font-size: var(--font-sizes-300);
        }
    }

    .content {
        $description-width: 70%;

        @include flex-row(initial, center);
        box-sizing: border-box;
        width: 100%;
        height: 75%;

        .description, .side-panel {
            height: 100%;
            border-radius: $border-radius;
            background-color: var(--primary-colors-10-00);
        }

        .description {
            box-sizing: border-box;
            padding: 1vh;
            width: $description-width;
            border: none;
            outline: none;
            resize: none;
            color: var(--font-colors-0-00);
            font-size: inherit;
            font-family: inherit;
        }

        .side-panel {
            margin-left: 1.5vh;
            width: calc(100% - #{$description-width});
        }
    }
}
</style>
