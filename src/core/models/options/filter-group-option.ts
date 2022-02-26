import { IconConfig } from '../generic/icon-config';

export class FilterGroupOption {
    public name: string;
    public icon: IconConfig;
    public isActive: boolean;

    constructor(name: string, icon: IconConfig, isActive = true) {
        this.name = name;
        this.icon = icon;
        this.isActive = isActive;
    }
}
