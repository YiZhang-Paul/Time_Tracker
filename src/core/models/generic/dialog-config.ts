import { DialogOption } from './dialog-option';

export class DialogConfig<T, K> {
    public component: T;
    public data: K | null = null;
    public option?: DialogOption;

    constructor(component: T, data: K | null = null, option?: DialogOption) {
        this.component = component;
        this.data = data;
        this.option = option;
    }
}
