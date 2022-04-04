import { UserProfile } from '../user/user-profile';

import { TokenResponse } from './token-response';

export class SignInResponse {
    public tokens!: TokenResponse;
    public profile!: UserProfile;
}
