import { ActionContext, ActionTree } from 'vuex';

import { InterruptionItem } from '../../core/models/interruption/interruption-item';
import { InterruptionItemHttpService } from '../../core/services/http/interruption-item-http/interruption-item-http.service';

import { IState } from './interruption.state';
import { Mutations, MutationKey } from './interruption.mutations';

let interruptionItemHttpService: InterruptionItemHttpService;

export const setActionServices = (interruptionItemHttp: InterruptionItemHttpService): void => {
    interruptionItemHttpService = interruptionItemHttp;
};

export enum ActionKey {
    LoadInterruptionSummaries = 'load_interruption_summaries',
    CreateInterruptionItem = 'create_interruption_item',
    StartInterruptionItemCreation = 'start_interruption_item_creation',
    StartInterruptionItemEdit = 'start_interruption_item_edit',
    EndInterruptionItemEdit = 'end_interruption_item_edit'
}

interface ActionAugments extends Omit<ActionContext<IState, IState>, 'commit'> {
    commit<T extends keyof Mutations>(key: T, payload: Parameters<Mutations[T]>[1]): ReturnType<Mutations[T]>;
}

export type Actions = {
    [ActionKey.LoadInterruptionSummaries](context: ActionAugments): Promise<void>;
    [ActionKey.CreateInterruptionItem](context: ActionAugments, payload: InterruptionItem): Promise<boolean>;
    [ActionKey.StartInterruptionItemCreation](context: ActionAugments): void;
    [ActionKey.StartInterruptionItemEdit](context: ActionAugments, payload: number): Promise<boolean>;
    [ActionKey.EndInterruptionItemEdit](context: ActionAugments): void;
}

export const actions: ActionTree<IState, IState> & Actions = {
    async [ActionKey.LoadInterruptionSummaries](context: ActionAugments): Promise<void> {
        context.commit(MutationKey.SetSummaries, await interruptionItemHttpService.getInterruptionSummaries());
    },
    async [ActionKey.CreateInterruptionItem](context: ActionAugments, payload: InterruptionItem): Promise<boolean> {
        const item = await interruptionItemHttpService.createInterruptionItem(payload);

        if (item) {
            context.commit(MutationKey.SetEditingItem, item);
        }

        return Boolean(item);
    },
    [ActionKey.StartInterruptionItemCreation](context: ActionAugments): void {
        context.dispatch(ActionKey.EndInterruptionItemEdit);
        setTimeout(() => context.commit(MutationKey.SetEditingItem, new InterruptionItem(-1)));
    },
    async [ActionKey.StartInterruptionItemEdit](context: ActionAugments, payload: number): Promise<boolean> {
        const item = await interruptionItemHttpService.getInterruptionItem(payload);

        if (item) {
            context.dispatch(ActionKey.EndInterruptionItemEdit);
            setTimeout(() => context.commit(MutationKey.SetEditingItem, item));
        }

        return Boolean(item);
    },
    [ActionKey.EndInterruptionItemEdit](context: ActionAugments): void {
        context.commit(MutationKey.SetEditingItem, null);
    }
};
