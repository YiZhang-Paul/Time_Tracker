import { AxiosError } from 'axios';
import { injectable } from 'inversify';
import { ChangePasswordOptions, DbSignUpOptions, WebAuth } from 'auth0-js';

import { types } from '../../ioc/types';
import { container } from '../../ioc/container';
import { Credentials } from '../../models/authentication/credentials';
import { SignInResponse } from '../../models/authentication/sign-in-response';
import { AuthenticationResult } from '../../enums/authentication-result.enum';
import { UserHttpService } from '../http/user-http/user-http.service';

@injectable()
export class AuthenticationService {
    private readonly connection = process.env.VUE_APP_AUTH0_DATABASE;
    private readonly userHttpService = container.get<UserHttpService>(types.UserHttpService);
    private authenticatorCache!: WebAuth;

    get authenticator(): WebAuth {
        this.authenticatorCache ??= new WebAuth({
            audience: process.env.VUE_APP_AUTH0_AUDIENCE,
            domain: process.env.VUE_APP_AUTH0_DOMAIN,
            clientID: process.env.VUE_APP_AUTH0_CLIENT_ID,
            scope: 'openid profile email'
        });

        return this.authenticatorCache;
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

    public async silentSignIn(identifier: string): Promise<{ result: AuthenticationResult; data: SignInResponse | null }> {
        try {
            return { result: AuthenticationResult.Succeed, data: await this.userHttpService.silentSignIn(identifier) };
        }
        catch {
            return { result: AuthenticationResult.Failed, data: null };
        }
    }

    public async signIn(credentials: Credentials): Promise<{ result: AuthenticationResult; data: SignInResponse | null }> {
        try {
            return { result: AuthenticationResult.Succeed, data: await this.userHttpService.signIn(credentials) };
        }
        catch (error) {
            const { status, data } = (error as AxiosError).response!;
            const isUnverified = status === 403;
            const result = isUnverified ? AuthenticationResult.Unverified : AuthenticationResult.Failed;

            return { result, data: isUnverified ? data : null };
        }
    }

    public signOut(): void {
        this.authenticator.logout({ returnTo: `${window.location.origin}/login` });
    }

    public async sendVerification(idToken: string): Promise<boolean> {
        return await this.userHttpService.sendEmailVerification(idToken);
    }
}
