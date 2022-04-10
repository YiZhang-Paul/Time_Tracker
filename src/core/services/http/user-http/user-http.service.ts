import axios from 'axios';
import { injectable } from 'inversify';

import { Credentials } from '../../../models/authentication/credentials';
import { UserProfile } from '../../../models/user/user-profile';
import { SignInResponse } from '../../../models/authentication/sign-in-response';

@injectable()
export class UserHttpService {
    private readonly _api = `${process.env.VUE_APP_BASE_API_URL}/users`;

    public async silentSignIn(identifier: string): Promise<SignInResponse | null> {
        const endpoint = `${this._api}/silent-sign-in`;
        const headers = { 'Content-Type': 'application/json' };

        return (await axios.post(endpoint, identifier, { headers })).data;
    }

    public async signIn(credentials: Credentials): Promise<SignInResponse | null> {
        return (await axios.post(`${this._api}/sign-in`, credentials)).data;
    }

    public async sendEmailVerification(idToken: string): Promise<boolean> {
        const endpoint = `${this._api}/verification`;
        const headers = { 'Content-Type': 'application/json' };

        return (await axios.post(endpoint, JSON.stringify(idToken), { headers })).data;
    }

    public async updateProfile(profile: UserProfile, avatar: Blob | null = null): Promise<UserProfile | null> {
        try {
            const data = new FormData();
            data.append('profile', JSON.stringify(profile));

            if (avatar) {
                data.append('avatar', avatar);
            }

            return (await axios.put(`${this._api}/profile`, data)).data;
        }
        catch {
            return null;
        }
    }
}
