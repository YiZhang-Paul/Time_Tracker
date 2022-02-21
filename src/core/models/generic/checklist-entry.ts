export class ChecklistEntry {
    public rank: string;
    public description: string;
    public isCompleted: boolean;

    constructor(rank: string, description = '', isCompleted = false) {
        this.rank = rank;
        this.description = description;
        this.isCompleted = isCompleted;
    }
}
