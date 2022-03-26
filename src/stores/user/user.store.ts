import { defineStore } from 'pinia';

import { types } from '../../core/ioc/types';
import { container } from '../../core/ioc/container';
import { Credentials } from '../../core/models/authentication/credentials';
import { UserProfile } from '../../core/models/authentication/user-profile';
import { SignInResponse } from '../../core/models/authentication/sign-in-response';
import { AuthenticationResult } from '../../core/enums/authentication-result.enum';
import { AuthenticationService } from '../../core/services/authentication/authentication.service';

let authenticator = container.get<AuthenticationService>(types.AuthenticationService);

export const setServices = (authenticationService: AuthenticationService): void => {
    authenticator = authenticationService;
};

export const useUserStore = defineStore('user', {
    state: () => ({
        signInResponse: null as SignInResponse | null
    }),
    getters: {
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
        async signIn(credentials: Credentials): Promise<AuthenticationResult> {
            const { result, data } = await authenticator.signIn(credentials);
            this.signInResponse = data;

            return result;
        },
        async sendVerification(): Promise<boolean> {
            return this.idToken ? await authenticator.sendVerification(this.idToken) : false;
        }
    }
});
