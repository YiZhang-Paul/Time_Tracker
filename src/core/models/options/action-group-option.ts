import { IconConfig } from '../generic/icon-config';

export class ActionGroupOption<T = unknown> {
    public name: string;
    public icon: IconConfig;
    public data: T | null;
    public isActive: boolean;

    constructor(name: string, icon: IconConfig, data: T | null = null, isActive = false) {
        this.name = name;
        this.icon = icon;
        this.data = data;
        this.isActive = isActive;
    }
}
