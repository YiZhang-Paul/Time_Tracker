export class TaskItem {
    public id!: number;
    public name: string;
    public description = '';
    public effort = 1;
    public creationTime = '';
    public modifiedTime = '';
    public resolvedTime?: string;

    constructor(id: number, name = '') {
        this.id = id;
        this.name = name;
    }
}
