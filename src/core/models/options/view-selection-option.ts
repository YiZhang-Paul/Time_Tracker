export class ViewSelectionOption {
    public name: string;
    public route: string;
    public icon: unknown;

    constructor(name: string, route: string, icon: unknown) {
        this.name = name;
        this.route = route;
        this.icon = icon;
    }
}
