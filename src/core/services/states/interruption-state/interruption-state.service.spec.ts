import { assert as sinonExpect, createStubInstance, SinonStubbedInstance } from 'sinon';

import { createStore } from '../../../../store';
import { types } from '../../../ioc/types';
import { container } from '../../../ioc/container';
import { InterruptionItemSummaryDto } from '../../../dtos/interruption-item-summary-dto';
import { InterruptionItem } from '../../../models/interruption/interruption-item';
import { Priority } from '../../../enums/priority.enum';
import { InterruptionItemHttpService } from '../../http/interruption-item-http/interruption-item-http.service';

import { InterruptionStateService } from './interruption-state.service';

describe('interruption state service unit test', () => {
    let service: InterruptionStateService;
    let interruptionItemHttpStub: SinonStubbedInstance<InterruptionItemHttpService>;
    let summaries: InterruptionItemSummaryDto[];

    beforeEach(() => {
        interruptionItemHttpStub = createStubInstance(InterruptionItemHttpService);

        container
            .rebind<InterruptionItemHttpService>(types.InterruptionItemHttpService)
            .toConstantValue(interruptionItemHttpStub);

        container
            .rebind<ReturnType<typeof createStore>>(types.Store)
            .toDynamicValue(() => createStore())
            .inTransientScope();

        service = container.get<InterruptionStateService>(types.InterruptionStateService);
    });

    beforeEach(() => {
        summaries = [
            { id: 1, name: 'name_1', priority: Priority.Low },
            { id: 2, name: 'name_2', priority: Priority.High },
            { id: 3, name: 'name_3', priority: Priority.Medium },
            { id: 4, name: 'name_4', priority: Priority.Low }
        ];

        interruptionItemHttpStub.getSummaries.resolves(summaries);
    });

    test('should create service instance', () => {
        expect(service).toBeTruthy();
    });

    describe('searchSummaries', () => {
        beforeEach(async() => {
            await service.loadSummaries();
        });

        test('should return filtered summaries', () => {
            let result = service.searchSummaries('me_5');
            expect(result.map(_ => _.name)).toEqual([]);

            result = service.searchSummaries('me_3');
            expect(result.map(_ => _.name)).toEqual(['name_3']);

            result = service.searchSummaries('ME_4');
            expect(result.map(_ => _.name)).toEqual(['name_4']);
        });

        test('should return sorted summaries', () => {
            const result = service.searchSummaries('');

            expect(result.map(_ => _.name)).toEqual(['name_2', 'name_3', 'name_1', 'name_4']);
        });
    });

    describe('activeSummary', () => {
        test('should return null when not working', async() => {
            await service.loadSummaries();

            expect(service.activeSummary).toBeNull();
        });
    });

    describe('loadSummaries', () => {
        test('should load interruption summaries', async() => {
            await service.loadSummaries();

            sinonExpect.calledOnce(interruptionItemHttpStub.getSummaries);
            expect(service.searchSummaries('').length).toEqual(summaries.length);
        });
    });

    describe('createItem', () => {
        test('should do nothing on failure', async() => {
            const item = new InterruptionItem(-1);
            interruptionItemHttpStub.createItem.resolves(null);
            expect(service.editingItem).toBeFalsy();

            const result = await service.createItem(item);

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.createItem, item);
            expect(service.editingItem).toBeFalsy();
            expect(result).toEqual(false);
        });

        test('should open created item on success', async() => {
            const item = new InterruptionItem(-1);
            interruptionItemHttpStub.createItem.resolves(item);
            expect(service.editingItem).toBeFalsy();

            const result = await service.createItem(item);

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.createItem, item);
            expect(service.editingItem).toEqual(item);
            expect(result).toEqual(true);
        });
    });

    describe('updateItem', () => {
        test('should do nothing on failure', async() => {
            const previous: InterruptionItem = { ...new InterruptionItem(1), name: 'previous_name' };
            const current: InterruptionItem = { ...new InterruptionItem(1), name: 'current_name' };
            interruptionItemHttpStub.getItem.resolves(previous);
            interruptionItemHttpStub.updateItem.resolves(null);
            await service.startItemEdit(previous.id);
            jest.advanceTimersToNextTimer();

            const result = await service.updateItem(current);

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.updateItem, current);
            expect(service.editingItem).toEqual(previous);
            expect(result).toEqual(false);
        });

        test('should not open updated item on success when nothing is opened', async() => {
            const item = new InterruptionItem(1);
            interruptionItemHttpStub.updateItem.resolves(item);
            expect(service.editingItem).toBeFalsy();

            const result = await service.updateItem(item);

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.updateItem, item);
            expect(service.editingItem).toBeFalsy();
            expect(result).toEqual(true);
        });

        test('should not open updated item on success when another item is opened', async() => {
            const current = new InterruptionItem(1);
            const other = new InterruptionItem(2);
            interruptionItemHttpStub.getItem.resolves(other);
            interruptionItemHttpStub.updateItem.resolves(current);
            await service.startItemEdit(other.id);
            jest.advanceTimersToNextTimer();

            const result = await service.updateItem(current);

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.updateItem, current);
            expect(service.editingItem).toEqual(other);
            expect(result).toEqual(true);
        });

        test('should open updated item on success when already opened', async() => {
            const previous: InterruptionItem = { ...new InterruptionItem(1), name: 'previous_name' };
            const current: InterruptionItem = { ...new InterruptionItem(1), name: 'current_name' };
            interruptionItemHttpStub.getItem.resolves(previous);
            interruptionItemHttpStub.updateItem.resolves(current);
            await service.startItemEdit(previous.id);
            jest.advanceTimersToNextTimer();

            const result = await service.updateItem(current);

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.updateItem, current);
            expect(service.editingItem).toEqual(current);
            expect(result).toEqual(true);
        });
    });

    describe('deleteItem', () => {
        beforeEach(async() => {
            await service.loadSummaries();
        });

        test('should do nothing on failure', async() => {
            const { id } = summaries[1];
            interruptionItemHttpStub.deleteItem.resolves(false);

            const result = await service.deleteItem(id);

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.deleteItem, id);
            expect(service.searchSummaries('').length).toEqual(summaries.length);
            expect(result).toEqual(false);
        });

        test('should remove item on success', async() => {
            const { id } = summaries[1];
            interruptionItemHttpStub.deleteItem.resolves(true);
            expect(service.editingItem).toBeFalsy();

            const result = await service.deleteItem(id);

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.deleteItem, id);
            expect(service.editingItem).toBeFalsy();
            expect(service.searchSummaries('').length).toEqual(summaries.length - 1);
            expect(result).toEqual(true);
        });

        test('should not close editing item when another item is opened', async() => {
            const { id } = summaries[1];
            const other = new InterruptionItem(summaries[2].id);
            interruptionItemHttpStub.getItem.resolves(other);
            interruptionItemHttpStub.deleteItem.resolves(true);
            await service.startItemEdit(other.id);
            jest.advanceTimersToNextTimer();

            const result = await service.deleteItem(id);

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.deleteItem, id);
            expect(service.editingItem).toEqual(other);
            expect(service.searchSummaries('').length).toEqual(summaries.length - 1);
            expect(result).toEqual(true);
        });

        test('should close editing item when it is deleted', async() => {
            const { id } = summaries[1];
            interruptionItemHttpStub.getItem.resolves(new InterruptionItem(id));
            interruptionItemHttpStub.deleteItem.resolves(true);
            await service.startItemEdit(id);
            jest.advanceTimersToNextTimer();

            const result = await service.deleteItem(id);

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.deleteItem, id);
            expect(service.editingItem).toBeFalsy();
            expect(service.searchSummaries('').length).toEqual(summaries.length - 1);
            expect(result).toEqual(true);
        });
    });

    describe('startItemCreate', () => {
        test('should open empty interruption item', () => {
            expect(service.editingItem).toBeFalsy();

            service.startItemCreate();
            jest.advanceTimersToNextTimer();

            expect(service.editingItem).toEqual(new InterruptionItem(-1));
        });
    });

    describe('startItemEdit', () => {
        test('should do nothing on failure', async() => {
            interruptionItemHttpStub.getItem.resolves(null);

            const result = await service.startItemEdit(5);
            jest.advanceTimersToNextTimer();

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.getItem, 5);
            expect(result).toEqual(false);
        });

        test('should open item on success', async() => {
            const item = new InterruptionItem(5);
            interruptionItemHttpStub.getItem.resolves(item);
            expect(service.editingItem).toBeFalsy();

            const result = await service.startItemEdit(5);
            jest.advanceTimersToNextTimer();

            sinonExpect.calledOnceWithExactly(interruptionItemHttpStub.getItem, 5);
            expect(service.editingItem).toEqual(item);
            expect(result).toEqual(true);
        });
    });

    describe('stopItemEdit', () => {
        test('should end interruption item edit', async() => {
            interruptionItemHttpStub.getItem.resolves(new InterruptionItem(1));
            await service.startItemEdit(1);
            jest.advanceTimersToNextTimer();
            expect(service.editingItem).not.toBeFalsy();

            service.stopItemEdit();

            expect(service.editingItem).toBeFalsy();
        });
    });
});
