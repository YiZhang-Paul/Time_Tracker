import { ButtonType } from '../../enums/button-type.enum';

export class ConfirmationDialogOption<T = null> {
    public title: string;
    public confirmText: string;
    public cancelText: string;
    public type: ButtonType;
    public data: T | null;

    constructor(
        title = 'Are you sure?',
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        type = ButtonType.Default,
        data: T | null = null
    ) {
        this.title = title;
        this.confirmText = confirmText;
        this.cancelText = cancelText;
        this.type = type;
        this.data = data;
    }
}
