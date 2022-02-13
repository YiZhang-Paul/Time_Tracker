export class ChecklistEntry {
    public description: string;
    public isCompleted: boolean;

    constructor(description = '', isCompleted = false) {
        this.description = description;
        this.isCompleted = isCompleted;
    }
}
