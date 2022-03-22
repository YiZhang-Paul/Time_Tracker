import axios from 'axios';
import { injectable } from 'inversify';
import { ChangePasswordOptions, DbSignUpOptions, WebAuth } from 'auth0-js';

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
            this.authenticator.changePassword(option, _ => resolve(Boolean(_)));
        });
    }

    public async signUp(email: string, password: string): Promise<boolean> {
        return await new Promise(resolve => {
            const option: DbSignUpOptions = { connection: this.connection, email, password };
            this.authenticator.signup(option, _ => resolve(Boolean(_)));
        });
    }

    public async signIn(email: string, password: string): Promise<boolean> {
        const endpoint = `${process.env.VUE_APP_BASE_API_URL}/users/sign-in`;
        const { data } = await axios.post(endpoint, { email, password });
        this.token = data.access_token;

        return Boolean(this.token);
    }
}
