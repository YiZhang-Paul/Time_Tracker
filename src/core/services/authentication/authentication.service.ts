import axios, { AxiosError } from 'axios';
import { injectable } from 'inversify';
import { ChangePasswordOptions, DbSignUpOptions, WebAuth } from 'auth0-js';

import { Credentials } from '../../models/authentication/credentials';
import { SignInResponse } from '../../models/authentication/sign-in-response';
import { AuthenticationResult } from '../../enums/authentication-result.enum';

@injectable()
export class AuthenticationService {
    private readonly connection = process.env.VUE_APP_AUTH0_DATABASE;

    private readonly authenticator = new WebAuth({
        audience: process.env.VUE_APP_AUTH0_AUDIENCE,
        domain: process.env.VUE_APP_AUTH0_DOMAIN,
        clientID: process.env.VUE_APP_AUTH0_CLIENT_ID,
        scope: 'openid profile email'
    });

    public async recover(email: string): Promise<boolean> {
        return await new Promise(resolve => {
            const option: ChangePasswordOptions = { connection: this.connection, email };
            this.authenticator.changePassword(option, _ => resolve(!_));
        });
    }

    public async signUp(credentials: Credentials): Promise<boolean> {
        const option: DbSignUpOptions = {
            connection: this.connection,
            email: credentials.email,
            password: credentials.password
        };

        return await new Promise(resolve => this.authenticator.signup(option, _ => resolve(!_)));
    }

    public async signIn(credentials: Credentials): Promise<{ result: AuthenticationResult; data: SignInResponse | null }> {
        try {
            const endpoint = `${process.env.VUE_APP_BASE_API_URL}/users/sign-in`;
            const { data } = await axios.post(endpoint, credentials);

            return { result: AuthenticationResult.Succeed, data };
        }
        catch (error) {
            const { status, data } = (error as AxiosError).response!;
            const isUnverified = status === 403;
            const result = isUnverified ? AuthenticationResult.Unverified : AuthenticationResult.Failed;

            return { result, data: isUnverified ? data : null };
        }
    }

    public async sendVerification(idToken: string): Promise<boolean> {
        const endpoint = `${process.env.VUE_APP_BASE_API_URL}/users/verification`;
        const headers = { 'Content-Type': 'application/json' };

        return (await axios.post(endpoint, JSON.stringify(idToken), { headers })).data;
    }
}
