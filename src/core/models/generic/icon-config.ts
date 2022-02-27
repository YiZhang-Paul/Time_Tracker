export class IconConfig {
    public component: unknown;
    public color: string;

    constructor(component: unknown, color = 'var(--font-colors-0-00)') {
        this.component = component;
        this.color = color;
    }
}
