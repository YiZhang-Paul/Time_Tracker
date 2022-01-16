import { createStubInstance, stub, SinonStubbedInstance } from 'sinon';

import { InterruptionStateService } from '../core/services/states/interruption-state/interruption-state.service';

export function stubInterruptionStateService(): SinonStubbedInstance<InterruptionStateService> {
    const stubbed = createStubInstance(InterruptionStateService);
    stub(stubbed, 'editingItem').get(() => null);
    stub(stubbed, 'activeSummary').get(() => null);
    stubbed.getSummaries.resolves([]);

    return stubbed;
}
