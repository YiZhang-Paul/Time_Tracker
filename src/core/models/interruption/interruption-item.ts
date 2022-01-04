export class InterruptionItem {
    public id!: number;
    public name = '';
    public description = '';
    public priority = 0;
    public creationTime = '';
    public modifiedTime = '';

    constructor(id: number) {
        this.id = id;
    }
}
