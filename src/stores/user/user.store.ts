import axios from 'axios';
import { defineStore } from 'pinia';

import { types } from '../../core/ioc/types';
import { container } from '../../core/ioc/container';
import { Credentials } from '../../core/models/authentication/credentials';
import { UserProfile } from '../../core/models/user/user-profile';
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

            const identifier = window.localStorage.getItem('identifier') ?? '';
            const { result, data } = await getAuthenticator().silentSignIn(identifier);
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
                window.localStorage.setItem('identifier', `${data!.profile.id}|${data!.verificationSequence}`);
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
                window.localStorage.removeItem('identifier');
            }
        },
        async sendVerification(): Promise<boolean> {
            return this.idToken ? await getAuthenticator().sendVerification(this.idToken) : false;
        },
        async updateProfile(profile: UserProfile, avatar: Blob | null): Promise<boolean> {
            const updated = await userHttpService.updateProfile(profile, avatar);

            if (updated) {
                this.signInResponse!.profile = updated;
            }

            return Boolean(updated);
        }
    }
});

function getAuthenticator(): AuthenticationService {
    authenticator ??= container.get<AuthenticationService>(types.AuthenticationService);

    return authenticator;
}
