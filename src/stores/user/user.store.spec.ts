import { setActivePinia, createPinia } from 'pinia';
import { createStubInstance, SinonStubbedInstance } from 'sinon';

import { Credentials } from '../../core/models/authentication/credentials';
import { AuthenticationResult } from '../../core/enums/authentication-result.enum';
import { AuthenticationService } from '../../core/services/authentication/authentication.service';
import { UserHttpService } from '../../core/services/http/user-http/user-http.service';

import { setServices, useUserStore } from './user.store';

describe('user store unit test', () => {
    let store: ReturnType<typeof useUserStore>;
    let authenticationServiceStub: SinonStubbedInstance<AuthenticationService>;
    let userHttpServiceStub: SinonStubbedInstance<UserHttpService>;

    beforeEach(() => {
        authenticationServiceStub = createStubInstance(AuthenticationService);
        userHttpServiceStub = createStubInstance(UserHttpService);
        setServices(authenticationServiceStub, userHttpServiceStub);
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
