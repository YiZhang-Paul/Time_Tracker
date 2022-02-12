<template>
    <div v-if="data" class="confirmation-dialog-container">
        <div class="title">
            <alert class="icon" />
            <span>{{ data.title }}</span>
        </div>

        <div class="actions">
            <flat-button v-if="data.cancelText" class="cancel-button" @click="$emit('cancel')">
                {{ data.cancelText }}
            </flat-button>

            <raised-button class="confirm-button"
                :class="confirmButtonClasses"
                @click="$emit('confirm', data.data)">

                {{ data.confirmText }}
            </raised-button>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component';
import { Alert } from 'mdue';

import { ConfirmationDialogOption } from '../../../core/models/options/confirmation-dialog-option';
import { ClassConfigs } from '../../../core/models/generic/class-configs';
import { ButtonType } from '../../../core/enums/button-type.enum';
import FlatButton from '../../buttons/flat-button/flat-button.vue';
import RaisedButton from '../../buttons/raised-button/raised-button.vue';

class ConfirmationDialogProp {
    public data = prop<ConfirmationDialogOption<unknown>>({ default: new ConfirmationDialogOption<unknown>() });
}

@Options({
    components: {
        Alert,
        FlatButton,
        RaisedButton
    },
    emits: [
        'cancel',
        'confirm'
    ]
})
export default class ConfirmationDialog extends Vue.with(ConfirmationDialogProp) {
    get confirmButtonClasses(): ClassConfigs {
        return {
            confirm: this.data.type === ButtonType.Confirm,
            warning: this.data.type === ButtonType.Warning
        };
    }
}
</script>

<style lang="scss" scoped>
.confirmation-dialog-container {
    @import '../../../styles/presets.scss';
    @import '../../../styles/animations.scss';

    @include flex-column(center, center);
    color: var(--font-colors-0-00);
    font-size: var(--font-sizes-600);

    .title {
        @include flex-row(center, center);
        @include animate-opacity(0, 1, 0.3s, 0.2s);

        .icon {
            margin-right: 12px;
            font-size: var(--font-sizes-700);
        }
    }

    .actions {
        @include flex-row(center, flex-end);
        margin-top: 5vh;
        width: 90%;
        font-size: var(--font-sizes-500);
        @include animate-opacity(0, 1, 0.3s, 0.5s);

        .cancel-button {
            background-color: transparent;
            color: var(--font-colors-3-00);
            transition: color 0.3s;

            &:hover {
                color: var(--font-colors-0-00);
            }
        }

        .confirm-button {
            margin-left: 12px;

            &:hover ::v-deep(.content-wrapper) {
                background-color: var(--primary-colors-7-00);
            }

            ::v-deep(.content-wrapper) {
                background-color: var(--primary-colors-8-00);
            }

            &.confirm:hover ::v-deep(.content-wrapper) {
                background-color: var(--context-colors-info-0-00);
            }

            &.confirm ::v-deep(.content-wrapper) {
                background-color: var(--context-colors-info-1-00);
            }

            &.warning:hover ::v-deep(.content-wrapper) {
                background-color: var(--context-colors-warning-0-00);
            }

            &.warning ::v-deep(.content-wrapper) {
                background-color: var(--context-colors-warning-1-00);
            }
        }
    }
}
</style>
