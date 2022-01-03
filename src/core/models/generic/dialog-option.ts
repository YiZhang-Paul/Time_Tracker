/* eslint-disable @typescript-eslint/no-explicit-any */
export class DialogOption {
    public width?: string;
    public height?: string;
    public preCancel?: (_: any) => void | Promise<void>;
    public postCancel?: (_: any) => void | Promise<void>;
    public preConfirm?: (_: any) => void | Promise<void>;
    public postConfirm?: (_: any) => void | Promise<void>;
}
