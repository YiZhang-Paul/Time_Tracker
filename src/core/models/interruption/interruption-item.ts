import { Priority } from '../../enums/priority.enum';

export class InterruptionItem {
    public id!: number;
    public name: string;
    public description = '';
    public priority = Priority.Low;
    public creationTime = '';
    public modifiedTime = '';

    constructor(id: number, name = '') {
        this.id = id;
        this.name = name;
    }
}
