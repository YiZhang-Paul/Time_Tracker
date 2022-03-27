import { TokenResponse } from './token-response';
import { UserProfile } from './user-profile';

export class SignInResponse {
    public tokens!: TokenResponse;
    public profile!: UserProfile;
}
