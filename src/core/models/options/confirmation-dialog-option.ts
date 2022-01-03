export class ConfirmationDialogOption<T = null> {
    public title: string;
    public confirmText: string;
    public cancelText: string;
    public isWarning: boolean;
    public data: T | null;

    constructor(
        title = 'Are you sure?',
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        isWarning = false,
        data: T | null = null
    ) {
        this.title = title;
        this.confirmText = confirmText;
        this.cancelText = cancelText;
        this.isWarning = isWarning;
        this.data = data;
    }
}
