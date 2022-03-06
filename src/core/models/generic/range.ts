export class Range<T> {
    public start: T;
    public end: T;

    constructor(start: T, end: T) {
        this.start = start;
        this.end = end;
    }
}
