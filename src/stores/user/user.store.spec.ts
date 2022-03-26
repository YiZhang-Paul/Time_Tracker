import { setActivePinia, createPinia } from 'pinia';
import { createStubInstance, SinonStubbedInstance } from 'sinon';

import { AuthenticationService } from '../../core/services/authentication/authentication.service';

import { setServices, useUserStore } from './user.store';

describe('user store unit test', () => {
    let store: ReturnType<typeof useUserStore>;
    let authenticationServiceStub: SinonStubbedInstance<AuthenticationService>;

    beforeEach(() => {
        authenticationServiceStub = createStubInstance(AuthenticationService);
        setServices(authenticationServiceStub);
        setActivePinia(createPinia());
        store = useUserStore();
    });
});
