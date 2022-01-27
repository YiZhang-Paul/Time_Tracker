type Properties = { [key: string]: unknown };

export class DynamicComponentOption<T> {
    public component: T;
    public properties: Properties;

    constructor(component: T, properties: Properties) {
        this.component = component;
        this.properties = properties;
    }
}
