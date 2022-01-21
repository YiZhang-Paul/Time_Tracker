export class BreakSessionConfirmationDto {
    public isSkip: boolean;
    public targetDuration: number;

    constructor(isSkip = true, targetDuration = -1) {
        this.isSkip = isSkip;
        this.targetDuration = targetDuration;
    }
}
