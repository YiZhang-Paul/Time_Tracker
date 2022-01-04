/* eslint-disable @typescript-eslint/no-explicit-any */
export class DialogOption {
    public width?: string;
    public height?: string;
    public preCancel?: (_: any) => any | Promise<any>;
    public postCancel?: (_: any) => any | Promise<any>;
    public preConfirm?: (_: any) => any | Promise<any>;
    public postConfirm?: (_: any) => any | Promise<any>;
}
