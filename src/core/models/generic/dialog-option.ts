export class DialogOption {
    public width?: string;
    public height?: string;
    public preCancel?: <T>(_: T) => void | Promise<void>;
    public postCancel?: <T>(_: T) => void | Promise<void>;
    public preConfirm?: <T>(_: T) => void | Promise<void>;
    public postConfirm?: <T>(_: T) => void | Promise<void>;
}
