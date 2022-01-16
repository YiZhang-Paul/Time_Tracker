import { createStubInstance, stub, SinonStubbedInstance } from 'sinon';

import { DialogStateService } from '../core/services/states/dialog-state/dialog-state.service';

export function stubDialogStateService(): SinonStubbedInstance<DialogStateService> {
    const stubbed = createStubInstance(DialogStateService);
    stub(stubbed, 'configs').get(() => []);

    return stubbed;
}
