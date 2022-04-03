import axios from 'axios';
import { injectable } from 'inversify';

import { Credentials } from '../../../models/authentication/credentials';
import { SignInResponse } from '../../../models/authentication/sign-in-response';

@injectable()
export class UserHttpService {
    private readonly _api = `${process.env.VUE_APP_BASE_API_URL}/users`;

    public async silentSignIn(userId: number): Promise<SignInResponse | null> {
        const endpoint = `${this._api}/silent-sign-in`;
        const headers = { 'Content-Type': 'application/json' };

        return (await axios.post(endpoint, JSON.stringify(userId), { headers })).data;
    }

    public async signIn(credentials: Credentials): Promise<SignInResponse | null> {
        return (await axios.post(`${this._api}/sign-in`, credentials)).data;
    }

    public async sendEmailVerification(idToken: string): Promise<boolean> {
        const endpoint = `${this._api}/verification`;
        const headers = { 'Content-Type': 'application/json' };

        return (await axios.post(endpoint, JSON.stringify(idToken), { headers })).data;
    }
}
