import { markRaw } from 'vue';
import { FlashAlert, Food, Lightbulb, MusicNote, ProgressQuestion, Target } from 'mdue';

import { IconConfig } from '../../models/generic/icon-config';

export class IconUtility {
    public static getWorkingTypeIcon(): IconConfig {
        return new IconConfig(markRaw(Lightbulb));
    }

    public static getNotWorkingTypeIcon(): IconConfig {
        return new IconConfig(markRaw(MusicNote));
    }

    public static getIdlingTypeIcon(): IconConfig {
        return new IconConfig(markRaw(ProgressQuestion), 'var(--item-type-colors-idling-0-00)');
    }

    public static getBreakTypeIcon(): IconConfig {
        return new IconConfig(markRaw(Food), 'var(--item-type-colors-break-0-00)');
    }

    public static getInterruptionTypeIcon(): IconConfig {
        return new IconConfig(markRaw(FlashAlert), 'var(--item-type-colors-interruption-0-00)');
    }

    public static getTaskTypeIcon(): IconConfig {
        return new IconConfig(markRaw(Target), 'var(--item-type-colors-task-0-00)');
    }
}
