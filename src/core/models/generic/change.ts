export class Change<T> {
    public source: T;
    public target: T;

    constructor(source: T, target: T) {
        this.source = source;
        this.target = target;
    }
}
