export class TaskItem {
    public id!: number;
    public name = '';
    public description = '';
    public effort = 1;
    public creationTime = '';
    public modifiedTime = '';

    constructor(id: number) {
        this.id = id;
    }
}
