import { ChecklistEntry } from '../generic/checklist-entry';
import { Priority } from '../../enums/priority.enum';

export class InterruptionItem {
    public id!: number;
    public name: string;
    public description = '';
    public priority = Priority.Low;
    public checklists: ChecklistEntry[] = [];
    public creationTime = '';
    public modifiedTime = '';
    public resolvedTime?: string;

    constructor(id: number, name = '') {
        this.id = id;
        this.name = name;
    }
}
