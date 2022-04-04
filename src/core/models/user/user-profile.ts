import { TimeSessionOptions } from './time-session-options';

export class UserProfile {
    public id!: number;
    public email!: string;
    public displayName!: string;
    public avatarUrl!: string;
    public creationTime!: string;
    public timeSessionOptions = new TimeSessionOptions();
}
