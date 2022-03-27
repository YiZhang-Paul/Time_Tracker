import { setActivePinia, createPinia } from 'pinia';
import { createStubInstance, SinonStubbedInstance } from 'sinon';

import { Credentials } from '../../core/models/authentication/credentials';
import { AuthenticationResult } from '../../core/enums/authentication-result.enum';
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

    describe('idToken', () => {
        test('should return empty string when no token exist', async() => {
            authenticationServiceStub.signIn.resolves({ result: AuthenticationResult.Failed, data: null });
            await store.signIn(new Credentials());

            expect(store.idToken).toEqual('');
        });
    });
});
