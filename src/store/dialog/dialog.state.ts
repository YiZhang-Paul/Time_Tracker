import { DialogConfig } from '../../core/models/generic/dialog-config';

export interface IState {
    configs: DialogConfig<unknown, unknown>[];
}

export const state = (): IState => ({
    configs: []
});
