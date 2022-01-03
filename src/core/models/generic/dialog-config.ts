import { DialogOption } from './dialog-option';

export class DialogConfig<T, K> {
    public component: T;
    public data: K | null = null;
    public options: DialogOption;

    constructor(component: T, data: K | null = null, options = new DialogOption()) {
        this.component = component;
        this.data = data;
        this.options = options;
    }
}
