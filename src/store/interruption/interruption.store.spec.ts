import { assert as sinonExpect, createStubInstance, SinonStubbedInstance } from 'sinon';

import { createStore } from '../../store';
import { GetterKey } from '../../store/interruption/interruption.getters';
import { ActionKey } from '../../store/interruption/interruption.actions';
import { types } from '../../core/ioc/types';
import { container } from '../../core/ioc/container';
import { InterruptionItemSummaryDto } from '../../core/dtos/interruption-item-summary-dto';
import { EventHistory } from '../../core/models/event/event-history';
import { OngoingEventTimeSummary } from '../../core/models/event/ongoing-event-time-summary';
import { InterruptionItem } from '../../core/models/interruption/interruption-item';
import { Priority } from '../../core/enums/priority.enum';
import { EventType } from '../../core/enums/event-type.enum';
import { InterruptionItemHttpService } from '../../core/services/http/interruption-item-http/interruption-item-http.service';

describe('interruption store unit test', () => {
    let store: ReturnType<typeof createStore>;
    let interruptionItemHttpStub: SinonStubbedInstance<InterruptionItemHttpService>;
    let summaries: InterruptionItemSummaryDto[];

    beforeEach(() => {
        interruptionItemHttpStub = createStubInstance(InterruptionItemHttpService);

        container
            .rebind<InterruptionItemHttpService>(types.InterruptionItemHttpService)
            .toConstantValue(interruptionItemHttpStub as unknown as InterruptionItemHttpService);

        store = createStore();
    });

    beforeEach(() => {
        summaries = [
            { id: 1, name: 'name_1', priority: Priority.Low },
            { id: 2, name: 'name_2', priority: Priority.High },
            { id: 3, name: 'name_3', priority: Priority.Medium },
            { id: 4, name: 'name_4', priority: Priority.Low }
        ];

        interruptionItemHttpStub.getInterruptionSummaries.resolves(summaries);
    });

    describe(GetterKey.Summaries, () => {
        beforeEach(() => {
            store.interruption.commit(store.interruption.mutation.SetSummaries, summaries);
        });

        test('should return filtered summaries', () => {
            let result = store.interruption.getters(store.interruption.getter.Summaries)('me_5');
            expect(result.map(_ => _.name)).toEqual([]);

            result = store.interruption.getters(store.interruption.getter.Summaries)('me_3');
            expect(result.map(_ => _.name)).toEqual(['name_3']);

            result = store.interruption.getters(store.interruption.getter.Summaries)('ME_4');
            expect(result.map(_ => _.name)).toEqual(['name_4']);
        });

        test('should return sorted summaries', () => {
            const result = store.interruption.getters(store.interruption.getter.Summaries)('');

            expect(result.map(_ => _.name)).toEqual(['name_2', 'name_3', 'name_1', 'name_4']);
        });
    });

    describe(GetterKey.ActiveSummary, () => {
        beforeEach(() => {
            store.interruption.commit(store.interruption.mutation.SetSummaries, summaries);
        });

        test('should return null when not working', () => {
            store.event.commit(store.event.mutation.SetOngoingEventSummary, null);

            expect(store.interruption.getters(store.interruption.getter.ActiveSummary)).toBeNull();
        });

        test('should return null when no interruption item is active', () => {
            const summary = new OngoingEventTimeSummary();
            summary.unconcludedSinceStart = { ...new EventHistory(), eventType: EventType.Task, resourceId: 2 };
            store.event.commit(store.event.mutation.SetOngoingEventSummary, summary);

            expect(store.interruption.getters(store.interruption.getter.ActiveSummary)).toBeNull();
        });

        test('should return active summary found', () => {
            const summary = new OngoingEventTimeSummary();
            summary.unconcludedSinceStart = { ...new EventHistory(), eventType: EventType.Interruption, resourceId: 2 };
            store.event.commit(store.event.mutation.SetOngoingEventSummary, summary);

            expect(store.interruption.getters(store.interruption.getter.ActiveSummary)).toEqual(summaries[1]);
        });
    });

    describe(ActionKey.LoadSummaries, () => {
        test('should load interruption summaries', async() => {
            await store.interruption.dispatch(store.interruption.action.LoadSummaries);

            sinonExpect.calledOnce(interruptionItemHttpStub.getInterruptionSummaries);
            expect(store.interruption.getters(store.interruption.getter.Summaries)('').length).toEqual(summaries.length);
        });
    });

    describe(ActionKey.CreateItem, () => {
        test('should do nothing on failure', async() => {
            const item = new InterruptionItem(-1);
            interruptionItemHttpStub.createItem.resolves(null);
            expect(store.interruption.getters(store.interruption.getter.EditingItem)).toBeFalsy();

            const result = await store.interruption.dispatch(store.interruption.action.CreateItem, item);

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.createItem, item);
            expect(store.interruption.getters(store.interruption.getter.EditingItem)).toBeFalsy();
            expect(result).toEqual(false);
        });

        test('should open created item on success', async() => {
            const item = new InterruptionItem(-1);
            interruptionItemHttpStub.createItem.resolves(item);
            expect(store.interruption.getters(store.interruption.getter.EditingItem)).toBeFalsy();

            const result = await store.interruption.dispatch(store.interruption.action.CreateItem, item);

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.createItem, item);
            expect(store.interruption.getters(store.interruption.getter.EditingItem)).toEqual(item);
            expect(result).toEqual(true);
        });
    });

    describe(ActionKey.UpdateItem, () => {
        test('should do nothing on failure', async() => {
            const previous: InterruptionItem = { ...new InterruptionItem(1), name: 'previous_name' };
            const current: InterruptionItem = { ...new InterruptionItem(1), name: 'current_name' };
            interruptionItemHttpStub.updateItem.resolves(null);
            store.interruption.commit(store.interruption.mutation.SetEditingItem, previous);

            const result = await store.interruption.dispatch(store.interruption.action.UpdateItem, current);

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.updateItem, current);
            expect(store.interruption.getters(store.interruption.getter.EditingItem)).toEqual(previous);
            expect(result).toEqual(false);
        });

        test('should not open updated item on success when nothing is opened', async() => {
            const item = new InterruptionItem(1);
            interruptionItemHttpStub.updateItem.resolves(item);
            expect(store.interruption.getters(store.interruption.getter.EditingItem)).toBeFalsy();

            const result = await store.interruption.dispatch(store.interruption.action.UpdateItem, item);

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.updateItem, item);
            expect(store.interruption.getters(store.interruption.getter.EditingItem)).toBeFalsy();
            expect(result).toEqual(true);
        });

        test('should not open updated item on success when another item is opened', async() => {
            const current = new InterruptionItem(1);
            const other = new InterruptionItem(2);
            interruptionItemHttpStub.updateItem.resolves(current);
            store.interruption.commit(store.interruption.mutation.SetEditingItem, other);

            const result = await store.interruption.dispatch(store.interruption.action.UpdateItem, current);

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.updateItem, current);
            expect(store.interruption.getters(store.interruption.getter.EditingItem)).toEqual(other);
            expect(result).toEqual(true);
        });

        test('should open updated item on success when already opened', async() => {
            const previous: InterruptionItem = { ...new InterruptionItem(1), name: 'previous_name' };
            const current: InterruptionItem = { ...new InterruptionItem(1), name: 'current_name' };
            interruptionItemHttpStub.updateItem.resolves(current);
            store.interruption.commit(store.interruption.mutation.SetEditingItem, previous);

            const result = await store.interruption.dispatch(store.interruption.action.UpdateItem, current);

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.updateItem, current);
            expect(store.interruption.getters(store.interruption.getter.EditingItem)).toEqual(current);
            expect(result).toEqual(true);
        });
    });

    describe(ActionKey.StartItemCreate, () => {
        test('should open empty interruption item', () => {
            store.interruption.commit(store.interruption.mutation.SetEditingItem, new InterruptionItem(1));

            store.interruption.dispatch(store.interruption.action.StartItemCreate);
            jest.advanceTimersToNextTimer();

            expect(store.interruption.getters(store.interruption.getter.EditingItem)).toEqual(new InterruptionItem(-1));
        });
    });

    describe(ActionKey.DeleteItem, () => {
        beforeEach(() => {
            store.interruption.commit(store.interruption.mutation.SetSummaries, summaries.slice());
        });

        test('should do nothing on failure', async() => {
            const { id } = summaries[1];
            interruptionItemHttpStub.deleteItem.resolves(false);

            const result = await store.interruption.dispatch(store.interruption.action.DeleteItem, id);

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.deleteItem, id);
            expect(store.interruption.getters(store.interruption.getter.Summaries)('').length).toEqual(summaries.length);
            expect(result).toEqual(false);
        });

        test('should remove item on success', async() => {
            const { id } = summaries[1];
            interruptionItemHttpStub.deleteItem.resolves(true);
            expect(store.interruption.getters(store.interruption.getter.EditingItem)).toBeFalsy();

            const result = await store.interruption.dispatch(store.interruption.action.DeleteItem, id);

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.deleteItem, id);
            expect(store.interruption.getters(store.interruption.getter.EditingItem)).toBeFalsy();
            expect(store.interruption.getters(store.interruption.getter.Summaries)('').length).toEqual(summaries.length - 1);
            expect(result).toEqual(true);
        });

        test('should not close editing item when another item is opened', async() => {
            const { id } = summaries[1];
            const other = new InterruptionItem(summaries[2].id);
            interruptionItemHttpStub.deleteItem.resolves(true);
            store.interruption.commit(store.interruption.mutation.SetEditingItem, other);

            const result = await store.interruption.dispatch(store.interruption.action.DeleteItem, id);

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.deleteItem, id);
            expect(store.interruption.getters(store.interruption.getter.EditingItem)).toEqual(other);
            expect(store.interruption.getters(store.interruption.getter.Summaries)('').length).toEqual(summaries.length - 1);
            expect(result).toEqual(true);
        });

        test('should close editing item when it is deleted', async() => {
            const { id } = summaries[1];
            interruptionItemHttpStub.deleteItem.resolves(true);
            store.interruption.commit(store.interruption.mutation.SetEditingItem, new InterruptionItem(id));

            const result = await store.interruption.dispatch(store.interruption.action.DeleteItem, id);

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.deleteItem, id);
            expect(store.interruption.getters(store.interruption.getter.EditingItem)).toBeFalsy();
            expect(store.interruption.getters(store.interruption.getter.Summaries)('').length).toEqual(summaries.length - 1);
            expect(result).toEqual(true);
        });
    });

    describe(ActionKey.StartItemEdit, () => {
        test('should do nothing on failure', async() => {
            interruptionItemHttpStub.getInterruptionItem.resolves(null);

            const result = await store.interruption.dispatch(store.interruption.action.StartItemEdit, 5);
            jest.advanceTimersToNextTimer();

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.getInterruptionItem, 5);
            expect(result).toEqual(false);
        });

        test('should open item on success', async() => {
            const item = new InterruptionItem(5);
            interruptionItemHttpStub.getInterruptionItem.resolves(item);
            expect(store.interruption.getters(store.interruption.getter.EditingItem)).toBeFalsy();

            const result = await store.interruption.dispatch(store.interruption.action.StartItemEdit, 5);
            jest.advanceTimersToNextTimer();

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.getInterruptionItem, 5);
            expect(store.interruption.getters(store.interruption.getter.EditingItem)).toEqual(item);
            expect(result).toEqual(true);
        });
    });

    describe(ActionKey.StopItemEdit, () => {
        test('should end interruption item edit', () => {
            store.interruption.commit(store.interruption.mutation.SetEditingItem, new InterruptionItem(1));

            store.interruption.dispatch(store.interruption.action.StopItemEdit);

            expect(store.interruption.getters(store.interruption.getter.EditingItem)).toBeFalsy();
        });
    });
});
