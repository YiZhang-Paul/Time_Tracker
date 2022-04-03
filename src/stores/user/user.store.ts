import axios from 'axios';
import { defineStore } from 'pinia';

import { types } from '../../core/ioc/types';
import { container } from '../../core/ioc/container';
import { Credentials } from '../../core/models/authentication/credentials';
import { UserProfile } from '../../core/models/authentication/user-profile';
import { SignInResponse } from '../../core/models/authentication/sign-in-response';
import { AuthenticationResult } from '../../core/enums/authentication-result.enum';
import { AuthenticationService } from '../../core/services/authentication/authentication.service';
import { UserHttpService } from '../../core/services/http/user-http/user-http.service';

let authenticator: AuthenticationService;
let userHttpService = container.get<UserHttpService>(types.UserHttpService);

export const setServices = (authenticationService: AuthenticationService, userHttp: UserHttpService): void => {
    authenticator = authenticationService;
    userHttpService = userHttp;
};

export const useUserStore = defineStore('user', {
    state: () => ({
        signInResponse: null as SignInResponse | null
    }),
    getters: {
        isLoggedIn(): boolean {
            return Boolean(this.idToken) && Boolean(this.accessToken) && Boolean(this.profile);
        },
        idToken(): string {
            return this.signInResponse?.tokens.id_token ?? '';
        },
        accessToken(): string {
            return this.signInResponse?.tokens.access_token ?? '';
        },
        profile(): UserProfile | null {
            return this.signInResponse?.profile ?? null;
        }
    },
    actions: {
        async silentSignIn(): Promise<AuthenticationResult> {
            if (!window.localStorage) {
                return AuthenticationResult.Failed;
            }

            const id = window.localStorage.getItem('userId');
            const { result, data } = await getAuthenticator().silentSignIn(Number(id));
            this.signInResponse = data;

            if (result === AuthenticationResult.Succeed) {
                axios.defaults.headers.common.Authorization = `Bearer ${this.accessToken}`;
            }

            return result;
        },
        async signIn(credentials: Credentials): Promise<AuthenticationResult> {
            const { result, data } = await getAuthenticator().signIn(credentials);
            this.signInResponse = data;

            if (result === AuthenticationResult.Succeed && window.localStorage) {
                window.localStorage.setItem('userId', `${data!.profile.id}`);
            }

            if (result === AuthenticationResult.Succeed) {
                axios.defaults.headers.common.Authorization = `Bearer ${this.accessToken}`;
            }

            return result;
        },
        signOut(): void {
            getAuthenticator().signOut();
            this.$reset();

            if (window.localStorage) {
                window.localStorage.removeItem('userId');
            }
        },
        async sendVerification(): Promise<boolean> {
            return this.idToken ? await getAuthenticator().sendVerification(this.idToken) : false;
        },
        async updateProfile(profile: UserProfile): Promise<boolean> {
            const isUpdated = await userHttpService.updateProfile(profile);

            if (isUpdated) {
                this.signInResponse!.profile = profile;
            }

            return isUpdated;
        }
    }
});

function getAuthenticator(): AuthenticationService {
    authenticator ??= container.get<AuthenticationService>(types.AuthenticationService);

    return authenticator;
}
