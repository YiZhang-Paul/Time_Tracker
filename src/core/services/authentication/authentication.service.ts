import axios from 'axios';
import { injectable } from 'inversify';
import { ChangePasswordOptions, DbSignUpOptions, WebAuth } from 'auth0-js';

import { Credentials } from '../../../core/models/generic/credentials';

@injectable()
export class AuthenticationService {
    private readonly authenticator = new WebAuth({
        audience: process.env.VUE_APP_AUTH0_AUDIENCE,
        domain: process.env.VUE_APP_AUTH0_DOMAIN,
        clientID: process.env.VUE_APP_AUTH0_CLIENT_ID,
        scope: 'openid profile email'
    });

    private readonly connection = process.env.VUE_APP_AUTH0_DATABASE;
    private token = '';

    get accessToken(): string {
        return this.token;
    }

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

    public async signIn(credentials: Credentials): Promise<boolean> {
        const endpoint = `${process.env.VUE_APP_BASE_API_URL}/users/sign-in`;
        const { data } = await axios.post(endpoint, credentials);
        this.token = data.access_token;

        return Boolean(this.token);
    }
}
