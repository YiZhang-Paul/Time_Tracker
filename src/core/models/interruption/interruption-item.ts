import { Priority } from '../../enums/priority.enum';

export class InterruptionItem {
    public id!: number;
    public name = '';
    public description = '';
    public priority = Priority.Low;
    public creationTime = '';
    public modifiedTime = '';

    constructor(id: number) {
        this.id = id;
    }
}
