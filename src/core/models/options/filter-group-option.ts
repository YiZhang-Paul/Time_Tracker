import { IconConfig } from '../generic/icon-config';

export class FilterGroupOption<T = unknown> {
    public name: string;
    public icon: IconConfig;
    public data: T | null;
    public isActive: boolean;

    constructor(name: string, icon: IconConfig, data: T | null = null, isActive = true) {
        this.name = name;
        this.icon = icon;
        this.data = data;
        this.isActive = isActive;
    }
}
