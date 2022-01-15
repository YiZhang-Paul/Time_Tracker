import { createStubInstance, stub, SinonStubbedInstance } from 'sinon';

import { EventStateService } from '../core/services/states/event-state/event-state.service';

export function stubEventStateService(): SinonStubbedInstance<EventStateService> {
    const stubbed = createStubInstance(EventStateService);
    stub(stubbed, 'isWorking').get(() => false);
    stub(stubbed, 'isNotWorking').get(() => false);
    stub(stubbed, 'isScheduledBreakNeeded').get(() => false);
    stub(stubbed, 'workingDuration').get(() => 0);
    stub(stubbed, 'notWorkingDuration').get(() => 0);
    stub(stubbed, 'workingDurationLimit').get(() => 0);

    return stubbed;
}
