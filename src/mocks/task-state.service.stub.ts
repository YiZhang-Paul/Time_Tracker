import { createStubInstance, stub, SinonStubbedInstance } from 'sinon';

import { TaskStateService } from '../core/services/states/task-state/task-state.service';

export function stubTaskStateService(): SinonStubbedInstance<TaskStateService> {
    const stubbed = createStubInstance(TaskStateService);
    stub(stubbed, 'editingItem').get(() => null);
    stub(stubbed, 'activeSummary').get(() => null);
    stubbed.getSummaries.resolves([]);

    return stubbed;
}
